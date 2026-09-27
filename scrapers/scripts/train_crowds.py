"""
Disney park crowd-level forecasting with Prophet.

This module is split into two independent halves:

  * PREDICTION  - train one Prophet model per park on all available
                  history and forecast every day of a target year.
                  This is the only thing that runs by default.

  * COMPARISON  - given a saved prediction file and a matching actuals
                  file for the same year, compute error metrics,
                  rankings, and breakdowns. Entirely opt-in, since a
                  year you haven't lived through yet (e.g. forecasting
                  2027 from 2026) has no actuals to compare against.

Typical usage
-------------
Just generate 2027 predictions, nothing else:

    $ python crowd_model.py --year 2027

Generate 2026 predictions AND immediately score them against actuals:

    $ python crowd_model.py --year 2026 --compare

You already have a prediction file and just want to (re)score it:

    $ python crowd_model.py --year 2026 --compare-only

Skip the (slow) hyperparameter search and use the previous defaults:

    $ python crowd_model.py --year 2027 --no-tune

Everything is also importable and callable directly, e.g. from a
notebook:

    from crowd_model import run_prediction, run_comparison
    result_df, params = run_prediction(2027)
    report = run_comparison(2026)
"""

import argparse
import itertools
import json
from pathlib import Path

import pandas as pd
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics


# ============================================================
# Paths / constants
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent / "output"

# Historical crowd files used to TRAIN the model. Add more years here
# as they become available; this list is independent of which year
# you're forecasting.
CROWD_FILES = [
    BASE_DIR / f"disney_crowd_202{year}.json"
    for year in range(2, 6)
]

EVENTS_FILE = BASE_DIR / "events.json"

CROWD_CAP = 10.0
CROWD_FLOOR = 0.0

# Hyperparameter search grid. Kept modest since each combination
# requires a full Prophet cross_validation pass per park.
PARAM_GRID = {
    "changepoint_prior_scale": [0.01, 0.05, 0.1, 0.5],
    "holidays_prior_scale": [1, 10, 20],
    "seasonality_prior_scale": [1, 10],
}

# Used when --no-tune is passed, or as a fallback if every grid
# combination fails to converge.
DEFAULT_PARAMS = {
    "changepoint_prior_scale": 0.1,
    "holidays_prior_scale": 10,
    "seasonality_prior_scale": 10,
}

CV_INITIAL = "730 days"   # ~2 years to establish yearly seasonality
CV_PERIOD = "90 days"
CV_HORIZON = "90 days"


def prediction_file(year):
    return BASE_DIR / f"predicted_crowds_{year}.json"


def best_params_file(year):
    return BASE_DIR / f"crowd_model_best_params_{year}.json"


def actual_file(year):
    return BASE_DIR / f"disney_crowd_{year}.json"


def comparison_file(year):
    return BASE_DIR / f"crowd_comparison_{year}.json"


def metrics_file(year):
    return BASE_DIR / f"crowd_prediction_metrics_{year}.csv"


def rankings_file(year):
    return BASE_DIR / f"crowd_rankings_{year}.json"


# ============================================================
# Data loading
# ============================================================

def load_crowd_history(crowd_files=CROWD_FILES):
    """Load and concatenate all historical crowd json files into one df."""
    dfs = []
    for file_path in crowd_files:
        df = pd.read_json(file_path)
        df["date"] = pd.to_datetime(df["date"])
        dfs.append(df)
    return pd.concat(dfs, ignore_index=True)


def load_events(events_file=EVENTS_FILE):
    with open(events_file, "r") as f:
        return json.load(f)


# ============================================================
# Holidays construction (park-specific, per-event windows)
# ============================================================

def _event_dates(e):
    """
    Return every calendar date an event covers.

    Supports two event shapes so you don't need to reformat an
    existing events.json:

      * Continuous span:  {"start_date": "...", "end_date": "..."}
        Every day from start to end (inclusive) counts, same as before.
        A single-day event just sets start_date == end_date.

      * Explicit dates:   {"dates": ["2026-08-07", "2026-08-11", ...]}
        Use this when an event only happens on specific, irregular
        nights within a season (e.g. the exact Mickey's Not-So-Scary
        Halloween Party dates) rather than every day in a range.
    """
    if "dates" in e:
        return [pd.to_datetime(d) for d in e["dates"]]

    start = pd.to_datetime(e["start_date"])
    end = pd.to_datetime(e["end_date"])
    return list(pd.date_range(start, end))


