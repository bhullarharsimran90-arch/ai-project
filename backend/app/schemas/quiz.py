from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class QuizStartRequest(BaseModel):
    document_id: int
    chapter_title: Optional[str] = "All"
    question_count: int = Field(default=5, ge=1, le=30)
    difficulty: Optional[str] = "All"

class QuizSubmissionItem(BaseModel):
    question_id: int
    selected_option: str  # e.g., "A", "B", "C", "D"

class QuizSubmitRequest(BaseModel):
    document_id: int
    title: Optional[str] = "Practice Assessment"
    time_spent_seconds: int = 0
    answers: List[QuizSubmissionItem]

class QuizReviewItem(BaseModel):
    question_id: int
    question_text: str
    options: List[str]
    selected_option: Optional[str]
    correct_answer: str
    is_correct: bool
    explanation: str
    source_reference: Optional[str]
    source_excerpt: Optional[str]
    blooms_level: str
    difficulty: str
    marks: int

class QuizAttemptResponse(BaseModel):
    id: int
    document_id: int
    title: str
    total_questions: int
    score: float
    max_score: float
    percentage: float
    time_spent_seconds: int
    completed_at: datetime
    results_breakdown: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class QuizAttemptDetailResponse(QuizAttemptResponse):
    reviews: List[QuizReviewItem] = []
