import json
import pandas as pd
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"

# ---------------------------
# Load data
# ---------------------------

with open(OUTPUT_DIR / "disney_crowd_2026.json") as f:
    actual = pd.DataFrame(json.load(f))

with open(OUTPUT_DIR / "predicted_crowds_2026_4.json") as f:
    predicted = pd.DataFrame(json.load(f))

# ---------------------------
# Normalize dates
# ---------------------------

actual["date"] = pd.to_datetime(actual["date"]).dt.date
predicted["date"] = pd.to_datetime(predicted["date"]).dt.date

# ---------------------------
# Merge actual + predicted
# ---------------------------

df = actual.merge(
    predicted,
    on=["park", "date"],
    suffixes=("_actual", "_predicted")
)

# ---------------------------
# Calculate errors
# ---------------------------

df["error"] = df["crowd_predicted"] - df["crowd_actual"]
df["absolute_error"] = df["error"].abs()
df["squared_error"] = df["error"] ** 2

# ---------------------------
# Rank parks within each date
# ---------------------------

df["actual_rank"] = df.groupby("date")["crowd_actual"].rank(method="min")
df["predicted_rank"] = df.groupby("date")["crowd_predicted"].rank(method="min")

# ---------------------------
# Best park accuracy
# ---------------------------

best_park = df[df["actual_rank"] == 1].merge(
    df[df["predicted_rank"] == 1][["date", "park"]],
    on="date",
    suffixes=("_actual", "_predicted")
)

correct_best_park = (
    best_park["park_actual"] == best_park["park_predicted"]
).sum()

total_days = best_park["date"].nunique()

best_park_accuracy = (
    correct_best_park / total_days * 100
    if total_days > 0
    else 0
)

# ---------------------------
# Monthly performance
# ---------------------------

df["month"] = pd.to_datetime(df["date"]).dt.month

monthly = df.groupby("month").agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    mean_error=("error", "mean"),
    within_1=("absolute_error", lambda x: (x <= 1).mean() * 100)
)

# ---------------------------
# Day of week performance
# ---------------------------

df["day_of_week"] = pd.to_datetime(df["date"]).dt.day_name()

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
    within_1=("absolute_error", lambda x: (x <= 1).mean() * 100)
)

weekday = weekday.reindex(weekday_order)

# ---------------------------
# Actual crowd buckets
# ---------------------------

df["actual_bucket"] = pd.cut(
    df["crowd_actual"],
    bins=[-0.1, 2, 4, 6, 8, 10],
    labels=["0-2", "2-4", "4-6", "6-8", "8-10"]
)

bucket = df.groupby("actual_bucket", observed=False).agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    mean_error=("error", "mean"),
    within_1=("absolute_error", lambda x: (x <= 1).mean() * 100)
)

# ---------------------------
# Per-park performance
# ---------------------------

metrics = df.groupby("park").agg(
    observations=("error", "count"),
    mae=("absolute_error", "mean"),
    rmse=("squared_error", lambda x: (x.mean()) ** 0.5),
    mean_error=("error", "mean"),
    within_1=("absolute_error", lambda x: (x <= 1).mean() * 100),
)

# ---------------------------
# Overall performance
# ---------------------------

overall = pd.DataFrame({
    "observations": [len(df)],
    "mae": [df["absolute_error"].mean()],
    "rmse": [(df["squared_error"].mean()) ** 0.5],
    "mean_error": [df["error"].mean()],
    "within_1": [(df["absolute_error"] <= 1).mean() * 100],
}, index=["overall"])

metrics = pd.concat([metrics, overall])

# ---------------------------
# Print results
# ---------------------------

print("\n=== Best Park Accuracy ===")
print(f"Correct: {correct_best_park} / {total_days}")
print(f"Accuracy: {best_park_accuracy:.1f}%")

print("\n=== Monthly Performance ===")
print(monthly.round(3))

print("\n=== Day of Week Performance ===")
print(weekday.round(3))

print("\n=== Actual Crowd Bucket Performance ===")
print(bucket.round(3))

print("\n=== Prediction Performance ===")
print(metrics.round(3))

# ---------------------------
# Save detailed comparison
# ---------------------------

df.to_json(
    OUTPUT_DIR / "crowd_comparison_2026_4.json",
    orient="records",
    indent=2
)

metrics.to_csv(
    OUTPUT_DIR / "crowd_prediction_metrics_2026.csv"
)

print("\nSaved:")
print("  crowd_comparison_2026.json")
print("  crowd_prediction_metrics_2026.csv")