def build_holidays_df(events, park):
    """
    Build a Prophet-style holidays dataframe containing only the events
    that apply to `park`. An event applies to a park if its "parks"
    field contains "all" or the park's own key.

    Each event supplies its own lower_window / upper_window (days of
    lead-up / lingering crowd effect around its date(s)); these default
    to 0 if not present.
    """
    holiday_rows = []

    for e in events:
        applicable_parks = e.get("parks", ["all"])
        if "all" not in applicable_parks and park not in applicable_parks:
            continue

        lower_window = e.get("lower_window", 0)
        upper_window = e.get("upper_window", 0)

        for d in _event_dates(e):
            holiday_rows.append({
                "holiday": e["event_name"],
                "ds": d,
                "lower_window": lower_window,
                "upper_window": upper_window
            })

    holidays_df = pd.DataFrame(
        holiday_rows,
        columns=["holiday", "ds", "lower_window", "upper_window"]
    )

    if not holidays_df.empty:
        # An event can appear more than once (e.g. overlapping entries
        # for the same holiday). Keep the widest window seen for any
        # given holiday/date combination.
        holidays_df = holidays_df.sort_values(
            ["holiday", "ds", "lower_window", "upper_window"]
        )
        holidays_df = holidays_df.drop_duplicates(
            subset=["holiday", "ds"], keep="last"
        )

    return holidays_df


# ============================================================
# Hyperparameter tuning (per park)
# ============================================================

def tune_park_model(
    park_df,
    holidays_df,
    park_name,
    param_grid=PARAM_GRID,
    cv_initial=CV_INITIAL,
    cv_period=CV_PERIOD,
    cv_horizon=CV_HORIZON,
    cap=CROWD_CAP,
    floor=CROWD_FLOOR,
    verbose=True,
):
    """
    Grid search + rolling-origin cross-validation to pick
    changepoint_prior_scale / holidays_prior_scale / seasonality_prior_scale
    for a single park. Selects the combination with the lowest mean
    RMSE across cutoffs. Returns (best_params, best_score).
    """
    keys = list(param_grid.keys())
    combos = list(itertools.product(*[param_grid[k] for k in keys]))

    best_score = float("inf")
    best_params = None

    if verbose:
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
        fit_df["cap"] = cap
        fit_df["floor"] = floor

        try:
            m.fit(fit_df)
            df_cv = cross_validation(
                m,
                initial=cv_initial,
                period=cv_period,
                horizon=cv_horizon,
                parallel=None,
                disable_tqdm=True,
            )
            df_perf = performance_metrics(df_cv, rolling_window=1)
            mean_rmse = df_perf["rmse"].mean()
        except Exception as exc:
            if verbose:
                print(f"    Skipping {params} ({exc})")
            continue

        if mean_rmse < best_score:
            best_score = mean_rmse
            best_params = params

    if best_params is None:
        best_params = dict(DEFAULT_PARAMS)
        best_score = None

    if verbose:
        print(f"  Best params for {park_name}: {best_params} "
              f"(mean CV RMSE = {best_score})")

    return best_params, best_score


# ============================================================
# Model fitting / forecasting for a single park
# ============================================================

def fit_park_model(park_df, holidays_df, params, cap=CROWD_CAP, floor=CROWD_FLOOR):
    """Fit one Prophet model for a single park's full history."""
    model = Prophet(
        weekly_seasonality=True,
        yearly_seasonality=True,
        seasonality_mode="additive",
        growth="logistic",   # crowd index is bounded [0, 10]; let Prophet
                              # model the ceiling/floor natively instead
                              # of clipping predictions after the fact
        holidays=holidays_df,
        **params
    )

    fit_df = park_df.copy()
    fit_df["cap"] = cap
    fit_df["floor"] = floor
    model.fit(fit_df)
    return model


