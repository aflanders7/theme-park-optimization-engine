# train_prophet.py
import pandas as pd
import json
from pathlib import Path
from prophet import Prophet

# ---------------------------
# Paths
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent / "output"  # scrapers/output
CROWD_FILES = [BASE_DIR / f"disney_crowd_202{year}.json" for year in range(2,6)]
EVENTS_FILE = BASE_DIR / "events.json"
OUTPUT_FILE = BASE_DIR / "predicted_crowds_2026.json"

# ---------------------------
# Load crowd data
# ---------------------------
crowd_dfs = []
for file_path in CROWD_FILES:
    df = pd.read_json(file_path)
    df['date'] = pd.to_datetime(df['date'])
    crowd_dfs.append(df)

crowd_df = pd.concat(crowd_dfs, ignore_index=True)
parks = crowd_df['park'].unique()

# ---------------------------
# Load events and expand multi-day events
# ---------------------------
with open(EVENTS_FILE, 'r') as f:
    events = json.load(f)

holiday_rows = []
for e in events:
    start = pd.to_datetime(e['start_date'])
    end = pd.to_datetime(e['end_date'])
    for d in pd.date_range(start, end):
        holiday_rows.append({
            'holiday': e['event_name'],
            'ds': d,
            'lower_window': 0,
            'upper_window': 0
        })

holidays_df = pd.DataFrame(holiday_rows)

# ---------------------------
# Train Prophet per park and predict 2026
# ---------------------------
predictions = []

for park in parks:
    print(f"Training Prophet for {park}...")
    park_df = crowd_df[crowd_df['park'] == park].copy()
    park_df = park_df.rename(columns={'date':'ds', 'crowd':'y'})

    model = Prophet(
        weekly_seasonality=True,
        yearly_seasonality=True,
        holidays=holidays_df
    )
    model.fit(park_df)

    # Predict all of 2026
    future = model.make_future_dataframe(periods=365)
    forecast = model.predict(future)

    forecast['park'] = park
    predictions.append(forecast[['park', 'ds', 'yhat']])

# ---------------------------
# Combine predictions and save
# ---------------------------
result_df = pd.concat(predictions, ignore_index=True)
result_df = result_df.rename(columns={'ds':'date', 'yhat':'crowd'})

# Clip crowd predictions to 0–10
result_df['crowd'] = result_df['crowd'].clip(0,10)

# Save to JSON
result_df.to_json(OUTPUT_FILE, orient='records', date_format='iso')
print("Predictions saved to:", OUTPUT_FILE)
