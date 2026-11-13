from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, manual
    file_size = Column(Integer, default=0)           # in bytes
    page_count = Column(Integer, default=1)
    word_count = Column(Integer, default=0)
    subject = Column(String(100), default="General")
    raw_text = Column(Text, nullable=False)
    processed_status = Column(String(50), default="completed")  # processing, completed, failed
    is_sample = Column(Integer, default=0)          # 1 if pre-loaded sample, 0 if user upload
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    chapters = relationship("Chapter", back_populates="document", cascade="all, delete-orphan")
    summaries = relationship("GeneratedSummary", back_populates="document", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="document", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="document", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="document", cascade="all, delete-orphan")

class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    chapter_number = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    start_page = Column(Integer, default=1)
    end_page = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("UploadedDocument", back_populates="chapters")