def forecast_year(model, year, cap=CROWD_CAP, floor=CROWD_FLOOR):
    """Predict every day of `year` with an already-fitted model."""
    future = pd.DataFrame({
        "ds": pd.date_range(start=f"{year}-01-01", end=f"{year}-12-31", freq="D")
    })
    future["cap"] = cap
    future["floor"] = floor

    forecast = model.predict(future)
    return forecast[["ds", "yhat"]]


# ============================================================
# PREDICTION: top-level, generates forecasts only
# ============================================================

def generate_predictions(
    year,
    crowd_df=None,
    events=None,
    tune=True,
    params_by_park=None,
    cap=CROWD_CAP,
    floor=CROWD_FLOOR,
    verbose=True,
):
    """
    Train one Prophet model per park and forecast every day of `year`.
    Does NOT load or touch actuals, and does NOT run any comparison.

    Parameters
    ----------
    year : int
        The year to forecast (e.g. 2027). Does not need to be a year
        you have any actual data for.
    crowd_df, events : optional
        Pass these in if you've already loaded them (e.g. to avoid
        re-reading files across repeated calls); otherwise they're
        loaded from the default paths.
    tune : bool
        If True (default), cross-validate hyperparameters per park.
        If False, use DEFAULT_PARAMS for every park (much faster).
    params_by_park : dict, optional
        Skip tuning entirely and use these exact params per park,
        e.g. {"magic_kingdom": {"changepoint_prior_scale": 0.1, ...}}.
        Overrides `tune` for any park present in this dict.

    Returns
    -------
    (result_df, best_params_by_park)
    """
    if crowd_df is None:
        crowd_df = load_crowd_history()
    if events is None:
        events = load_events()

    parks = crowd_df["park"].unique()
    predictions = []
    best_params_by_park = {}

    for park in parks:
        if verbose:
            print(f"\nTraining Prophet for {park}...")

        park_df = (
            crowd_df[crowd_df["park"] == park]
            .rename(columns={"date": "ds", "crowd": "y"})
            .sort_values("ds")
        )

        holidays_df = build_holidays_df(events, park)

        if params_by_park and park in params_by_park:
            params, score = params_by_park[park], None
        elif tune:
            params, score = tune_park_model(park_df, holidays_df, park, verbose=verbose)
        else:
            params, score = dict(DEFAULT_PARAMS), None

        best_params_by_park[park] = {"params": params, "mean_cv_rmse": score}

        model = fit_park_model(park_df, holidays_df, params, cap, floor)
        forecast = forecast_year(model, year, cap, floor)

        forecast = forecast.rename(columns={"ds": "date", "yhat": "crowd"})
        forecast["park"] = park
        predictions.append(forecast[["park", "date", "crowd"]])

    result_df = pd.concat(predictions, ignore_index=True)

    # Logistic growth keeps yhat within [floor, cap] by construction,
    # but clip defensively in case of numerical edge cases.
    result_df["crowd"] = result_df["crowd"].clip(floor, cap).round(2)
    result_df = result_df.sort_values(["date", "park"]).reset_index(drop=True)

    # ---- Validate output shape ----
    days_in_year = 366 if pd.Timestamp(f"{year}-12-31").is_leap_year else 365
    expected_rows = len(parks) * days_in_year

    if len(result_df) != expected_rows:
        raise ValueError(
            f"Expected {expected_rows} prediction rows, but got {len(result_df)}."
        )
    if result_df["date"].min().date() != pd.Timestamp(f"{year}-01-01").date():
        raise ValueError("Prediction start date is incorrect.")
    if result_df["date"].max().date() != pd.Timestamp(f"{year}-12-31").date():
        raise ValueError("Prediction end date is incorrect.")

    return result_df, best_params_by_park


def save_predictions(result_df, year, path=None):
    path = path or prediction_file(year)
    result_df.to_json(path, orient="records", date_format="iso")
    return path


def save_best_params(best_params_by_park, year, path=None):
    path = path or best_params_file(year)
    with open(path, "w") as f:
        json.dump(best_params_by_park, f, indent=2, default=str)
    return path


