from datetime import datetime, timedelta


def compute_cash_curve(current_cash: float, transactions: list, today: datetime) -> list:
    """Compute 30 days of future balances starting from today.

    Logic:
        - confirmed income: add full amount
        - confirmed expense: subtract full amount
        - unconfirmed income: add amount * 0.5
        - unconfirmed expense: ignore

    Args:
        current_cash (float): Starting balance.
        transactions (list): List of transaction dicts.
        today (datetime): Base date (midnight).

    Returns:
        list: 30 floats representing daily ending balances.
    """
    balance = float(current_cash)
    curve = []
    for day_offset in range(30):
        day = today + timedelta(days=day_offset)
        day_txs = [t for t in transactions if t["date"].date() == day.date()]
        for tx in day_txs:
            amount = float(tx["amount"])
            is_confirmed = bool(tx.get("confirmed", False))
            tx_type = tx.get("type")

            if tx_type == "income":
                if is_confirmed:
                    balance += amount
                else:
                    balance += amount * 0.5
            elif tx_type == "expense":
                if is_confirmed:
                    balance -= amount
                # unconfirmed expense: ignore

        curve.append(float(balance))
    return curve


def get_shortage_day(cash_curve: list) -> int | None:
    """Return index of first day where balance < 20000, or None."""
    for idx, balance in enumerate(cash_curve):
        if balance < 20000:
            return idx
    return None


def get_risk_level(shortage_day: int | None) -> str:
    """Classify risk level based on shortage day.

    None -> "low"
    shortage_day <= 14 -> "high"
    else -> "medium"
    """
    if shortage_day is None:
        return "low"
    if shortage_day <= 14:
        return "high"
    return "medium"


def simulate_scenarios(ledger: dict, forecast_result: dict) -> list:
    """Simulate 4 cash flow scenarios and evaluate risk levels.

    Args:
        ledger (dict): Ledger dict with current_cash and transactions.
        forecast_result (dict): Result from forecaster with "curve" key.

    Returns:
        list: Exactly 4 scenario dicts with keys:
            name, description, assumption, cash_curve, shortage_day, risk_level
    """
    today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    current_cash = float(ledger["current_cash"])

    # SCENARIO 1 - No Action
    s1_curve = [
        float(item["balance"])
        for item in forecast_result["curve"]
        if item.get("is_forecast")
    ]
    s1_shortage = get_shortage_day(s1_curve)
    s1 = {
        "name": "No Action",
        "description": "Business continues with no changes to payment timings or expenses",
        "assumption": "All transactions proceed exactly as currently scheduled",
        "cash_curve": s1_curve,
        "shortage_day": s1_shortage,
        "risk_level": get_risk_level(s1_shortage),
    }

    # SCENARIO 2 - Collect Overdue Invoice
    txs2 = [dict(t) for t in ledger["transactions"]]
    end_14 = today + timedelta(days=14)
    cands2 = [
        t for t in txs2
        if t.get("type") == "income" and not t.get("confirmed", False) and today <= t["date"] <= end_14
    ]
    if cands2:
        tgt2 = max(cands2, key=lambda x: float(x["amount"]))
        tgt2["date"] = tgt2["date"] - timedelta(days=7)
        tgt2["confirmed"] = True

    s2_curve = compute_cash_curve(current_cash, txs2, today)
    s2_shortage = get_shortage_day(s2_curve)
    s2 = {
        "name": "Collect Overdue Invoice",
        "description": "Follow up on largest outstanding invoice to collect payment 7 days earlier",
        "assumption": "Assumes the customer agrees to pay 7 days ahead of expected date",
        "cash_curve": s2_curve,
        "shortage_day": s2_shortage,
        "risk_level": get_risk_level(s2_shortage),
    }

    # SCENARIO 3 - Postpone Discretionary Expense
    txs3 = [dict(t) for t in ledger["transactions"]]
    end_10 = today + timedelta(days=10)
    for t in txs3:
        if (
            t.get("type") == "expense"
            and t.get("category") == "discretionary"
            and today <= t["date"] <= end_10
        ):
            t["date"] = t["date"] + timedelta(days=14)

    s3_curve = compute_cash_curve(current_cash, txs3, today)
    s3_shortage = get_shortage_day(s3_curve)
    s3 = {
        "name": "Postpone Discretionary Expenses",
        "description": "Delay all non-essential purchases by 14 days to preserve cash",
        "assumption": "Assumes all discretionary purchases can be safely delayed without business impact",
        "cash_curve": s3_curve,
        "shortage_day": s3_shortage,
        "risk_level": get_risk_level(s3_shortage),
    }

    # SCENARIO 4 - Negotiate Supplier Payment
    txs4 = [dict(t) for t in ledger["transactions"]]
    end_7 = today + timedelta(days=7)
    cands4 = [
        t for t in txs4
        if (
            t.get("type") == "expense"
            and t.get("category") == "supplier_payment"
            and today <= t["date"] <= end_7
        )
    ]
    if cands4:
        tgt4 = max(cands4, key=lambda x: float(x["amount"]))
        tgt4["date"] = tgt4["date"] + timedelta(days=10)

    s4_curve = compute_cash_curve(current_cash, txs4, today)
    s4_shortage = get_shortage_day(s4_curve)
    s4 = {
        "name": "Negotiate Supplier Payment",
        "description": "Negotiate with supplier to delay largest payment by 10 days",
        "assumption": "Assumes supplier agrees to a 10 day payment extension",
        "cash_curve": s4_curve,
        "shortage_day": s4_shortage,
        "risk_level": get_risk_level(s4_shortage),
    }

    return [s1, s2, s3, s4]


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from csv_loader import load_ledger
    from forecaster import forecast_cash_flow

    for scenario in ["normal", "stressed", "crisis"]:
        ledger = load_ledger(scenario)
        forecast_result = forecast_cash_flow(ledger)
        scenarios = simulate_scenarios(ledger, forecast_result)

        print(f"\n[{scenario.upper()}]")
        for s in scenarios:
            shortage = f"Day {s['shortage_day']}" if s['shortage_day'] is not None else "None"
            print(f"  {s['name']:<35} risk={s['risk_level']:<6} shortage={shortage}")
