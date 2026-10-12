import os
import pandas as pd
from datetime import datetime
from dateutil import parser

def load_ledger(scenario: str):
    """Load ledger data for a given scenario.

    Args:
        scenario (str): one of "normal", "stressed", "crisis"

    Returns:
        dict: containing business metadata and list of transaction dicts
    """
    base_path = os.path.expanduser("~/Documents/foresight/data")
    mapping = {
        "normal": {
            "file": os.path.join(base_path, "mehta_electronics_normal.csv"),
            "business_name": "Mehta Electronics",
            "location": "Karol Bagh",
            "current_cash": 124000,
        },
        "stressed": {
            "file": os.path.join(base_path, "ananya_textiles_stressed.csv"),
            "business_name": "Ananya Textiles",
            "location": "Lajpat Nagar",
            "current_cash": 98000,
        },
        "crisis": {
            "file": os.path.join(base_path, "sharma_catering_crisis.csv"),
            "business_name": "Sharma Catering Co.",
            "location": "Rohini",
            "current_cash": 67000,
        },
    }
    if scenario not in mapping:
        raise ValueError(f"Unsupported scenario: {scenario}")
    cfg = mapping[scenario]
    df = pd.read_csv(cfg["file"]).copy()
    # Ensure expected columns exist
    expected = {"date", "type", "amount", "category", "description", "confirmed"}
    if not expected.issubset(set(df.columns)):
        raise ValueError("CSV missing required columns")
    # Parse dates
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    transactions = []
    for _, row in df.iterrows():
        transactions.append({
            "date": row["date"].to_pydatetime(),
            "type": row["type"],
            "amount": float(row["amount"]),
            "category": row["category"],
            "description": row["description"],
            "confirmed": bool(row["confirmed"]),
        })
    return {
        "business_name": cfg["business_name"],
        "location": cfg["location"],
        "current_cash": cfg["current_cash"],
        "transactions": transactions,
    }

# Simple manual test (optional)
if __name__ == "__main__":
    import json, sys
    scenario = sys.argv[1] if len(sys.argv) > 1 else "normal"
    ledger = load_ledger(scenario)
    print(json.dumps({
        "business_name": ledger["business_name"],
        "location": ledger["location"],
        "current_cash": ledger["current_cash"],
        "transaction_count": len(ledger["transactions"]),
    }, indent=2))
