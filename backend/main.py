from datetime import datetime, timedelta
from typing import Any
import traceback

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from csv_loader import load_ledger
from forecaster import forecast_cash_flow
from uncertainty import compute_data_quality_score, compute_uncertainty_bands
from scenario_engine import simulate_scenarios
from deferral_policy import evaluate_deferral

app = FastAPI(title="Foresight API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "Foresight"}


@app.get("/api/scenario/{scenario_name}")
def get_scenario(scenario_name: str) -> dict[str, Any]:
    valid_scenarios = {"normal", "stressed", "crisis"}
    if scenario_name not in valid_scenarios:
        raise HTTPException(
            status_code=400,
            detail="scenario must be one of: normal, stressed, crisis",
        )

    try:
        ledger = load_ledger(scenario_name)
        data_quality_score = compute_data_quality_score(ledger["transactions"])
        forecast_result = forecast_cash_flow(ledger)
        enriched_bands = compute_uncertainty_bands(forecast_result["curve"], data_quality_score)
        scenarios = simulate_scenarios(ledger, forecast_result)
        deferral = evaluate_deferral(
            forecast_result["curve"],
            enriched_bands,
            data_quality_score,
            scenarios,
            ledger["transactions"],
        )

        today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
        window_end = today + timedelta(days=14)
        obligations_14_days = sum(
            float(t["amount"])
            for t in ledger["transactions"]
            if t.get("type") == "expense"
            and t.get("confirmed", False)
            and today <= t["date"] < window_end
        )

        return {
            "business_name": ledger["business_name"],
            "location": ledger["location"],
            "current_cash": ledger["current_cash"],
            "data_quality_score": data_quality_score,
            "obligations_14_days": obligations_14_days,
            "shortage_day": forecast_result["shortage_day"],
            "forecast": enriched_bands,
            "scenarios": scenarios,
            "deferral": deferral,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
