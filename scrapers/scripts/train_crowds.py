import itertools
import pandas as pd
import json
from pathlib import Path
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics

# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent / "output"

CROWD_FILES = [
    BASE_DIR / f"disney_crowd_202{year}.json"
    for year in range(2, 6)
]

EVENTS_FILE = BASE_DIR / "events.json"

ACTUAL_FILE = BASE_DIR / "disney_crowd_2026.json"

PREDICTION_FILE = BASE_DIR / "predicted_crowds_2026_5.json"

COMPARISON_FILE = BASE_DIR / "crowd_comparison_2026_5.json"

METRICS_FILE = BASE_DIR / "crowd_prediction_metrics_2026_5.csv"

RANKINGS_FILE = BASE_DIR / "crowd_rankings_2026_5.json"

BEST_PARAMS_FILE = BASE_DIR / "crowd_model_best_params_2026_5.json"

CROWD_CAP = 10.0
CROWD_FLOOR = 0.0


# ============================================================
# Load historical crowd data
# ============================================================

print("Loading historical crowd data...")

crowd_dfs = []

for file_path in CROWD_FILES:
    df = pd.read_json(file_path)
    df["date"] = pd.to_datetime(df["date"])
    crowd_dfs.append(df)

crowd_df = pd.concat(crowd_dfs, ignore_index=True)

parks = crowd_df["park"].unique()

print(f"Found parks: {list(parks)}")


# ============================================================
# Load events
# ============================================================

print("Loading events...")

with open(EVENTS_FILE, "r") as f:
    events = json.load(f)


def build_holidays_df(events, park):
    """
    Build a Prophet-style holidays dataframe containing only the events
    that apply to `park`. An event applies to a park if its "parks"
    field contains "all" or the park's own key.

    Each event also supplies its own lower_window / upper_window
    (days of lead-up / lingering crowd effect around the listed dates),
    instead of the previous hardcoded 0/0.
    """

    holiday_rows = []

    for e in events:

        applicable_parks = e.get("parks", ["all"])

        if "all" not in applicable_parks and park not in applicable_parks:
            continue

        start = pd.to_datetime(e["start_date"])
        end = pd.to_datetime(e["end_date"])

        lower_window = e.get("lower_window", 0)
        upper_window = e.get("upper_window", 0)

        for d in pd.date_range(start, end):
            holiday_rows.append({
                "holiday": e["event_name"],
                "ds": d,
                "lower_window": lower_window,
                "upper_window": upper_window
            })

    holidays_df = pd.DataFrame(holiday_rows)

    if not holidays_df.empty:
        # An event can appear more than once in events.json (e.g. the
        # same holiday listed under two overlapping entries). Keep the
        # widest window seen for any given holiday/date combination.
        holidays_df = holidays_df.sort_values(
            ["holiday", "ds", "lower_window", "upper_window"]
        )
        holidays_df = holidays_df.drop_duplicates(
            subset=["holiday", "ds"], keep="last"
        )

    return holidays_df


# ============================================================
# Cross-validated hyperparameter search (per park)
# ============================================================

# Candidate grid. Kept modest in size since each combination requires
# a full Prophet cross_validation pass per park.
PARAM_GRID = {
    "changepoint_prior_scale": [0.01, 0.05, 0.1, 0.5],
    "holidays_prior_scale": [1, 10, 20],
    "seasonality_prior_scale": [1, 10],
}

CV_INITIAL = "730 days"   # ~2 years to establish yearly seasonality
CV_PERIOD = "90 days"
CV_HORIZON = "90 days"    # matches the ~8 month evaluation window used


