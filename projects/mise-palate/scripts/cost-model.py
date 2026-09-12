import json
from pathlib import Path

catalog = json.loads(Path("/home/ubuntu/live-models.json").read_text())["data"]
prices = {model["id"]: model["pricing"] for model in catalog}

assumptions = {
    "completed_cooks_per_active_user_month": 4,
    "gpt_5_mini_input_tokens_per_cook": 11_000,
    "gpt_5_mini_output_tokens_per_cook": 3_400,
    "gpt_5_input_tokens_per_cook": 6_000,
    "gpt_5_output_tokens_per_cook": 3_000,
    "retry_and_variance_buffer": 0.15,
}

mini = prices["gpt-5-mini"]
gpt5 = prices["gpt-5"]
per_cook = (
    assumptions["gpt_5_mini_input_tokens_per_cook"] / 1_000_000 * mini["input_per_1m_usd"]
    + assumptions["gpt_5_mini_output_tokens_per_cook"] / 1_000_000 * mini["output_per_1m_usd"]
    + assumptions["gpt_5_input_tokens_per_cook"] / 1_000_000 * gpt5["input_per_1m_usd"]
    + assumptions["gpt_5_output_tokens_per_cook"] / 1_000_000 * gpt5["output_per_1m_usd"]
)
per_active_user = per_cook * assumptions["completed_cooks_per_active_user_month"] * (1 + assumptions["retry_and_variance_buffer"])
scales = [100, 1_000, 10_000, 100_000]
result = {
    "as_of": "2026-09-12",
    "catalog_source": "/home/ubuntu/live-models.json",
    "pricing_usd_per_1m_tokens": {
        "gpt-5-mini": {"input": mini["input_per_1m_usd"], "output": mini["output_per_1m_usd"]},
        "gpt-5": {"input": gpt5["input_per_1m_usd"], "output": gpt5["output_per_1m_usd"]},
    },
    "assumptions": assumptions,
    "model_cost_per_completed_cook_usd": round(per_cook, 5),
    "model_cost_per_active_user_month_usd": round(per_active_user, 5),
    "monthly_model_cost_by_active_users_usd": {str(scale): round(per_active_user * scale, 2) for scale in scales},
    "exclusions": ["managed hosting", "database", "object storage", "bandwidth", "support", "payments", "tax", "image generation for editorial assets"],
}
Path("docs/cost-model.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
