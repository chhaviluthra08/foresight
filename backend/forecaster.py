from datetime import datetime, timedelta


def forecast_cash_flow(ledger: dict) -> dict:
    """Forecast 30-day cash flow based on past and upcoming transactions.

    Args:
        ledger (dict): A dict with keys:
            - current_cash: float
            - transactions: list of dicts, each with date (datetime),
              type (str: "income" or "expense"), amount (float),
              category (str), description (str), confirmed (bool)

    Returns:
        dict: {
            "curve": list of {date: str, balance: float, is_forecast: bool},
            "shortage_day": int or None
        }
    """
    today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)

    transactions = ledger.get("transactions", [])
    past_txs = [t for t in transactions if t["date"] < today]
    future_txs = [t for t in transactions if t["date"] >= today]

    # PAST 30 DAYS cash curve:
    # Start from current_cash, go backwards day by day for 30 days before today
    past_days = []
    past_balance = float(ledger["current_cash"])
    for i in range(1, 31):
        day = today - timedelta(days=i)
        day_txs = [t for t in past_txs if t["date"].date() == day.date()]
        for tx in day_txs:
            if tx["type"] == "income":
                past_balance += float(tx["amount"])
            elif tx["type"] == "expense":
                past_balance -= float(tx["amount"])
        past_days.append({
            "date": day.isoformat(),
            "balance": float(past_balance),
            "is_forecast": False,
        })
    past_curve = list(reversed(past_days))

    # FUTURE 30 DAYS cash curve:
    # Start from current_cash, for each of the next 30 days from today
    future_curve = []
    future_balance = float(ledger["current_cash"])
    for day_offset in range(30):
        day = today + timedelta(days=day_offset)
        day_txs = [t for t in future_txs if t["date"].date() == day.date()]
        for tx in day_txs:
            amount = float(tx["amount"])
            is_confirmed = bool(tx.get("confirmed", False))
            tx_type = tx.get("type")

            if tx_type == "income":
                if is_confirmed:
                    future_balance += amount
                else:
                    future_balance += amount * 0.5
            elif tx_type == "expense":
                if is_confirmed:
                    future_balance -= amount
                # unconfirmed expense: ignore

        future_curve.append({
            "date": day.isoformat(),
            "balance": float(future_balance),
            "is_forecast": True,
        })

    # shortage_day: scan future days, return 0-based index of first day with balance < 20000
    shortage_day = None
    for idx, item in enumerate(future_curve):
        if item["balance"] < 20000:
            shortage_day = idx
            break

    return {
        "curve": past_curve + future_curve,
        "shortage_day": shortage_day,
    }


if __name__ == "__main__":
    import sys
    sys.path.append(".")
    from csv_loader import load_ledger
    for scenario in ["normal", "stressed", "crisis"]:
        ledger = load_ledger(scenario)
        result = forecast_cash_flow(ledger)
        curve = result["curve"]
        shortage = result["shortage_day"]
        print(f"[{scenario.upper()}] {len(curve)} days in curve, shortage_day={shortage}")
        print(f"  Today balance: {curve[30]['balance']:,.0f}")
        print(f"  Day 30 balance: {curve[-1]['balance']:,.0f}")
