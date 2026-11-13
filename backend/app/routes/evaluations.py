from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.question import Question
from app.models.human_rating import HumanRating
from app.schemas.evaluation import (
    BlindQuestionCard, BlindRatingSubmitRequest,
    BlindEvaluationDashboardResponse
)
from app.services.blind_evaluation import BlindEvaluationService

router = APIRouter(prefix="/evaluations", tags=["Blind Human Evaluation"])

@router.get("/blind-deck", response_model=List[BlindQuestionCard])
def get_blind_question_deck(limit: int = Query(8, ge=2, le=20), db: Session = Depends(get_db)):
    """
    Returns a randomized deck of AI and Human questions with anonymized IDs (e.g. EVAL-9281).
    All labels showing origin, database ID, and author are removed.
    """
    deck = BlindEvaluationService.get_blind_question_deck(db, limit=limit)
    return [BlindQuestionCard(**q) for q in deck]

@router.post("/rate")
def submit_blind_rating(payload: BlindRatingSubmitRequest, db: Session = Depends(get_db)):
    """
    Records a blind rating from an evaluator for an anonymous question ID.
    The evaluator does NOT know if the question is AI or human.
    """
    # Lookup question by anonymous_id
    question = db.query(Question).filter(Question.anonymous_id == payload.anonymous_id).first()
    if not question:
        raise HTTPException(
            status_code=404,
            detail=f"Question with ID '{payload.anonymous_id}' not found in active evaluation pool."
        )

    rating = HumanRating(
        question_id=question.id,
        evaluator_name=payload.evaluator_name or "Anonymous Evaluator",
        session_id=payload.session_id,
        accuracy=payload.accuracy,
        clarity=payload.clarity,
        relevance=payload.relevance,
        difficulty=payload.difficulty,
        overall_quality=payload.overall_quality,
        comments=payload.comments
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    return {
        "success": True,
        "message": f"Rating for {payload.anonymous_id} recorded successfully.",
        "rating_id": rating.id
    }

@router.get("/dashboard", response_model=BlindEvaluationDashboardResponse)
def get_evaluation_dashboard(db: Session = Depends(get_db)):
    """
    Returns aggregated comparative analytics (AI-generated vs Human-authored).
    Used in the administrator/researcher comparison dashboard.
    """
    dashboard_data = BlindEvaluationService.calculate_dashboard_metrics(db)
    return BlindEvaluationDashboardResponse(**dashboard_data)
