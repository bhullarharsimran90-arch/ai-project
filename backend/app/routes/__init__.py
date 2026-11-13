from app.routes.documents import router as documents_router
from app.routes.generation import router as generation_router
from app.routes.study_materials import router as materials_router
from app.routes.quizzes import router as quizzes_router
from app.routes.quality import router as quality_router
from app.routes.evaluations import router as evaluations_router

__all__ = [
    "documents_router",
    "generation_router",
    "materials_router",
    "quizzes_router",
    "quality_router",
    "evaluations_router"
]
