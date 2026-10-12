from datetime import datetime, timedelta


def compute_data_quality_score(transactions: list) -> float:
    """Compute data quality score based on confirmed income transactions in next 14 days.

    Args:
        transactions (list): List of transaction dicts, each with date (datetime),
            type (str), amount (float), confirmed (bool).

    Returns:
        float: Data quality score between 0.0 and 1.0 (defaults to 0.3 if none found).
    """
    today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    window_end = today + timedelta(days=14)

    income_txs = [
        t for t in transactions
        if t.get("type") == "income" and today <= t["date"] < window_end
    ]

    if not income_txs:
        return 0.3

    confirmed_count = sum(1 for t in income_txs if t.get("confirmed", False))
    return float(confirmed_count / len(income_txs))


def compute_uncertainty_bands(forecast_curve: list, data_quality_score: float) -> list:
    """Enrich forecast curve with lower and upper uncertainty bounds.

    Args:
        forecast_curve (list): The curve list from forecast_cash_flow.
        data_quality_score (float): Score between 0 and 1.

    Returns:
        list: Enriched curve list with lower_bound and upper_bound on every item.
    """
    enriched_curve = []
    day_index = 0

    for item in forecast_curve:
        enriched_item = dict(item)
        balance = float(item["balance"])

        if not item.get("is_forecast", False):
            enriched_item["lower_bound"] = balance
            enriched_item["upper_bound"] = balance
        else:
            band_width = 8000.0 * (1.0 + day_index * 0.05) * (1.0 + (1.0 - data_quality_score) * 0.8)
            enriched_item["lower_bound"] = balance - band_width
            enriched_item["upper_bound"] = balance + band_width
            day_index += 1

        enriched_curve.append(enriched_item)

    return enriched_curve


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from csv_loader import load_ledger
    from forecaster import forecast_cash_flow

    for scenario in ["normal", "stressed", "crisis"]:
        ledger = load_ledger(scenario)
        result = forecast_cash_flow(ledger)
        score = compute_data_quality_score(ledger["transactions"])
        enriched = compute_uncertainty_bands(result["curve"], score)

        forecast_days = [d for d in enriched if d["is_forecast"]]
        day_0 = forecast_days[0]
        day_14 = forecast_days[14]
        day_29 = forecast_days[29]

        print(f"[{scenario.upper()}] data_quality={score:.2f}")
        print(f"  Day 0  band: ±{(day_0['upper_bound'] - day_0['balance']):.0f}")
        print(f"  Day 14 band: ±{(day_14['upper_bound'] - day_14['balance']):.0f}")
        print(f"  Day 29 band: ±{(day_29['upper_bound'] - day_29['balance']):.0f}")
