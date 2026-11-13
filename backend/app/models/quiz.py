from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    title = Column(String(255), default="Practice Quiz")
    total_questions = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Store answers and analytics as JSON
    results_breakdown = Column(JSON, default=dict)
    
    document = relationship("UploadedDocument", back_populates="quiz_attempts")
    answers = relationship("QuizAnswer", back_populates="attempt", cascade="all, delete-orphan")

class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    selected_option = Column(String(255), nullable=True)    # e.g., "A" or text
    is_correct = Column(Integer, default=0)                 # 1 = correct, 0 = wrong
    marks_awarded = Column(Float, default=0.0)
    
    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("Question")
