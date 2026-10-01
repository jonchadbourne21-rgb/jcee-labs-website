"""Request contracts and controlled operational enums for the claims API."""
from __future__ import annotations

import base64
from datetime import datetime
from enum import Enum
from typing import Annotated, Any

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

ZipCode = Annotated[str, Field(pattern=r"^\d{5}(?:-\d{4})?$")]
NonNegativeFloat = Annotated[float, Field(ge=0)]


class Peril(str, Enum):
    WATER = "WATER"
    HAIL = "HAIL"
    WIND = "WIND"
    FIRE = "FIRE"


class EvidenceMediaType(str, Enum):
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"


class ApprovalDecision(str, Enum):
    SAVE_REVIEW = "SAVE_REVIEW"
    APPROVE = "APPROVE"


class WorkflowStatus(str, Enum):
    """Canonical lifecycle states persisted on every claim dossier."""

    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    PAYMENT_SCHEDULED = "PAYMENT_SCHEDULED"
    PAID = "PAID"
    CLOSED = "CLOSED"


class TaskPriority(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class TaskStatus(str, Enum):
    OPEN = "OPEN"
    COMPLETED = "COMPLETED"


class NoteVisibility(str, Enum):
    INTERNAL = "INTERNAL"
    POLICYHOLDER = "POLICYHOLDER"


class PaymentAction(str, Enum):
    SCHEDULE = "SCHEDULE"
    MARK_SENT = "MARK_SENT"


class PaymentMethod(str, Enum):
    ACH = "ACH"
    CHECK = "CHECK"


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)