def run_prediction(year, tune=True, params_by_park=None, save=True, verbose=True):
    """
    Convenience wrapper: load data from disk, generate predictions for
    `year`, and (by default) save the prediction + best-params files.
    This is the function the CLI calls, and the main one you'd import
    for "just give me next year's forecast."
    """
    crowd_df = load_crowd_history()
    events = load_events()

    result_df, best_params = generate_predictions(
        year,
        crowd_df=crowd_df,
        events=events,
        tune=tune,
        params_by_park=params_by_park,
        verbose=verbose,
    )

    if save:
        pred_path = save_predictions(result_df, year)
        params_path = save_best_params(best_params, year)
        if verbose:
            print(f"\nPredictions saved to: {pred_path}")
            print(f"Best hyperparameters saved to: {params_path}")

    return result_df, best_params


# ============================================================
# COMPARISON / ANALYTICS: entirely separate, opt-in
# ============================================================

def _add_ranks(df):
    df = df.copy()
    df["error"] = df["crowd_predicted"] - df["crowd_actual"]
    df["absolute_error"] = df["error"].abs()
    df["squared_error"] = df["error"] ** 2
    df["actual_rank"] = df.groupby("date")["crowd_actual"].rank(method="min", ascending=True)
    df["predicted_rank"] = df.groupby("date")["crowd_predicted"].rank(method="min", ascending=True)
    return df


def _build_rankings(df):
    rankings = df[
        ["date", "park", "crowd_actual", "crowd_predicted", "actual_rank", "predicted_rank"]
    ].copy()
    return rankings.sort_values(["date", "actual_rank", "park"]).reset_index(drop=True)


def _best_park_accuracy(df):
    actual_best = df[df["actual_rank"] == 1].groupby("date")["park"].apply(list).to_dict()
    predicted_best = df[df["predicted_rank"] == 1].groupby("date")["park"].apply(list).to_dict()

    correct, total = 0, 0
    for date in actual_best:
        total += 1
        if set(actual_best[date]) & set(predicted_best.get(date, [])):
            correct += 1

    accuracy = correct / total * 100 if total else 0
    return accuracy, correct, total


def _top2_accuracy(df, total_days):
    actual_top2 = df[df["actual_rank"] <= 2].groupby("date")["park"].apply(set).to_dict()
    predicted_top2 = df[df["predicted_rank"] <= 2].groupby("date")["park"].apply(set).to_dict()

    correct = 0
    for date in actual_top2:
        if actual_top2[date] & predicted_top2.get(date, set()):
            correct += 1

    accuracy = correct / total_days * 100 if total_days else 0
    return accuracy, correct


def _monthly_performance(df):
    df = df.copy()
    df["month"] = pd.to_datetime(df["date"]).dt.month
    return df.groupby("month").agg(
        observations=("error", "count"),
        mae=("absolute_error", "mean"),
        mean_error=("error", "mean"),
        within_1=("absolute_error", lambda x: (x <= 1).mean() * 100),
    )


def _weekday_performance(df):
    df = df.copy()
    df["day_of_week"] = pd.to_datetime(df["date"]).dt.day_name()
    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday = df.groupby("day_of_week").agg(
        observations=("error", "count"),
        mae=("absolute_error", "mean"),
        mean_error=("error", "mean"),
        within_1=("absolute_error", lambda x: (x <= 1).mean() * 100),
    )
    return weekday.reindex(weekday_order)


def _bucket_performance(df):
    df = df.copy()
    df["actual_bucket"] = pd.cut(
        df["crowd_actual"],
        bins=[-0.1, 2, 4, 6, 8, 10],
        labels=["0-2", "2-4", "4-6", "6-8", "8-10"],
    )
    return df.groupby("actual_bucket", observed=False).agg(
        observations=("error", "count"),
        mae=("absolute_error", "mean"),
        mean_error=("error", "mean"),
        within_1=("absolute_error", lambda x: (x <= 1).mean() * 100),
    )


def _park_metrics(df):
    metrics = df.groupby("park").agg(
        observations=("error", "count"),
        mae=("absolute_error", "mean"),
        rmse=("squared_error", lambda x: x.mean() ** 0.5),
        mean_error=("error", "mean"),
        within_1=("absolute_error", lambda x: (x <= 1).mean() * 100),
    )

    overall = pd.DataFrame({
        "observations": [len(df)],
        "mae": [df["absolute_error"].mean()],
        "rmse": [df["squared_error"].mean() ** 0.5],
        "mean_error": [df["error"].mean()],
        "within_1": [(df["absolute_error"] <= 1).mean() * 100],
    }, index=["overall"])

    return pd.concat([metrics, overall])


