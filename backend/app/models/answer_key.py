from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AnswerKey(Base):
    __tablename__ = "answer_keys"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), unique=True, nullable=False)
    
    correct_answer = Column(Text, nullable=False)           # "B" or the exact answer string
    explanation = Column(Text, nullable=False)              # Detailed rationale
    supporting_info = Column(Text, nullable=True)          # Supporting quotes from source text
    source_reference = Column(String(255), nullable=True)   # "Chapter 1, Section 2"
    
    # For subjective questions (2, 5, 10 marks)
    model_answer = Column(Text, nullable=True)              # Complete ideal response
    rubric_points = Column(JSON, default=list)             # [{"point": "Mentions X", "marks": 2}]
    
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="answer_key")