class EvidenceInput(StrictModel):
    media_url: str = Field(validation_alias=AliasChoices("media_url", "url", "filename"), min_length=1, max_length=2048)
    media_type: EvidenceMediaType = EvidenceMediaType.IMAGE
    captured_at: datetime | None = None
    file_name: str | None = Field(default=None, max_length=255)
    label: str | None = Field(default=None, max_length=500)

    @field_validator("media_type", mode="before")
    @classmethod
    def normalize_media_type(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip().upper()
            if normalized.startswith("IMAGE"):
                return EvidenceMediaType.IMAGE
            if normalized.startswith("VIDEO"):
                return EvidenceMediaType.VIDEO
        return value


class EvidenceUploadRequest(StrictModel):
    filename: str = Field(min_length=1, max_length=255)
    media_type: str = Field(min_length=1, max_length=100)
    content_base64: str = Field(min_length=1, max_length=40_000_000)

    @field_validator("content_base64")
    @classmethod
    def valid_base64(cls, value: str) -> str:
        try:
            decoded = base64.b64decode(value, validate=True)
        except ValueError as exc:
            raise ValueError("content_base64 must be valid base64") from exc
        if not decoded:
            raise ValueError("Evidence content cannot be empty")
        if len(decoded) > 25 * 1024 * 1024:
            raise ValueError("Evidence content exceeds the 25 MB limit")
        return value


class HomeownerSubmission(StrictModel):
    incident_description: str = Field(min_length=1, max_length=4000, validation_alias=AliasChoices("incident_description", "incident_brief", "description"))
    property_address: str | None = Field(default=None, validation_alias=AliasChoices("property_address", "loss_address", "address"), max_length=500)
    zip_code: ZipCode = "75201"
    deductible: NonNegativeFloat = 1000.0
    material_age_years: NonNegativeFloat = 4.0
    # Kept for the existing demo UI; numeric pricing uses material_age_years.
    material_age: str | float | None = Field(default=None, validation_alias=AliasChoices("material_age", "materialAge"), max_length=200)
    peril: Peril = Peril.WATER
    homeowner_name: str | None = Field(default=None, validation_alias=AliasChoices("homeowner_name", "insured_name"), max_length=200)
    policy_number: str | None = Field(default=None, max_length=100)
    incident_date: str | None = Field(default=None, validation_alias=AliasChoices("incident_date", "incidentDate"), max_length=32)
    evidence: list[EvidenceInput] = Field(default_factory=list, max_length=50)

    @field_validator("peril", mode="before")
    @classmethod
    def normalize_peril(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip().upper()
            for peril in Peril:
                if peril.value in normalized:
                    return peril
        return value


class AnalyzeRequest(StrictModel):
    """Optional pricing assumptions that supersede the original intake values."""
    zip_code: ZipCode | None = None
    deductible: NonNegativeFloat | None = None
    material_age_years: NonNegativeFloat | None = None


class LineItemAdjustment(StrictModel):
    """A permitted line-level correction. Aggregate totals are never accepted."""
    zone_id: str = Field(validation_alias=AliasChoices("zone_id", "id"), min_length=1, max_length=128)
    quantity: NonNegativeFloat | None = None
    unit_price: NonNegativeFloat | None = None
    rcv: NonNegativeFloat | None = None
    # These two fields are accepted for form round-tripping, then recalculated.
    depreciation: NonNegativeFloat | None = None
    acv: NonNegativeFloat | None = None
    is_covered: bool | None = None
    description: str | None = Field(default=None, min_length=1, max_length=500)

    @model_validator(mode="after")
    def rcv_and_unit_price_are_not_ambiguous(self) -> LineItemAdjustment:
        if self.rcv is not None and self.unit_price is not None:
            raise ValueError("Provide either rcv or unit_price, not both")
        return self


class ApprovalRequest(StrictModel):
    # The existing UI calls /approve without a decision, so its default is APPROVE.
    decision: ApprovalDecision = Field(default=ApprovalDecision.APPROVE, validation_alias=AliasChoices("decision", "action"))
    line_items: list[LineItemAdjustment] = Field(default_factory=list, validation_alias=AliasChoices("line_items", "line_item_overrides", "adjustments"), max_length=100)
    notes: str | None = Field(default=None, validation_alias=AliasChoices("notes", "reviewer_notes"), max_length=4000)
    adjuster_name: str | None = Field(default=None, max_length=200)
    approve: bool | None = None
    # Accepted from the demo UI but deliberately excluded from all pricing logic.
    settlement: dict[str, Any] | None = None

    @field_validator("decision", mode="before")
    @classmethod
    def normalize_decision(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip().upper()
            if normalized in {"SAVE", "REVIEW", "SAVE_REVIEW"}:
                return ApprovalDecision.SAVE_REVIEW
            if normalized in {"APPROVE", "APPROVED"}:
                return ApprovalDecision.APPROVE
        return value

    @model_validator(mode="after")
    def normalize_legacy_approve_flag(self) -> ApprovalRequest:
        if self.approve is True:
            self.decision = ApprovalDecision.APPROVE
        elif self.approve is False and self.decision == ApprovalDecision.APPROVE:
            raise ValueError("approve=false conflicts with decision=APPROVE")
        zone_ids = [item.zone_id for item in self.line_items]
        if len(zone_ids) != len(set(zone_ids)):
            raise ValueError("Only one adjustment per zone_id is allowed")
        return self


class AssignmentRequest(StrictModel):
    """Assign one or both operational adjuster roles on a claim."""

    field_adjuster_id: str | None = Field(default=None, min_length=1, max_length=64)
    desk_adjuster_id: str | None = Field(default=None, min_length=1, max_length=64)

    @model_validator(mode="after")
    def at_least_one_assignment_is_present(self) -> AssignmentRequest:
        if self.field_adjuster_id is None and self.desk_adjuster_id is None:
            raise ValueError("Provide field_adjuster_id and/or desk_adjuster_id")
        return self


class TaskCreateRequest(StrictModel):
    title: str = Field(min_length=1, max_length=200)
    owner_id: str = Field(min_length=1, max_length=64)
    priority: TaskPriority = TaskPriority.NORMAL
    due_at: datetime | None = None


class TaskCompletionRequest(StrictModel):
    actor_id: str = Field(min_length=1, max_length=64)


class NoteCreateRequest(StrictModel):
    author_id: str = Field(min_length=1, max_length=64)
    body: str = Field(min_length=1, max_length=4000)
    visibility: NoteVisibility = NoteVisibility.INTERNAL


class WorkflowStatusRequest(StrictModel):
    status: WorkflowStatus
    actor_id: str = Field(min_length=1, max_length=64)


class PaymentRequest(StrictModel):
    action: PaymentAction
    method: PaymentMethod = PaymentMethod.ACH
    actor_id: str = Field(min_length=1, max_length=64)


class DemoResetRequest(StrictModel):
    zip_code: ZipCode = "75201"
    deductible: NonNegativeFloat = 1000.0
    material_age_years: NonNegativeFloat = 4.0
