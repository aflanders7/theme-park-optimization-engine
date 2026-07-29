# Theme Park Travel Optimization Tool

A full-stack travel planning application that generates optimized theme park itineraries and hotel recommendations based on trip details, user preferences, scheduling constraints, and predicted crowd levels.

This project was built as a software engineering portfolio project. It focuses on API design, data ingestion, offline forecasting, recommendation logic, and full-stack application architecture.

Front-End Demo: [MouseDays.net](https://mousedays.net)

Backend: Currently Offline

## Project Overview

The application helps users plan theme park trips by combining historical crowd data, offline crowd forecasts, hotel information, and user-provided trip constraints. The backend exposes REST API endpoints for generating park itinerary recommendations and hotel recommendations, while the frontend provides a React-based interface for collecting trip details and displaying results.

Crowd predictions are generated offline using Prophet and historical crowd data. Those forecasted values are stored and used by the recommendation engine when evaluating possible park schedules. The model is not trained on demand and the application does not provide real-time predictions.

## Features

- Theme park itinerary recommendations based on trip dates, party size, user preferences, and scheduling constraints
- Crowd-aware scheduling logic that incorporates offline Prophet forecasts
- Hotel recommendation system with scoring logic for budget, room capacity, amenities, transportation, location, and hotel category
- REST API architecture for separating frontend user flows from backend recommendation logic
- PostgreSQL-backed persistence layer using SQLAlchemy ORM models
- Web scraping and data ingestion pipelines for collecting and loading park, crowd, hotel, room, and pricing data
- Time-series forecasting pipeline using historical crowd data to generate future crowd predictions
- Request validation with Pydantic schemas
- API rate limiting and structured error handling for recommendation endpoints
- React + TypeScript frontend with reusable form, results, and layout components

## Architecture

```text

              React + TypeScript Frontend
                           |
                  REST API Requests
                           |
                           v
                  FastAPI Backend
                           |
             Pydantic Request Validation
                           |
                           v
              Recommendation Services
                           |
          +----------------+----------------+
          |                                 |
          v                                 v
  Hotel Scoring Engine          Park Itinerary Engine
                                      |
                                      |
                         Offline Prophet Forecasts
                                      |
                         Trip Constraints & Preferences
                         (dates, party size, interests)
                           |
                           v
                    SQLAlchemy ORM
                           |
                           v
                  PostgreSQL Database


                    Data Pipeline
                           |
          +----------------+----------------+
          |                |               |
          v                v               v
   Web Scraping     Data Processing   ML Forecasting
   & Ingestion      & Transformation  (Prophet)
          |                |               |
          +----------------+---------------+
                           |
                           v
             Forecast & Recommendation Data
                  Loaded into PostgreSQL
```

The system separates presentation, API routing, business logic, and persistence:

- The frontend handles user input, client-side state, and results presentation.
- The FastAPI backend exposes REST endpoints for hotel search and park itinerary recommendations.
- Service-layer recommendation engines contain the scoring and scheduling logic.
- SQLAlchemy models represent hotels, rooms, pricing, and crowd calendar records.
- Data ingestion scripts collect and prepare datasets used by the application.
- Prophet forecasting is performed offline so the API can use precomputed crowd predictions during recommendation requests.

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- SlowAPI for rate limiting

**Data and ML**

- Prophet for offline time-series forecasting
- Historical crowd data processing
- Web scraping and data ingestion pipelines
- Recommendation scoring for hotels and park itineraries

## Recommendation Logic

The park itinerary recommendation engine evaluates possible schedules using:

- Offline crowd predictions
- Trip start and end dates
- Number of park days
- Party size and child ages
- Park preferences
- Must-visit and avoid-park constraints
- Arrival and departure day constraints
- Rest-day placement

The hotel recommendation system scores available room options using:

- Budget and average nightly price
- Total trip cost
- Room capacity
- Hotel category
- Transportation options
- Location preferences
- Room features and amenities

## Portfolio Notes

This repository is intended to demonstrate full-stack engineering, backend API design, data modeling, data ingestion, and applied forecasting workflows. The forecasting pipeline produces crowd predictions ahead of time; the live API uses stored predictions as inputs to the recommendation engine rather than training or forecasting during each request.
