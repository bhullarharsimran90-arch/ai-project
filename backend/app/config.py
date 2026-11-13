import os
from pathlib import Path
from dotenv import load_dotenv

# ── Environment Detection ────────────────────────────────────────────────────
IS_VERCEL = bool(os.environ.get("VERCEL", ""))

# ── Base Directory ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent   # = backend/

# Load .env only when running locally
if not IS_VERCEL:
    load_dotenv(BASE_DIR / ".env")

# ── Storage paths ─────────────────────────────────────────────────────────────
# Vercel serverless: only /tmp is writable at runtime
if IS_VERCEL:
    _storage_root = Path("/tmp")
else:
    _storage_root = BASE_DIR

class Settings:
    PROJECT_NAME: str = "AI-Assisted Learning Content & Assessment Generation Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Directories
    BASE_DIR: Path = BASE_DIR
    UPLOAD_DIR: Path = _storage_root / "uploads"
    DATA_DIR: Path = _storage_root / "data"
    SAMPLES_DIR: Path = BASE_DIR / "app" / "samples"

    # Database – absolute path always required for SQLite
    @property
    def DATABASE_URL(self) -> str:  # type: ignore[override]
        raw = os.getenv("DATABASE_URL", "")
        if IS_VERCEL or not raw or raw.startswith("sqlite:///./"):
            return f"sqlite:///{_storage_root / 'data' / 'learning_platform.db'}"
        return raw

    # AI Providers
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto").lower()
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "").strip()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()

    @property
    def active_provider(self) -> str:
        if self.ANTHROPIC_API_KEY:
            return "anthropic"
        if self.GEMINI_API_KEY:
            return "gemini"
        if self.OPENAI_API_KEY:
            return "openai"
        return "local_engine"

    # CORS – allow all for maximum compatibility
    CORS_ORIGINS: list = ["*"]


settings = Settings()

# Ensure directories exist (will create under /tmp on Vercel)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
