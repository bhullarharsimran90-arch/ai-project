from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class GenerateContentRequest(BaseModel):
    document_id: int
    chapter_title: Optional[str] = "Full Document"
    summary_length: Optional[str] = "medium"  # "short", "medium", "detailed", "all"
    generate_summary: bool = True
    generate_flashcards: bool = True
    generate_mcqs: bool = True
    generate_questions: bool = True
    mcq_count: int = Field(default=5, ge=1, le=20)
    questions_count: int = Field(default=4, ge=1, le=15)
    target_difficulty: Optional[str] = "Mixed"  # "Easy", "Medium", "Hard", "Mixed"

class DefinitionItem(BaseModel):
    term: str
    definition: str

class FormulaItem(BaseModel):
    name: str
    formula: str
    notes: Optional[str] = ""

class SummaryResponse(BaseModel):
    id: int
    document_id: int
    chapter_title: str
    short_summary: str
    medium_summary: str
    detailed_summary: str
    key_definitions: List[Dict[str, Any]] = []
    key_concepts: List[str] = []
    formulas_and_laws: List[Dict[str, Any]] = []
    chapter_notes: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class FlashcardResponse(BaseModel):
    id: int
    document_id: int
    chapter_title: str
    front: str
    back: str
    category: str
    mastery_status: str
    review_count: int
    last_reviewed: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FlashcardUpdateStatus(BaseModel):
    mastery_status: str = Field(..., pattern="^(known|need_revision|unreviewed)$")

class AnswerKeyResponse(BaseModel):
    id: int
    question_id: int
    correct_answer: str
    explanation: str
    supporting_info: Optional[str] = None
    source_reference: Optional[str] = None
    model_answer: Optional[str] = None
    rubric_points: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: int
    document_id: int
    chapter_title: str
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    marks: int
    difficulty: str
    blooms_level: str
    blooms_explanation: Optional[str] = None
    confidence_score: float
    quality_score: float
    is_grounded: int
    is_duplicate: int
    is_ambiguous: int
    is_answerable: int
    source_reference: Optional[str] = None
    source_excerpt: Optional[str] = None
    origin: str
    anonymous_id: Optional[str] = None
    answer_key: Optional[AnswerKeyResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class GenerationResultResponse(BaseModel):
    success: bool
    document_id: int
    chapter_title: str
    summary_id: Optional[int] = None
    flashcards_count: int = 0
    mcqs_count: int = 0
    questions_count: int = 0
    quality_score_avg: float = 0.0
    message: str
