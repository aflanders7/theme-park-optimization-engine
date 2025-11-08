# backend/app/main.py
from fastapi import FastAPI
from app.database import engine, Base
from app.api import hotel_search, park_recommendations
from app.core.app import app

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(hotel_search.router)
app.include_router(park_recommendations.router)

@app.get("/")
def root():
    return {
        "message": "Disney Planner API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}