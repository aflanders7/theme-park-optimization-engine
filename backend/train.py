# train_prophet.py
import pandas as pd
import json
from pathlib import Path
from prophet import Prophet

# ---------------------------
# Paths
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent 
DATA_DIR = BASE_DIR / "scrapers" / "output"

def data_path(file_name): return DATA_DIR / file_name


CROWD_FILES = [data_path(f"disney_crowd_202{year}.json") for year in range(5, 6)]
EVENTS_FILE = DATA_DIR / "events.json"
OUTPUT_FILE = DATA_DIR / "predicted_crowds_2026_3.json"

# ---------------------------
# Load historical crowd data
# ---------------------------
print("Loading historical crowd data...")
dfs = []
for file in CROWD_FILES:
    print(f"Reading {file}...")
    with open(file, "r") as f:
        data = json.load(f)
        dfs.append(pd.DataFrame(data))

crowd_df = pd.concat(dfs, ignore_index=True)
crowd_df['date'] = pd.to_datetime(crowd_df['date'])
parks = crowd_df['park'].unique()
print("Historical crowd data loaded.")

# ---------------------------
# Load events and expand multi-day events
# ---------------------------
print("Loading events...")
with open(EVENTS_FILE, "r") as f:
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
print(f"{len(holidays_df)} total holiday/event days loaded.")

# ---------------------------
# Train Prophet per park and predict 2026
# ---------------------------
predictions = []

for park in parks:
    print(f"\nTraining Prophet for {park}...")
    park_df = crowd_df[crowd_df['park'] == park].copy()
    park_df = park_df.rename(columns={'date':'ds', 'crowd':'y'})

    model = Prophet(
        weekly_seasonality=True,
        yearly_seasonality=True,
        holidays=holidays_df
    )
    model.fit(park_df)

    print(f"Predicting 2026 crowds for {park}...")
    future_dates = pd.date_range(start="2026-01-01", end="2026-12-31")
    future = pd.DataFrame({'ds': future_dates})
    forecast = model.predict(future)

    forecast['park'] = park
    predictions.append(forecast[['park', 'ds', 'yhat']])

# ---------------------------
# Combine predictions and save
# ---------------------------
result_df = pd.concat(predictions, ignore_index=True)
result_df = result_df.rename(columns={'ds':'date', 'yhat':'crowd'})

result_df['crowd'] = result_df['crowd'].round(1)

# Clip crowd predictions to 0–10 scale
result_df['crowd'] = result_df['crowd'].clip(0,10)

# Save as JSON
result_df.to_json(OUTPUT_FILE, orient='records', date_format='iso')
print("\nPredictions saved to:", OUTPUT_FILE)
