# backend/app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.api import hotel_search, park_recommendations
from app.core.app import app  # your existing FastAPI instance
import os

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(hotel_search.router)
app.include_router(park_recommendations.router)

# Serve Vite frontend
frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../frontend/dist")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

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