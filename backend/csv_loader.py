
from pathlib import Path
import pandas as pd


# Find the data folder relative to this Python file.
BASE_PATH = Path(__file__).resolve().parent.parent / "data"

SCENARIOS = {
    "normal": {
        "file": "mehta_electronics_normal.csv",
        "business_name": "Mehta Electronics",
        "location": "Karol Bagh",
        "current_cash": 124000,
    },
    "stressed": {
        "file": "ananya_textiles_stressed.csv",
        "business_name": "Ananya Textiles",
        "location": "Lajpat Nagar",
        "current_cash": 98000,
    },
    "crisis": {
        "file": "sharma_catering_crisis.csv",
        "business_name": "Sharma Catering Co.",
        "location": "Rohini",
        "current_cash": 67000,
    },
}

REQUIRED_COLUMNS = {
    "date", "type", "amount", "category",
    "description", "confirmed"
}


def parse_confirmed(value):
    """Convert CSV confirmation values safely to booleans."""
    if isinstance(value, bool):
        return value

    value = str(value).strip().lower()

    if value in {"true", "1", "yes"}:
        return True
    if value in {"false", "0", "no"}:
        return False

    raise ValueError(f"Invalid confirmed value: {value}")


def load_ledger(scenario: str) -> dict:
    if scenario not in SCENARIOS:
        raise ValueError(f"Unsupported scenario: {scenario}")

    config = SCENARIOS[scenario]
    file_path = BASE_PATH / config["file"]

    if not file_path.exists():
        raise FileNotFoundError(
            f"Ledger file not found: {file_path}"
        )

    df = pd.read_csv(file_path)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            f"CSV is missing required columns: {sorted(missing)}"
        )

    # Validate and convert dates.
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if df["date"].isna().any():
        raise ValueError("CSV contains invalid or missing dates")

    # Validate transaction types.
    df["type"] = df["type"].astype(str).str.strip().str.lower()
    if not df["type"].isin(["income", "expense"]).all():
        raise ValueError("Transaction type must be income or expense")

    # Validate amounts.
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    if df["amount"].isna().any() or (df["amount"] < 0).any():
        raise ValueError("Amounts must be valid, non-negative numbers")

    transactions = []

    for _, row in df.iterrows():
        transactions.append({
            "date": row["date"].to_pydatetime(),
            "type": row["type"],
            "amount": float(row["amount"]),
            "category": str(row["category"]),
            "description": str(row["description"]),
            "confirmed": parse_confirmed(row["confirmed"]),
        })

    return {
        "business_name": config["business_name"],
        "location": config["location"],
        "current_cash": config["current_cash"],
        "transactions": transactions,
    }
