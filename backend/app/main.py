# backend/app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.api import hotel_search, park_recommendations, crowd_calendar
from app.core.app import app  # your existing FastAPI instance
import os
from fastapi.middleware.cors import CORSMiddleware

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(hotel_search.router)
app.include_router(park_recommendations.router)
app.include_router(crowd_calendar.router)

# Keep your API root for info
@app.get("/api")
def root():
    return {
        "message": "Disney Planner API",
        "docs": "/docs",
        "version": "1.0.0"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}