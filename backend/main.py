from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, documents, processing, verification, ds160

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisaDoc API",
    description="Automated DS-160 Data Extraction & Verification",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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



@app.get("/")
def root():
    return {"message": "VisaDoc API is running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
