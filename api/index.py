"""
Vercel serverless entry point for the CogniLearn AI Platform.
This module imports the FastAPI app and wraps it with Mangum for
AWS Lambda / Vercel serverless compatibility.
"""
import sys
import os
from pathlib import Path

# ── Add backend to Python path ──────────────────────────────────────────────
# In Vercel, files are deployed to /var/task/
# So backend/ is at /var/task/backend/
_root = Path(__file__).resolve().parent.parent   # project root
_backend = _root / "backend"
sys.path.insert(0, str(_backend))

# ── Override paths for Vercel serverless environment ───────────────────────
# /tmp is the only writable directory in Vercel serverless functions
os.environ.setdefault("VERCEL", "1")

# ── Import and expose the FastAPI app ──────────────────────────────────────
from app.main import app  # noqa: E402

# Mangum wraps the ASGI app for the serverless handler
from mangum import Mangum  # noqa: E402

handler = Mangum(app, lifespan="off")
