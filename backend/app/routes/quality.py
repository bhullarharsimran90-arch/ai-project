from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import UploadedDocument
from app.models.question import Question
from app.schemas.evaluation import QualityAuditResponse, QualityFinding
from app.services.quality_control import QualityControlEngine
from app.services.blooms_taxonomy import BloomsTaxonomyClassifier

router = APIRouter(prefix="/quality", tags=["Quality Control & Bloom's Taxonomy"])

@router.get("/audit/{doc_id}", response_model=QualityAuditResponse)
def audit_document_quality(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    questions = db.query(Question).filter(Question.document_id == doc_id).all()
    if not questions:
        return QualityAuditResponse(
            document_id=doc.id,
            total_evaluated=0,
            passed_qc=0,
            duplicates_flagged=0,
            ambiguous_flagged=0,
            unsupported_flagged=0,
            avg_confidence_score=0.0,
            avg_quality_score=0.0,
            findings=[]
        )

    findings = []
    dup_count = 0
    amb_count = 0
    unsup_count = 0
    passed_count = 0
    conf_scores = []
    qual_scores = []

    # Prepare dicts for duplicate checker
    q_dicts = [
        {"id": q.id, "question_text": q.question_text, "blooms_level": q.blooms_level}
        for q in questions
    ]
    duplicates = QualityControlEngine.detect_duplicates(q_dicts)
    dup_indices = {j for (i, j, sim) in duplicates}

    for idx, q in enumerate(questions):
        conf_scores.append(q.confidence_score)
        qual_scores.append(q.quality_score)

        has_issue = False

        # Duplicate check
        if idx in dup_indices or q.is_duplicate:
            dup_count += 1
            has_issue = True
            findings.append(QualityFinding(
                question_id=q.id,
                question_text=q.question_text[:100] + "...",
                issue_type="duplicate",
                description="High lexical similarity detected with another assessment item in this chapter.",
                severity="warning",
                confidence_score=q.confidence_score,
                recommendation="Recommend re-phrasing stem or testing an alternate concept."
            ))

        # Ambiguity check
        if q.is_ambiguous:
            amb_count += 1
            has_issue = True
            findings.append(QualityFinding(
                question_id=q.id,
                question_text=q.question_text[:100] + "...",
                issue_type="ambiguous",
                description="Contains vague phrasing or lacks clearly defined evaluation criteria.",
                severity="warning",
                confidence_score=q.confidence_score,
                recommendation="Specify clear conditions or provide explicit context in the prompt."
            ))

        # Unsupported / Factual Grounding
        if not q.is_grounded:
            unsup_count += 1
            has_issue = True
            findings.append(QualityFinding(
                question_id=q.id,
                question_text=q.question_text[:100] + "...",
                issue_type="unsupported",
                description="Potential hallucination risk: terminology and claims not fully grounded in uploaded source text.",
                severity="critical",
                confidence_score=q.confidence_score,
                recommendation="Verify against textbook excerpts and align with source sections."
            ))

        if not has_issue:
            passed_count += 1

    avg_conf = round(sum(conf_scores) / len(conf_scores), 1) if conf_scores else 95.0
    avg_qual = round(sum(qual_scores) / len(qual_scores), 1) if qual_scores else 92.0

    return QualityAuditResponse(
        document_id=doc.id,
        total_evaluated=len(questions),
        passed_qc=passed_count,
        duplicates_flagged=dup_count,
        ambiguous_flagged=amb_count,
        unsupported_flagged=unsup_count,
        avg_confidence_score=avg_conf,
        avg_quality_score=avg_qual,
        findings=findings
    )

@router.get("/blooms-distribution/{doc_id}")
def get_blooms_distribution(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    questions = db.query(Question).filter(Question.document_id == doc_id).all()
    total = len(questions)

    # Initialize count for all 6 levels
    levels = BloomsTaxonomyClassifier.LEVELS
    counts = {lvl: 0 for lvl in levels}
    difficulty_map = {lvl: {"Easy": 0, "Medium": 0, "Hard": 0} for lvl in levels}

    for q in questions:
        lvl = q.blooms_level if q.blooms_level in counts else "Understand"
        counts[lvl] += 1
        diff = q.difficulty or "Medium"
        if diff in difficulty_map[lvl]:
            difficulty_map[lvl][diff] += 1

    chart_data = []
    colors = {
        "Remember": "#3B82F6",    # Blue
        "Understand": "#14B8A6",  # Teal
        "Apply": "#10B981",       # Green
        "Analyze": "#F59E0B",     # Amber
        "Evaluate": "#8B5CF6",    # Purple
        "Create": "#F43F5E"       # Rose
    }

    for lvl in levels:
        c = counts[lvl]
        pct = round((c / total) * 100, 1) if total > 0 else 0.0
        chart_data.append({
            "level": lvl,
            "count": c,
            "percentage": pct,
            "fill": colors.get(lvl, "#6366F1"),
            "easy": difficulty_map[lvl]["Easy"],
            "medium": difficulty_map[lvl]["Medium"],
            "hard": difficulty_map[lvl]["Hard"]
        })

    return {
        "document_id": doc.id,
        "document_title": doc.title,
        "total_questions": total,
        "distribution": chart_data
    }
