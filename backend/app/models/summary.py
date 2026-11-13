from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class GeneratedSummary(Base):
    __tablename__ = "generated_summaries"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    chapter_title = Column(String(255), default="Full Document")
    
    # Summaries of varying length
    short_summary = Column(Text, nullable=False)
    medium_summary = Column(Text, nullable=False)
    detailed_summary = Column(Text, nullable=False)
    
    # Structured educational elements
    key_definitions = Column(JSON, default=list)    # [{"term": "...", "definition": "..."}]
    key_concepts = Column(JSON, default=list)       # ["concept 1", "concept 2"]
    formulas_and_laws = Column(JSON, default=list)  # [{"name": "...", "formula": "...", "notes": "..."}]
    chapter_notes = Column(JSON, default=list)      # bullet points / notes breakdown
    
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("UploadedDocument", back_populates="summaries")
