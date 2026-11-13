from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class QualityAuditRequest(BaseModel):
    document_id: int

class QualityFinding(BaseModel):
    question_id: int
    question_text: str
    issue_type: str  # "duplicate", "ambiguous", "unsupported", "low_confidence", "perfect"
    description: str
    severity: str    # "info", "warning", "critical"
    confidence_score: float
    recommendation: str

class QualityAuditResponse(BaseModel):
    document_id: int
    total_evaluated: int
    passed_qc: int
    duplicates_flagged: int
    ambiguous_flagged: int
    unsupported_flagged: int
    avg_confidence_score: float
    avg_quality_score: float
    findings: List[QualityFinding] = []

# Blind Evaluation Schemas
class BlindQuestionCard(BaseModel):
    anonymous_id: str
    question_text: str
    question_type: str
    options: Optional[List[str]] = None
    blooms_level: str
    marks: int
    # Note: 'origin' and 'id' are intentionally excluded or masked here so the human evaluator sees zero hints of AI vs Human!

class BlindRatingSubmitRequest(BaseModel):
    anonymous_id: str
    evaluator_name: Optional[str] = "Anonymous Evaluator"
    session_id: str
    accuracy: int = Field(..., ge=1, le=5, description="Factual correctness against topic (1-5)")
    clarity: int = Field(..., ge=1, le=5, description="Question wording clarity and readability (1-5)")
    relevance: int = Field(..., ge=1, le=5, description="Relevance to educational curriculum (1-5)")
    difficulty: int = Field(..., ge=1, le=5, description="Difficulty calibration and fairness (1-5)")
    overall_quality: int = Field(..., ge=1, le=5, description="Overall educational quality (1-5)")
    comments: Optional[str] = ""

class BlindComparisonMetric(BaseModel):
    criteria: str
    ai_average: float
    human_average: float
    difference: float

class BlindEvaluationDashboardResponse(BaseModel):
    total_evaluations: int
    ai_questions_rated: int
    human_questions_rated: int
    metrics_comparison: List[BlindComparisonMetric]
    ai_overall_mean: float
    human_overall_mean: float
    t_test_p_value_mock: Optional[float] = 0.42
    status_summary: str
    recent_ratings: List[Dict[str, Any]] = []