def tune_park_model(park_df, holidays_df, park_name):
    """
    Grid search + rolling-origin cross-validation to pick
    changepoint_prior_scale / holidays_prior_scale / seasonality_prior_scale
    for a single park, using Prophet's built-in cross_validation utility.
    Selects the combination with the lowest mean RMSE across cutoffs.
    """

    keys = list(PARAM_GRID.keys())
    combos = list(itertools.product(*[PARAM_GRID[k] for k in keys]))

    best_score = float("inf")
    best_params = None

    print(f"\n  Cross-validating hyperparameters for {park_name} "
          f"({len(combos)} combinations)...")

    for combo in combos:

        params = dict(zip(keys, combo))

        m = Prophet(
            weekly_seasonality=True,
            yearly_seasonality=True,
            seasonality_mode="additive",
            growth="logistic",
            holidays=holidays_df,
            **params
        )

        fit_df = park_df.copy()
        fit_df["cap"] = CROWD_CAP
        fit_df["floor"] = CROWD_FLOOR

        try:
            m.fit(fit_df)

            df_cv = cross_validation(
                m,
                initial=CV_INITIAL,
                period=CV_PERIOD,
                horizon=CV_HORIZON,
                parallel=None,
                disable_tqdm=True,
            )

            df_perf = performance_metrics(df_cv, rolling_window=1)
            mean_rmse = df_perf["rmse"].mean()

        except Exception as exc:
            # Some combinations can fail to converge on short series;
            # skip them rather than aborting the whole search.
            print(f"    Skipping {params} ({exc})")
            continue

        if mean_rmse < best_score:
            best_score = mean_rmse
            best_params = params

    if best_params is None:
        # Fallback to the previous defaults if every combination failed
        best_params = {
            "changepoint_prior_scale": 0.1,
            "holidays_prior_scale": 10,
            "seasonality_prior_scale": 10,
        }
        best_score = None

    print(f"  Best params for {park_name}: {best_params} "
          f"(mean CV RMSE = {best_score})")

    return best_params, best_score


# ============================================================
# Train Prophet models (with tuned params + logistic growth) and
# predict 2026
# ============================================================

print("\n=== Training Models ===")

predictions = []
best_params_by_park = {}

for park in parks:

    print(f"\nTraining Prophet for {park}...")

    park_df = crowd_df[crowd_df["park"] == park].copy()

    park_df = park_df.rename(
        columns={
            "date": "ds",
            "crowd": "y"
        }
    )

    park_df = park_df.sort_values("ds")

    holidays_df = build_holidays_df(events, park)

    # ---- Cross-validate hyperparameters for this park ----
    best_params, best_score = tune_park_model(park_df, holidays_df, park)

    best_params_by_park[park] = {
        "params": best_params,
        "mean_cv_rmse": best_score,
    }

    # ---- Fit the final model on the full history with the best params ----
    model = Prophet(
        weekly_seasonality=True,
        yearly_seasonality=True,
        seasonality_mode="additive",

        growth="logistic",  # crowd index is bounded 0-10; let Prophet
                             # model the ceiling/floor instead of
                             # clipping predictions after the fact

        holidays=holidays_df,
        **best_params
    )

    fit_df = park_df.copy()
    fit_df["cap"] = CROWD_CAP
    fit_df["floor"] = CROWD_FLOOR

    model.fit(fit_df)

    # --------------------------------------------------------
    # Predict every day of 2026 explicitly
    # --------------------------------------------------------

    future = pd.DataFrame({
        "ds": pd.date_range(
            start="2026-01-01",
            end="2026-12-31",
            freq="D"
        )
    })

    future["cap"] = CROWD_CAP
    future["floor"] = CROWD_FLOOR

    forecast = model.predict(future)

    forecast["park"] = park

    predictions.append(
        forecast[
            [
                "park",
                "ds",
                "yhat"
            ]
        ]
    )


# ============================================================
# Save chosen hyperparameters for reference / auditing
# ============================================================

with open(BEST_PARAMS_FILE, "w") as f:
    json.dump(best_params_by_park, f, indent=2, default=str)

print("\nBest hyperparameters per park saved to:")
print(f"  {BEST_PARAMS_FILE}")


# ============================================================
# Combine predictions
# ============================================================

result_df = pd.concat(
    predictions,
    ignore_index=True
)

result_df = result_df.rename(
    columns={
        "ds": "date",
        "yhat": "crowd"
    }
)

