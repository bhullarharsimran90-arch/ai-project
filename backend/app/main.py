import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings, IS_VERCEL
from app.database import engine, SessionLocal, Base
from app.models import (
    UploadedDocument, Chapter, GeneratedSummary, Flashcard,
    Question, AnswerKey, QuizAttempt, QuizAnswer, QualityEvaluationLog, HumanRating
)
from app.routes import (
    documents_router,
    generation_router,
    materials_router,
    quizzes_router,
    quality_router,
    evaluations_router
)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI-Assisted Learning Content & Assessment Generation Platform with Factual Quality Control and Blind Human Evaluation Benchmarks."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(documents_router, prefix=settings.API_PREFIX)
app.include_router(generation_router, prefix=settings.API_PREFIX)
app.include_router(materials_router, prefix=settings.API_PREFIX)
app.include_router(quizzes_router, prefix=settings.API_PREFIX)
app.include_router(quality_router, prefix=settings.API_PREFIX)
app.include_router(evaluations_router, prefix=settings.API_PREFIX)


@app.on_event("startup")
async def startup_event():
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    print(f"[{settings.PROJECT_NAME}] Database tables verified.")

    # Seed sample documents if none exist
    db = SessionLocal()
    try:
        count = db.query(UploadedDocument).count()
        if count == 0:
            print("[Startup] Seeding educational sample documents...")
            from app.routes.documents import load_sample_documents
            await load_sample_documents(db)
            print("[Startup] Seeding complete.")
    except Exception as e:
        print(f"[Startup] Note: {e}")
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_provider": settings.active_provider,
        "environment": "vercel" if IS_VERCEL else "local"
    }


# ── Frontend SPA Static File Serving ─────────────────────────────────────────
# Resolve frontend/dist relative to the project root (two levels up from backend/app/)
# Works both locally and on Vercel (/var/task/ root)
_project_root = settings.BASE_DIR.parent          # backend/ → project root
_frontend_dist = _project_root / "frontend" / "dist"

# Fallback: if running from project root directly
if not _frontend_dist.exists():
    _frontend_dist = Path("frontend") / "dist"

if _frontend_dist.exists() and (_frontend_dist / "index.html").exists():
    # Serve compiled assets (JS/CSS/images)
    _assets_dir = _frontend_dist / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """Serve React SPA — return specific file if it exists, else index.html."""
        file_path = _frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(_frontend_dist / "index.html"))

else:
    @app.get("/")
    def index():
        return {
            "message": f"Welcome to {settings.PROJECT_NAME} API",
            "docs": "/docs",
            "active_ai_provider": settings.active_provider,
            "frontend_status": "Build the frontend or deploy with frontend/dist present."
        }