def _print_report(best_correct, total_days, best_acc, top2_correct, top2_acc,
                   monthly, weekday, bucket, metrics):
    print("\n========================================")
    print("       CROWD PREDICTION RESULTS")
    print("========================================")

    print("\n=== Best Park Accuracy ===")
    print(f"Correct: {best_correct} / {total_days}")
    print(f"Accuracy: {best_acc:.1f}%")

    print("\n=== Top-2 Accuracy ===")
    print(f"Correct: {top2_correct} / {total_days}")
    print(f"Accuracy: {top2_acc:.1f}%")

    print("\n=== Monthly Performance ===")
    print(monthly.round(3))

    print("\n=== Day of Week Performance ===")
    print(weekday.round(3))

    print("\n=== Actual Crowd Bucket Performance ===")
    print(bucket.round(3))

    print("\n=== Prediction Performance ===")
    print(metrics.round(3))


def run_comparison(year, prediction_path=None, actual_path=None, save=True, verbose=True):
    """
    Compare a saved prediction file against actual crowd data for `year`.

    Completely independent of run_prediction() - call this only once
    you actually have actuals to score against (e.g. mid-year or after
    the year has played out). Forecasting a future year like 2027 with
    run_prediction() has no reason to touch this function at all.

    Returns a dict with the merged comparison dataframe plus every
    breakdown table, so you can inspect results programmatically
    instead of (or in addition to) the printed report / saved files.
    """
    prediction_path = prediction_path or prediction_file(year)
    actual_path = actual_path or actual_file(year)

    with open(actual_path) as f:
        actual = pd.DataFrame(json.load(f))
    actual["date"] = pd.to_datetime(actual["date"]).dt.date

    predicted = pd.read_json(prediction_path)
    predicted["date"] = pd.to_datetime(predicted["date"]).dt.date

    df = actual.merge(predicted, on=["park", "date"], suffixes=("_actual", "_predicted"))
    if df.empty:
        raise ValueError("No overlapping rows between actual and predicted data.")

    if verbose:
        print(f"Comparison rows: {len(df)}")

    df = _add_ranks(df)
    rankings = _build_rankings(df)
    best_acc, best_correct, total_days = _best_park_accuracy(df)
    top2_acc, top2_correct = _top2_accuracy(df, total_days)
    monthly = _monthly_performance(df)
    weekday = _weekday_performance(df)
    bucket = _bucket_performance(df)
    metrics = _park_metrics(df)

    if verbose:
        _print_report(best_correct, total_days, best_acc, top2_correct, top2_acc,
                       monthly, weekday, bucket, metrics)

    if save:
        rankings.to_json(rankings_file(year), orient="records", indent=2)
        df.to_json(comparison_file(year), orient="records", indent=2)
        metrics.to_csv(metrics_file(year))
        if verbose:
            print("\nFiles saved:")
            print(f"  {comparison_file(year).name}")
            print(f"  {metrics_file(year).name}")
            print(f"  {rankings_file(year).name}")

    return {
        "comparison": df,
        "rankings": rankings,
        "monthly": monthly,
        "weekday": weekday,
        "bucket": bucket,
        "metrics": metrics,
        "best_park_accuracy": best_acc,
        "top2_accuracy": top2_acc,
    }


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Disney park crowd forecasting")
    parser.add_argument("--year", type=int, required=True,
                         help="Year to forecast (or to compare, with --compare-only)")
    parser.add_argument("--no-tune", action="store_true",
                         help="Skip hyperparameter cross-validation and use fixed defaults")
    parser.add_argument("--compare", action="store_true",
                         help="After predicting, also compare against actual data for --year")
    parser.add_argument("--compare-only", action="store_true",
                         help="Skip prediction entirely; just score an existing prediction file")
    args = parser.parse_args()

    if args.compare_only:
        run_comparison(args.year)
        return

    run_prediction(args.year, tune=not args.no_tune)

    if args.compare:
        run_comparison(args.year)


if __name__ == "__main__":
    main()