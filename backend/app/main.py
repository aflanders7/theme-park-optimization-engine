# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import hotel_search

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Disney Planner API",
    description="Hotel recommendation and itinerary planning",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hotel_search.router)

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