# Logistic growth keeps yhat within [floor, cap] by construction, but
# clip defensively in case of any numerical edge cases (e.g. holiday
# effects pushing slightly outside the bound on a specific day).
result_df["crowd"] = result_df["crowd"].clip(0, 10)
result_df["crowd"] = result_df["crowd"].round(2)

result_df = result_df.sort_values(
    ["date", "park"]
).reset_index(drop=True)


# ============================================================
# Validate prediction output
# ============================================================

expected_rows = len(parks) * 365

if len(result_df) != expected_rows:
    raise ValueError(
        f"Expected {expected_rows} prediction rows, "
        f"but got {len(result_df)}."
    )

if result_df["date"].min().date() != pd.Timestamp("2026-01-01").date():
    raise ValueError("Prediction start date is incorrect.")

if result_df["date"].max().date() != pd.Timestamp("2026-12-31").date():
    raise ValueError("Prediction end date is incorrect.")


# ============================================================
# Save predictions
# ============================================================

result_df.to_json(
    PREDICTION_FILE,
    orient="records",
    date_format="iso"
)

print("\nPredictions saved to:")
print(f"  {PREDICTION_FILE}")


# ============================================================
# Load actual 2026 data
# ============================================================

print("\nLoading actual 2026 crowd data...")

with open(ACTUAL_FILE) as f:
    actual = pd.DataFrame(json.load(f))

actual["date"] = pd.to_datetime(
    actual["date"]
).dt.date

predicted = result_df.copy()

predicted["date"] = pd.to_datetime(
    predicted["date"]
).dt.date


# ============================================================
# Merge actual + predicted
# ============================================================

df = actual.merge(
    predicted,
    on=["park", "date"],
    suffixes=("_actual", "_predicted")
)

if len(df) == 0:
    raise ValueError(
        "No rows matched between actual and predicted data."
    )

print(f"Comparison rows: {len(df)}")


# ============================================================
# Calculate prediction errors
# ============================================================

df["error"] = (
    df["crowd_predicted"] -
    df["crowd_actual"]
)

df["absolute_error"] = df["error"].abs()

df["squared_error"] = df["error"] ** 2


# ============================================================
# Rank parks within each date
# ============================================================

df["actual_rank"] = (
    df.groupby("date")["crowd_actual"]
    .rank(method="min", ascending=True)
)

df["predicted_rank"] = (
    df.groupby("date")["crowd_predicted"]
    .rank(method="min", ascending=True)
)


# ============================================================
# Create rankings file
# ============================================================

rankings = df[
    [
        "date",
        "park",
        "crowd_actual",
        "crowd_predicted",
        "actual_rank",
        "predicted_rank"
    ]
].copy()

rankings = rankings.sort_values(
    ["date", "actual_rank", "park"]
).reset_index(drop=True)

rankings.to_json(
    RANKINGS_FILE,
    orient="records",
    indent=2
)

print("\nRankings saved to:")
print(f"  {RANKINGS_FILE}")


# ============================================================
# Best park accuracy
# ============================================================

actual_best = (
    df[df["actual_rank"] == 1]
    .groupby("date")["park"]
    .apply(list)
    .to_dict()
)

predicted_best = (
    df[df["predicted_rank"] == 1]
    .groupby("date")["park"]
    .apply(list)
    .to_dict()
)

correct_best_park = 0
total_days = 0

for date in actual_best:

    actual_parks = set(actual_best[date])
    predicted_parks = set(predicted_best.get(date, []))

    total_days += 1

    if actual_parks.intersection(predicted_parks):
        correct_best_park += 1

best_park_accuracy = (
    correct_best_park / total_days * 100
    if total_days > 0
    else 0
)


# ============================================================
# Top-2 accuracy
# ============================================================

actual_top2 = (
    df[df["actual_rank"] <= 2]
    .groupby("date")["park"]
    .apply(set)
    .to_dict()
)

predicted_top2 = (
    df[df["predicted_rank"] <= 2]
    .groupby("date")["park"]
    .apply(set)
    .to_dict()
)

