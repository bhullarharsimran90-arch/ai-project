from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.document import UploadedDocument
from app.models.summary import GeneratedSummary
from app.models.flashcard import Flashcard
from app.models.question import Question
from app.models.answer_key import AnswerKey
from app.schemas.generation import (
    SummaryResponse, FlashcardResponse, FlashcardUpdateStatus,
    QuestionResponse, AnswerKeyResponse
)

router = APIRouter(prefix="/materials", tags=["Study Materials"])

# ==========================================
# 1. SUMMARIES
# ==========================================
@router.get("/summaries/{doc_id}", response_model=List[SummaryResponse])
def get_document_summaries(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    summaries = db.query(GeneratedSummary).filter(
        GeneratedSummary.document_id == doc_id
    ).order_by(GeneratedSummary.created_at.desc()).all()
    
    return summaries

# ==========================================
# 2. FLASHCARDS
# ==========================================
@router.get("/flashcards/{doc_id}")
def get_document_flashcards(
    doc_id: int,
    chapter: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    query = db.query(Flashcard).filter(Flashcard.document_id == doc_id)
    if chapter and chapter != "All":
        query = query.filter(Flashcard.chapter_title == chapter)
    if status and status != "All":
        query = query.filter(Flashcard.mastery_status == status)

    cards = query.all()
    
    # Calculate mastery progress stats
    total = len(cards)
    known = sum(1 for c in cards if c.mastery_status == "known")
    need_revision = sum(1 for c in cards if c.mastery_status == "need_revision")
    unreviewed = total - known - need_revision
    mastery_pct = round((known / total) * 100, 1) if total > 0 else 0.0

    serialized_cards = [
        {
            "id": c.id,
            "document_id": c.document_id,
            "chapter_title": c.chapter_title,
            "front": c.front,
            "back": c.back,
            "category": c.category,
            "mastery_status": c.mastery_status,
            "review_count": c.review_count,
            "last_reviewed": c.last_reviewed,
            "created_at": c.created_at
        }
        for c in cards
    ]

    return {
        "cards": serialized_cards,
        "stats": {
            "total": total,
            "known": known,
            "need_revision": need_revision,
            "unreviewed": unreviewed,
            "mastery_percentage": mastery_pct
        }
    }

@router.put("/flashcards/{card_id}/status")
def update_flashcard_status(
    card_id: int,
    payload: FlashcardUpdateStatus,
    db: Session = Depends(get_db)
):
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    card.mastery_status = payload.mastery_status
    card.review_count += 1
    card.last_reviewed = datetime.utcnow()
    db.commit()
    db.refresh(card)

    return {
        "success": True,
        "id": card.id,
        "mastery_status": card.mastery_status,
        "review_count": card.review_count
    }

# ==========================================
# 3. QUESTION BANK & ANSWER KEYS
# ==========================================
@router.get("/questions/{doc_id}")
def get_document_questions(
    doc_id: int,
    q_type: Optional[str] = Query(None),
    blooms_level: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    query = db.query(Question).filter(Question.document_id == doc_id)

    if q_type and q_type != "All":
        query = query.filter(Question.question_type == q_type)
    if blooms_level and blooms_level != "All":
        query = query.filter(Question.blooms_level == blooms_level)
    if difficulty and difficulty != "All":
        query = query.filter(Question.difficulty == difficulty)

    questions = query.order_by(Question.id.asc()).all()

    res = []
    for q in questions:
        ak = q.answer_key
        ak_dict = None
        if ak:
            ak_dict = {
                "id": ak.id,
                "question_id": ak.question_id,
                "correct_answer": ak.correct_answer,
                "explanation": ak.explanation,
                "supporting_info": ak.supporting_info,
                "source_reference": ak.source_reference,
                "model_answer": ak.model_answer,
                "rubric_points": ak.rubric_points or []
            }

        res.append({
            "id": q.id,
            "document_id": q.document_id,
            "chapter_title": q.chapter_title,
            "question_type": q.question_type,
            "question_text": q.question_text,
            "options": q.options,
            "marks": q.marks,
            "difficulty": q.difficulty,
            "blooms_level": q.blooms_level,
            "blooms_explanation": q.blooms_explanation,
            "confidence_score": q.confidence_score,
            "quality_score": q.quality_score,
            "is_grounded": q.is_grounded,
            "is_duplicate": q.is_duplicate,
            "is_ambiguous": q.is_ambiguous,
            "is_answerable": q.is_answerable,
            "source_reference": q.source_reference,
            "source_excerpt": q.source_excerpt,
            "origin": q.origin,
            "anonymous_id": q.anonymous_id,
            "answer_key": ak_dict,
            "created_at": q.created_at
        })

    return res
