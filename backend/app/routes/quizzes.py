import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.document import UploadedDocument
from app.models.question import Question
from app.models.quiz import QuizAttempt, QuizAnswer
from app.schemas.quiz import (
    QuizStartRequest, QuizSubmitRequest, QuizAttemptResponse,
    QuizAttemptDetailResponse, QuizReviewItem
)

router = APIRouter(prefix="/quizzes", tags=["Interactive Quizzes"])

@router.post("/start")
def start_quiz(payload: QuizStartRequest, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == payload.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    query = db.query(Question).filter(
        Question.document_id == payload.document_id,
        Question.question_type == "mcq"
    )

    if payload.chapter_title and payload.chapter_title != "All":
        query = query.filter(Question.chapter_title == payload.chapter_title)

    if payload.difficulty and payload.difficulty != "All":
        query = query.filter(Question.difficulty == payload.difficulty)

    all_mcqs = query.all()
    if not all_mcqs:
        raise HTTPException(
            status_code=400,
            detail="No MCQ questions found for this document/chapter. Please generate questions first!"
        )

    # Randomly sample the requested count
    count = min(len(all_mcqs), payload.question_count)
    selected = random.sample(all_mcqs, count)

    questions_data = []
    for q in selected:
        questions_data.append({
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options,
            "marks": q.marks,
            "difficulty": q.difficulty,
            "blooms_level": q.blooms_level,
            "chapter_title": q.chapter_title
        })

    return {
        "document_id": doc.id,
        "document_title": doc.title,
        "total_questions": count,
        "questions": questions_data
    }

@router.post("/submit", response_model=QuizAttemptDetailResponse)
def submit_quiz(payload: QuizSubmitRequest, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == payload.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    total_q = len(payload.answers)
    if total_q == 0:
        raise HTTPException(status_code=400, detail="Submission contains no answers")

    score = 0.0
    max_score = 0.0
    reviews = []
    quiz_answers_to_save = []

    for item in payload.answers:
        q = db.query(Question).filter(Question.id == item.question_id).first()
        if not q:
            continue

        ak = q.answer_key
        correct_key = ak.correct_answer.strip().upper() if ak else "A"
        user_choice = item.selected_option.strip().upper() if item.selected_option else ""

        is_correct = (user_choice == correct_key) or (
            q.options and user_choice in [opt.strip().upper() for opt in q.options] and 
            user_choice == (ak.correct_answer.strip().upper() if ak else "")
        )

        marks_awarded = float(q.marks) if is_correct else 0.0
        score += marks_awarded
        max_score += float(q.marks)

        reviews.append(QuizReviewItem(
            question_id=q.id,
            question_text=q.question_text,
            options=q.options or [],
            selected_option=item.selected_option,
            correct_answer=ak.correct_answer if ak else "N/A",
            is_correct=is_correct,
            explanation=ak.explanation if ak else "Explanation unavailable",
            source_reference=ak.source_reference if ak else q.source_reference,
            source_excerpt=ak.supporting_info if ak else q.source_excerpt,
            blooms_level=q.blooms_level,
            difficulty=q.difficulty,
            marks=q.marks
        ))

        quiz_answers_to_save.append({
            "question_id": q.id,
            "selected_option": item.selected_option,
            "is_correct": 1 if is_correct else 0,
            "marks_awarded": marks_awarded
        })

    pct = round((score / max_score) * 100, 1) if max_score > 0 else 0.0

    attempt = QuizAttempt(
        document_id=doc.id,
        title=payload.title or f"Quiz on {doc.title}",
        total_questions=total_q,
        score=score,
        max_score=max_score,
        percentage=pct,
        time_spent_seconds=payload.time_spent_seconds,
        results_breakdown={
            "correct_count": sum(1 for r in reviews if r.is_correct),
            "incorrect_count": sum(1 for r in reviews if not r.is_correct),
            "percentage": pct
        }
    )
    db.add(attempt)
    db.flush()

    for ans_dict in quiz_answers_to_save:
        qa = QuizAnswer(
            attempt_id=attempt.id,
            question_id=ans_dict["question_id"],
            selected_option=ans_dict["selected_option"],
            is_correct=ans_dict["is_correct"],
            marks_awarded=ans_dict["marks_awarded"]
        )
        db.add(qa)

    db.commit()
    db.refresh(attempt)

    return QuizAttemptDetailResponse(
        id=attempt.id,
        document_id=attempt.document_id,
        title=attempt.title,
        total_questions=attempt.total_questions,
        score=attempt.score,
        max_score=attempt.max_score,
        percentage=attempt.percentage,
        time_spent_seconds=attempt.time_spent_seconds,
        completed_at=attempt.completed_at,
        results_breakdown=attempt.results_breakdown,
        reviews=reviews
    )

@router.get("/history/{doc_id}", response_model=List[QuizAttemptResponse])
def get_quiz_history(doc_id: int, db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.document_id == doc_id
    ).order_by(QuizAttempt.completed_at.desc()).all()
    return attempts

@router.get("/attempt/{attempt_id}", response_model=QuizAttemptDetailResponse)
def get_single_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")

    reviews = []
    for a in attempt.answers:
        q = a.question
        if not q:
            continue
        ak = q.answer_key
        reviews.append(QuizReviewItem(
            question_id=q.id,
            question_text=q.question_text,
            options=q.options or [],
            selected_option=a.selected_option,
            correct_answer=ak.correct_answer if ak else "N/A",
            is_correct=bool(a.is_correct),
            explanation=ak.explanation if ak else "",
            source_reference=ak.source_reference if ak else q.source_reference,
            source_excerpt=ak.supporting_info if ak else q.source_excerpt,
            blooms_level=q.blooms_level,
            difficulty=q.difficulty,
            marks=q.marks
        ))

    return QuizAttemptDetailResponse(
        id=attempt.id,
        document_id=attempt.document_id,
        title=attempt.title,
        total_questions=attempt.total_questions,
        score=attempt.score,
        max_score=attempt.max_score,
        percentage=attempt.percentage,
        time_spent_seconds=attempt.time_spent_seconds,
        completed_at=attempt.completed_at,
        results_breakdown=attempt.results_breakdown,
        reviews=reviews
    )
