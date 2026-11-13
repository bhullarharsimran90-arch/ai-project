from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    chapter_title = Column(String(255), default="General")
    
    front = Column(Text, nullable=False)            # Concept / Question / Prompt
    back = Column(Text, nullable=False)             # Explanation / Definition / Answer
    category = Column(String(100), default="Core Concept")
    
    # Mastery tracking
    mastery_status = Column(String(50), default="unreviewed")  # unreviewed, known, need_revision
    review_count = Column(Integer, default=0)
    last_reviewed = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("UploadedDocument", back_populates="flashcards")