top2_correct = 0

for date in actual_top2:

    actual_parks = actual_top2[date]
    predicted_parks = predicted_top2.get(date, set())

    if actual_parks.intersection(predicted_parks):
        top2_correct += 1

top2_accuracy = (
    top2_correct / total_days * 100
    if total_days > 0
    else 0
)


# ============================================================
# Monthly performance
# ============================================================

df["month"] = pd.to_datetime(
    df["date"]
).dt.month

monthly = df.groupby("month").agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    mean_error=("error", "mean"),
    within_1=(
        "absolute_error",
        lambda x: (x <= 1).mean() * 100
    )
)


# ============================================================
# Day-of-week performance
# ============================================================

df["day_of_week"] = pd.to_datetime(
    df["date"]
).dt.day_name()

weekday_order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

weekday = df.groupby("day_of_week").agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    mean_error=("error", "mean"),
    within_1=(
        "absolute_error",
        lambda x: (x <= 1).mean() * 100
    )
)

weekday = weekday.reindex(weekday_order)


# ============================================================
# Actual crowd buckets
# ============================================================

df["actual_bucket"] = pd.cut(
    df["crowd_actual"],
    bins=[
        -0.1,
        2,
        4,
        6,
        8,
        10
    ],
    labels=[
        "0-2",
        "2-4",
        "4-6",
        "6-8",
        "8-10"
    ]
)

bucket = df.groupby(
    "actual_bucket",
    observed=False
).agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    mean_error=("error", "mean"),
    within_1=(
        "absolute_error",
        lambda x: (x <= 1).mean() * 100
    )
)


# ============================================================
# Per-park performance
# ============================================================

metrics = df.groupby("park").agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    rmse=(
        "squared_error",
        lambda x: x.mean() ** 0.5
    ),
    mean_error=("error", "mean"),
    within_1=(
        "absolute_error",
        lambda x: (x <= 1).mean() * 100
    )
)


# ============================================================
# Overall performance
# ============================================================

overall = pd.DataFrame({
    "observations": [len(df)],

    "mae": [
        df["absolute_error"].mean()
    ],

    "rmse": [
        df["squared_error"].mean() ** 0.5
    ],

    "mean_error": [
        df["error"].mean()
    ],

    "within_1": [
        (df["absolute_error"] <= 1).mean() * 100
    ],

}, index=["overall"])

metrics = pd.concat(
    [
        metrics,
        overall
    ]
)


# ============================================================
# Print results
# ============================================================

print("\n========================================")
print("       CROWD PREDICTION RESULTS")
print("========================================")

print("\n=== Best Park Accuracy ===")
print(
    f"Correct: {correct_best_park} / {total_days}"
)
print(
    f"Accuracy: {best_park_accuracy:.1f}%"
)

print("\n=== Top-2 Accuracy ===")
print(
    f"Correct: {top2_correct} / {total_days}"
)
print(
    f"Accuracy: {top2_accuracy:.1f}%"
)

print("\n=== Monthly Performance ===")
print(
    monthly.round(3)
)

print("\n=== Day of Week Performance ===")
print(
    weekday.round(3)
)

print("\n=== Actual Crowd Bucket Performance ===")
print(
    bucket.round(3)
)

print("\n=== Prediction Performance ===")
print(
    metrics.round(3)
)


# ============================================================
# Save detailed comparison
# ============================================================

df.to_json(
    COMPARISON_FILE,
    orient="records",
    indent=2
)


# ============================================================
# Save summary metrics
# ============================================================

metrics.to_csv(
    METRICS_FILE
)


# ============================================================
# Final output
# ============================================================

print("\n========================================")
print("Files saved:")
print("========================================")

print(f"  {PREDICTION_FILE.name}")
print(f"  {COMPARISON_FILE.name}")
print(f"  {METRICS_FILE.name}")
print(f"  {RANKINGS_FILE.name}")
print(f"  {BEST_PARAMS_FILE.name}")

print("\nDone.")