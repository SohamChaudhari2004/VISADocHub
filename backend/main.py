from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import auth, documents, processing, verification, ds160, admin

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisaDoc API",
    description="Automated DS-160 Data Extraction & Verification",
    version="1.0.0",
)

import os

# CORS — allow frontend dev server
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://visa-doc-hub.vercel.app",
    "https://visa-doc-hub-v1uq.vercel.app/"
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url.rstrip('/'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(processing.router)
app.include_router(verification.router)
app.include_router(ds160.router)
app.include_router(admin.router)

# Mount uploads directory for static file viewing
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")



@app.get("/")
def root():
    return {"message": "VisaDoc API is running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
