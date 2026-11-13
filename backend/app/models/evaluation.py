from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from datetime import datetime
from app.database import Base

class QualityEvaluationLog(Base):
    __tablename__ = "quality_evaluation_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    
    total_evaluated = Column(Integer, default=0)
    passed_qc = Column(Integer, default=0)
    duplicates_flagged = Column(Integer, default=0)
    ambiguous_flagged = Column(Integer, default=0)
    unsupported_flagged = Column(Integer, default=0)
    avg_confidence_score = Column(Float, default=0.0)
    avg_quality_score = Column(Float, default=0.0)
    
    # Detailed findings list
    audit_findings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
