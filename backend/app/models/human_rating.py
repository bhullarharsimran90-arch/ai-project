from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class HumanRating(Base):
    __tablename__ = "human_ratings"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    evaluator_name = Column(String(100), default="Anonymous Evaluator")
    session_id = Column(String(100), nullable=False)
    
    # 5 rating criteria on scale 1 to 5
    accuracy = Column(Integer, nullable=False)       # 1 to 5
    clarity = Column(Integer, nullable=False)        # 1 to 5
    relevance = Column(Integer, nullable=False)      # 1 to 5
    difficulty = Column(Integer, nullable=False)     # 1 to 5 (1=poorly calibrated, 5=well-calibrated)
    overall_quality = Column(Integer, nullable=False)# 1 to 5
    
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="ratings")
