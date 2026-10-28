import unittest

from demo import Policy, Proposal, SimulatedEffectStore, evaluate, process


POLICY = Policy(
    allowed_targets=("sandbox-vendor-a", "sandbox-vendor-b"),
    max_amount="500.00",
)


class CareerDemoTests(unittest.TestCase):
    def test_approved_proposal_materializes_one_simulated_effect(self):
        store = SimulatedEffectStore()
        receipt = process(
            Proposal("p-1", "sandbox-vendor-a", "125.00", "demo invoice"),
            POLICY,
            store,
        )
        self.assertTrue(receipt["decision"]["allowed"])
        self.assertEqual(receipt["effect"]["effect_id"], "simulated:p-1")
        self.assertTrue(store.already_materialized("p-1"))

    def test_duplicate_proposal_is_refused_after_effect(self):
        store = SimulatedEffectStore()
        proposal = Proposal("p-2", "sandbox-vendor-a", "10.00", "demo")
        first = process(proposal, POLICY, store)
        second = process(proposal, POLICY, store)
        self.assertTrue(first["decision"]["allowed"])
        self.assertFalse(second["decision"]["allowed"])
        self.assertEqual(second["decision"]["reason"], "proposal_already_consumed")
        self.assertIsNone(second["effect"])

    def test_disallowed_target_is_refused_without_effect(self):
        store = SimulatedEffectStore()
        receipt = process(
            Proposal("p-3", "not-on-list", "10.00", "demo"),
            POLICY,
            store,
        )
        self.assertFalse(receipt["decision"]["allowed"])
        self.assertEqual(receipt["decision"]["reason"], "target_not_allowed")
        self.assertIsNone(receipt["effect"])

    def test_over_limit_is_refused(self):
        decision = evaluate(
            Proposal("p-4", "sandbox-vendor-a", "500.01", "demo"),
            POLICY,
            (),
        )
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.reason, "amount_exceeds_demo_limit")

    def test_missing_purpose_is_refused(self):
        decision = evaluate(
            Proposal("p-5", "sandbox-vendor-a", "10.00", ""),
            POLICY,
            (),
        )
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.reason, "purpose_required")

    def test_same_inputs_produce_same_receipt_id(self):
        proposal = Proposal("p-6", "sandbox-vendor-b", "42.00", "demo")
        a = process(proposal, POLICY, SimulatedEffectStore())
        b = process(proposal, POLICY, SimulatedEffectStore())
        self.assertEqual(a["receipt_id"], b["receipt_id"])


if __name__ == "__main__":
    unittest.main()
