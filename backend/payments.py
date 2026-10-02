"""Provider-backed payment boundary; real money movement remains disabled until reconciled."""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Protocol

from backend.config import ConfigurationError, Settings


@dataclass(frozen=True)
class PaymentInstruction:
    provider: str
    provider_id: str
    idempotency_key: str
    amount: float
    currency: str
    status: str
    mock: bool


def payment_operation_key(tenant_id: str, claim_id: str, settlement_slot: str) -> str:
    """Stable logical payment identity; retries reuse it, new settlements do not."""
    identity = {
        "version": 1,
        "tenant_id": tenant_id,
        "claim_id": claim_id,
        "settlement_slot": settlement_slot,
    }
    canonical = json.dumps(identity, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return f"claim-payment:v1:{hashlib.sha256(canonical.encode('utf-8')).hexdigest()}"


class PaymentProvider(Protocol):
    def schedule(
        self,
        *,
        claim_id: str,
        amount: float,
        currency: str,
        method: str,
        idempotency_key: str,
    ) -> PaymentInstruction: ...

    def mark_sent(self, *, instruction: PaymentInstruction) -> PaymentInstruction: ...


class MockPaymentProvider:
    def schedule(
        self,
        *,
        claim_id: str,
        amount: float,
        currency: str,
        method: str,
        idempotency_key: str,
    ) -> PaymentInstruction:
        return PaymentInstruction(
            "mock",
            f"PMT_{claim_id}_V1",
            idempotency_key,
            amount,
            currency,
            "SCHEDULED",
            True,
        )

    def mark_sent(self, *, instruction: PaymentInstruction) -> PaymentInstruction:
        return PaymentInstruction(
            instruction.provider,
            instruction.provider_id,
            instruction.idempotency_key,
            instruction.amount,
            instruction.currency,
            "SENT",
            True,
        )


class StripePaymentProvider:
    """Configuration seam only; no claimant-disbursement semantics are claimed yet."""

    def __init__(self, settings: Settings) -> None:
        if not settings.stripe_secret_key:
            raise ConfigurationError("STRIPE_SECRET_KEY is required for Stripe payments")
        self.secret_key = settings.stripe_secret_key

    def schedule(
        self,
        *,
        claim_id: str,
        amount: float,
        currency: str,
        method: str,
        idempotency_key: str,
    ) -> PaymentInstruction:
        raise RuntimeError(
            "Stripe claimant disbursement scheduling is not implemented in this build"
        )

    def mark_sent(self, *, instruction: PaymentInstruction) -> PaymentInstruction:
        raise RuntimeError(
            "Stripe completion requires verified provider reconciliation; manual mark-sent is disabled"
        )


def payment_provider(settings: Settings) -> PaymentProvider:
    if settings.payment_provider == "stripe":
        return StripePaymentProvider(settings)
    if settings.payment_provider == "mock":
        return MockPaymentProvider()
    raise ConfigurationError(f"Unsupported payment provider: {settings.payment_provider}")
