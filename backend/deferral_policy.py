from datetime import datetime, timedelta


def evaluate_deferral(
    forecast_curve: list,
    uncertainty_bands: list,
    data_quality_score: float,
    scenarios: list,
    transactions: list,
) -> dict:
    """Evaluate whether to recommend an action or defer due to low confidence.

    Args:
        forecast_curve (list): Base curve from forecaster.
        uncertainty_bands (list): Enriched curve list with lower/upper bounds.
        data_quality_score (float): Score 0 to 1 based on 14-day confirmed income.
        scenarios (list): 4 scenario dicts from scenario_engine.
        transactions (list): All transactions from original ledger.

    Returns:
        dict: {
            "should_defer": bool,
            "confidence_score": float,
            "reason": str,
            "recommended_scenario": dict or None,
            "missing_evidence": list of str,
        }
    """
    # Step 1 - Get first 14 forecast days only
    forecast_14 = [item for item in uncertainty_bands if item["is_forecast"]][:14]

    # Step 2 - Compute calibration_score
    band_widths = [item["upper_bound"] - item["lower_bound"] for item in forecast_14]
    balances = [item["balance"] for item in forecast_14]
    mean_band = sum(band_widths) / len(band_widths)
    mean_balance = sum(balances) / len(balances)
    if mean_balance <= 0:
        calibration_score = 0.0
    else:
        calibration_score = max(0.0, min(1.0, 1.0 - (mean_band / mean_balance)))

    # Step 3 - Compute confidence
    confidence = (data_quality_score * 0.5) + (calibration_score * 0.5)

    # Step 4 - Decide should_defer
    should_defer = confidence < 0.55

    # Step 5 - Find recommended_scenario
    if should_defer:
        recommended_scenario = None
    else:
        # Priority order: risk_level "low" first, then "medium", then "high"
        # Among same risk level: pick the one with latest shortage_day (None treated as 999)
        risk_map = {"low": 0, "medium": 1, "high": 2}

        def sort_key(s):
            shortage_val = 999 if s["shortage_day"] is None else s["shortage_day"]
            return (risk_map.get(s["risk_level"], 99), -shortage_val)

        recommended_scenario = min(scenarios, key=sort_key)

    # Step 6 - Build missing_evidence list
    today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    window_end = today + timedelta(days=14)
    missing_evidence = []
    for t in transactions:
        if (
            t.get("type") == "income"
            and not t.get("confirmed", False)
            and today <= t["date"] < window_end
        ):
            desc = t.get("description", "")
            amt = float(t.get("amount", 0.0))
            missing_evidence.append(f"Confirm payment status of {desc} — ₹{amt:,.0f}")

    # Step 7 - Build reason string
    if should_defer:
        reason = f"Confidence is {confidence:.0%}. "
        if data_quality_score < 0.5:
            reason += f"Only {data_quality_score:.0%} of expected income in the next 14 days is confirmed."
        else:
            reason += "Forecast uncertainty is too wide relative to current cash position."
    else:
        reason = f"Confidence is {confidence:.0%}. Data quality and forecast reliability are sufficient to make a recommendation."

    return {
        "should_defer": should_defer,
        "confidence_score": float(confidence),
        "reason": reason,
        "recommended_scenario": recommended_scenario,
        "missing_evidence": missing_evidence,
    }


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from csv_loader import load_ledger
    from forecaster import forecast_cash_flow
    from uncertainty import compute_data_quality_score, compute_uncertainty_bands
    from scenario_engine import simulate_scenarios

    for scenario in ["normal", "stressed", "crisis"]:
        ledger = load_ledger(scenario)
        forecast_result = forecast_cash_flow(ledger)
        score = compute_data_quality_score(ledger["transactions"])
        bands = compute_uncertainty_bands(forecast_result["curve"], score)
        scenarios = simulate_scenarios(ledger, forecast_result)
        deferral = evaluate_deferral(
            forecast_result["curve"],
            bands,
            score,
            scenarios,
            ledger["transactions"],
        )

        print(f"\n[{scenario.upper()}]")
        print(f"  should_defer:     {deferral['should_defer']}")
        print(f"  confidence_score: {deferral['confidence_score']:.2f}")
        print(f"  reason:           {deferral['reason']}")
        if deferral["recommended_scenario"]:
            print(f"  recommended:      {deferral['recommended_scenario']['name']}")
        print(f"  missing_evidence: {len(deferral['missing_evidence'])} items")
        for item in deferral["missing_evidence"]:
            print(f"    - {item}")
