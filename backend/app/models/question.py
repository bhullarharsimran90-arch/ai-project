from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    chapter_title = Column(String(255), default="General")
    
    # Question specifications
    question_type = Column(String(50), nullable=False)  # "mcq", "short_answer", "long_answer"
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)               # For MCQs: ["Option A", "Option B", "Option C", "Option D"]
    marks = Column(Integer, default=1)                  # 1 for MCQ, 2 for short, 5 for medium, 10 for long
    difficulty = Column(String(50), default="Medium")   # "Easy", "Medium", "Hard"
    
    # Bloom's Taxonomy Classification
    # Levels: Remember, Understand, Apply, Analyze, Evaluate, Create
    blooms_level = Column(String(50), default="Understand")
    blooms_explanation = Column(Text, nullable=True)
    
    # Quality Control & Grounding
    confidence_score = Column(Float, default=95.0)      # 0 to 100%
    quality_score = Column(Float, default=92.0)         # 0 to 100%
    is_grounded = Column(Integer, default=1)            # 1 = factual to source, 0 = potential hallucination
    is_duplicate = Column(Integer, default=0)           # 1 if detected as duplicate
    is_ambiguous = Column(Integer, default=0)           # 1 if flagged ambiguous
    is_answerable = Column(Integer, default=1)          # 1 if directly answerable from source
    
    # Source Citations
    source_reference = Column(String(255), nullable=True) # e.g. "Chapter 2, Page 4" or "Section 1.3"
    source_excerpt = Column(Text, nullable=True)        # Exact quote from uploaded text
    
    # Evaluation Origin & Blind Anonymization
    origin = Column(String(50), default="ai")           # "ai" or "human"
    anonymous_id = Column(String(50), index=True, nullable=True) # e.g. "EVAL-7492"
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("UploadedDocument", back_populates="questions")
    answer_key = relationship("AnswerKey", uselist=False, back_populates="question", cascade="all, delete-orphan")
    ratings = relationship("HumanRating", back_populates="question", cascade="all, delete-orphan")
