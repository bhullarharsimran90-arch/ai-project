import os
import sys
from pathlib import Path
import uvicorn

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent / "backend"
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Starting AI-Assisted Learning Content & Assessment Platform")
    print("📍 URL: http://127.0.0.1:8000")
    print("📖 API Documentation: http://127.0.0.1:8000/docs")
    print("=" * 70)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )
