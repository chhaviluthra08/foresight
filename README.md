# Foresight

**Uncertainty-aware cash-flow forecasting and financial decision support
for small businesses**

Foresight is a prototype designed to help small businesses understand
their near-term cash position, spot possible cash shortages, and compare
practical actions before making a financial decision.

A business can appear profitable and still struggle to pay bills on time
when customer receipts arrive late but wages, rent, supplier payments,
or loan instalments are due. Foresight focuses on this timing problem:
it projects cash movement over the next 30 days and lets users explore
how different actions could affect the outcome.

> **Project status:** Academic prototype. The current implementation
> uses transaction-based calculations, heuristic
> data-quality/uncertainty indicators, and rule-based deferral logic. It
> is not a validated financial forecasting product, and its outputs
> should not be treated as financial advice.

## Contents

-   [Key features](#key-features)
-   [How it works](#how-it-works)
-   [Technology stack](#technology-stack)
-   [Project architecture](#project-architecture)
-   [Demo businesses and data](#demo-businesses-and-data)
-   [Getting started](#getting-started)
-   [API endpoints](#api-endpoints)
-   [Scenarios](#scenarios)
-   [Understanding the output](#understanding-the-output)
-   [Current limitations](#current-limitations)
-   [Planned improvements](#planned-improvements)
-   [Academic context](#academic-context)

## Key features

-   **30-day cash-flow projection:** estimates future cash balances from
    the transaction schedule.
-   **Cash-reserve monitoring:** highlights potential periods when
    projected cash may fall below a chosen reserve.
-   **Scenario comparison:** explores selected changes to the timing of
    receipts or payments.
-   **Data-quality indicator:** surfaces concerns about the available
    input data.
-   **Uncertainty-aware deferral:** can withhold a recommendation when
    the current heuristic rules indicate that the evidence is
    insufficient.
-   **Dashboard interface:** brings the forecast, data-quality
    information, and scenario controls into one place.

The current prototype is a foundation for these capabilities. Forecast
accuracy and the usefulness of recommendations still need systematic
evaluation.

## How it works

1.  **Load transaction data.** The prototype reads synthetic
    small-business ledger CSV files.
2.  **Check the available data.** Data-quality logic produces an
    indicator based on the fields and checks implemented in the current
    code.
3.  **Project cash movement.** Transactions are used to calculate a
    deterministic, transaction-based cash-flow projection for the next
    30 days.
4.  **Evaluate scenarios.** The system applies a selected intervention,
    such as collecting an overdue invoice earlier or postponing a
    payment, and calculates the resulting projection.
5.  **Apply the deferral rule.** A heuristic policy uses data quality
    and forecast-band information to decide whether to defer a
    recommendation.
6.  **Display the results.** The frontend presents the forecast,
    scenario results, and relevant warnings.

### High-level flow

``` text
Business ledger (CSV)
        |
        v
Data loading and quality checks
        |
        v
Transaction-based cash-flow projection
        |
        +-----------------------------+
        |                             |
        v                             v
Baseline forecast              Scenario simulation
        |                             |
        +--------------+--------------+
                       |
                       v
           Risk and deferral rules
                       |
                       v
             Dashboard and results
```

## Technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React, Vite,            Dashboard and user
                          JavaScript, HTML/CSS,   interaction
                          Tailwind CSS (as        
                          configured in the       
                          project)                

  Backend                 Python, FastAPI         Forecasting, scenario
                                                  and API logic

  Input data              CSV                     Synthetic transaction
                                                  ledgers

  Forecasting             Deterministic           Projects cash balances
                          transaction-based       from scheduled
                          calculations            transactions

  Decision support        Scenario rules and      Compares interventions
                          heuristic deferral      and can withhold a
                          logic                   recommendation
  -----------------------------------------------------------------------

The current version does **not** use a trained machine-learning model to
generate the cash-flow forecast. Its uncertainty indicators are
heuristic, not statistically calibrated prediction intervals.

## Project architecture

At a high level, the application has three parts:

-   **Frontend:** displays business-level results, cash-flow
    visualizations, data-quality status, and scenario controls.
-   **FastAPI backend:** serves the health check and scenario endpoints
    and runs the forecasting/decision logic.
-   **Data layer:** supplies the synthetic ledger CSV files used by the
    prototype.

The exact filenames and commands can vary with the repository layout.
Check the existing frontend and backend dependency files before
installing packages or starting the services.

## Demo businesses and data

The prototype includes three synthetic demo businesses:

-   **Mehta Electronics** --- normal-case demonstration.
-   **Ananya Textiles** --- stressed-case demonstration.
-   **Sharma Catering Co.** --- crisis-case demonstration.

The synthetic ledgers contain 92 rows per business, with dates spanning
**14 July 2026 to 10 December 2026**. These records are demonstration
data, not real company financial records.

### Why synthetic data?

Synthetic data makes it possible to demonstrate different cash-flow
conditions without exposing private business information. For academic
evaluation, scenarios should also be tested against deliberately
constructed ledgers whose expected cash balances and reserve breaches
can be calculated independently.

## Getting started

### Prerequisites

-   Python 3.10 or a version supported by the backend dependencies
-   Node.js and npm, compatible with the frontend project
-   Git, if cloning the repository

### 1. Get the project

``` bash
git clone <your-repository-url>
cd <project-folder>
```

If you are working from a downloaded ZIP, extract it and open a terminal
in the project directory instead.

### 2. Set up the backend

Create and activate a virtual environment from the backend directory (or
the project root if the backend is located there):

``` bash
python -m venv .venv
```

macOS/Linux:

``` bash
source .venv/bin/activate
```

Windows PowerShell:

``` powershell
.venv\Scripts\Activate.ps1
```

Install the backend dependencies using the repository's dependency file.
If it is named `requirements.txt`:

``` bash
pip install -r requirements.txt
```

Start FastAPI using the actual module that defines the `app` object. For
example, **if** the application object is `app` in `main.py`:

``` bash
uvicorn main:app --reload
```

The API documentation is usually available at
`http://127.0.0.1:8000/docs` when the backend is running.

### 3. Set up the frontend

Open a second terminal and move to the directory containing the
frontend's `package.json`:

``` bash
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

> **Note:** The commands above are standard setup examples. Confirm the
> actual directory names, dependency files, and FastAPI entry-point
> module in your copy of the repository. The data loader must also point
> to the CSV files in the project; it should not depend on a particular
> user's home-directory path.

## API endpoints

The prototype exposes these endpoints:

  -----------------------------------------------------------------------
  Endpoint                            Purpose
  ----------------------------------- -----------------------------------
  `GET /api/health`                   Checks whether the backend is
                                      responding

  `/api/scenario/{scenario_name}`     Runs or retrieves the result for
                                      the requested scenario, according
                                      to the backend implementation
  -----------------------------------------------------------------------

Use the interactive API documentation at `/docs` to confirm the
supported HTTP method, accepted scenario names, request parameters, and
response structure for the current implementation.

## Scenarios

The prototype includes these scenario types:

  -----------------------------------------------------------------------
  Scenario                            Intended question
  ----------------------------------- -----------------------------------
  **No Action**                       What happens if the current
                                      transaction schedule remains
                                      unchanged?

  **Collect Overdue Invoice**         What changes if an overdue customer
                                      invoice is collected earlier?

  **Postpone Discretionary Expenses** What changes if selected
                                      non-essential spending is delayed?

  **Negotiate Supplier Payment**      What changes if an eligible
                                      supplier payment is moved to a
                                      later date?
  -----------------------------------------------------------------------

Scenario results are only as reliable as the transaction data and
assumptions used. In a stronger version, each scenario should be
recomputed from the underlying transaction schedule and compared against
the same baseline using measurable outcomes, such as minimum cash
balance, reserve-breach days, and the size of any shortfall.

## Understanding the output

-   **Projected cash balance:** the calculated cash position at a point
    in the forecast horizon.
-   **Reserve breach:** a projected balance below the configured minimum
    cash reserve.
-   **Data-quality score:** a heuristic indicator of input-data quality;
    it is not a probability that the forecast is correct.
-   **Uncertainty band:** a heuristic range in the current prototype; it
    is not a statistically calibrated confidence or prediction interval.
-   **Deferral:** a rule-based decision to withhold a recommendation
    when configured evidence-quality conditions are not met.
-   **Scenario impact:** the difference between a scenario projection
    and the baseline. It should be calculated from consistent underlying
    assumptions.

## Current limitations

The following limitations should be considered when interpreting the
prototype:

1.  **Synthetic data:** demo results do not establish performance on
    real businesses.
2.  **Deterministic forecast:** the projection is transaction-based
    rather than generated by a trained forecasting model.
3.  **Heuristic uncertainty:** the current uncertainty bands are not
    calibrated against historical forecast errors.
4.  **Rule-based deferral:** thresholds and weights are heuristic and
    require justification and evaluation.
5.  **Scenario assumptions:** simulated actions depend on assumptions
    about receipt and payment timing; they do not guarantee that a
    customer or supplier will agree.
6.  **Evaluation still required:** forecast error, reserve-breach
    detection, false alarms, scenario benefit, and deferral behavior
    should be measured using test cases with known outcomes.

Foresight should be treated as a decision-support prototype, not as a
replacement for accounting software, professional financial advice, or a
business owner's judgment.

## Planned improvements

-   Make CSV upload configurable and add clear validation errors.
-   Correct and test historical balance reconstruction and transaction
    ordering.
-   Ensure the baseline and every scenario use the same forecasting
    calculation.
-   Make the minimum cash reserve configurable.
-   Show the transactions that contribute most to a predicted cash
    shortage.
-   Rank interventions by measured improvement over the baseline, while
    respecting business constraints.
-   Add automated tests for date handling, transaction arithmetic,
    scenario calculations, and reserve-breach detection.
-   Compare forecast results with simple baselines using known test
    outcomes.
-   Calibrate uncertainty only when sufficient appropriate evaluation
    data is available.
-   Improve accessibility, responsive layout, and dashboard usability.

## Academic context

Foresight explores how uncertainty-aware decision support can be applied
to short-term cash-flow planning. Rather than presenting every result as
a confident recommendation, the intended approach is to expose data
limitations and defer when the available evidence is inadequate.

The current implementation is an early prototype. Claims about
forecasting accuracy, calibrated uncertainty, or real-world financial
benefit should only be made after they have been supported by documented
experiments.

------------------------------------------------------------------------

## License

No license has been specified yet. Add a `LICENSE` file before
distributing the project publicly if you want to define how others may
use, modify, or redistribute it.
