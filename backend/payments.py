"""Provider-backed payment boundary; no provider is called in demo mode."""
from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Protocol

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


class PaymentProvider(Protocol):
    def schedule(self, *, claim_id: str, amount: float, currency: str, method: str, idempotency_key: str) -> PaymentInstruction: ...
    def mark_sent(self, *, instruction: PaymentInstruction) -> PaymentInstruction: ...


class MockPaymentProvider:
    def schedule(self, *, claim_id: str, amount: float, currency: str, method: str, idempotency_key: str) -> PaymentInstruction:
        return PaymentInstruction("mock", f"PMT_{claim_id}_V1", idempotency_key, amount, currency, "SCHEDULED", True)

    def mark_sent(self, *, instruction: PaymentInstruction) -> PaymentInstruction:
        return PaymentInstruction(instruction.provider, instruction.provider_id, instruction.idempotency_key, instruction.amount, instruction.currency, "SENT", True)


class StripePaymentProvider:
    def __init__(self, settings: Settings) -> None:
        if not settings.stripe_secret_key:
            raise ConfigurationError("STRIPE_SECRET_KEY is required for Stripe payments")
        self.secret_key = settings.stripe_secret_key

    def schedule(self, *, claim_id: str, amount: float, currency: str, method: str, idempotency_key: str) -> PaymentInstruction:
        body = urllib.parse.urlencode({"amount": str(round(amount * 100)), "currency": currency.lower(), "metadata[claim_id]": claim_id, "metadata[method]": method, "payment_method_types[]": "customer_balance"}).encode()
        request = urllib.request.Request("https://api.stripe.com/v1/payment_intents", data=body, method="POST", headers={"Authorization": f"Bearer {self.secret_key}", "Idempotency-Key": idempotency_key, "Content-Type": "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                payload: dict[str, Any] = json.load(response)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            raise RuntimeError("Stripe payment scheduling failed") from exc
        provider_id = payload.get("id")
        if not isinstance(provider_id, str):
            raise TypeError("Stripe returned no payment intent ID")
        return PaymentInstruction("stripe", provider_id, idempotency_key, amount, currency, str(payload.get("status", "requires_confirmation")), False)

    def mark_sent(self, *, instruction: PaymentInstruction) -> PaymentInstruction:
        return instruction


def payment_provider(settings: Settings) -> PaymentProvider:
    if settings.payment_provider == "stripe":
        return StripePaymentProvider(settings)
    if settings.payment_provider == "mock":
        return MockPaymentProvider()
    raise ConfigurationError(f"Unsupported payment provider: {settings.payment_provider}")
