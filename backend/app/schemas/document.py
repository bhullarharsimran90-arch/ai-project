from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChapterBase(BaseModel):
    chapter_number: int
    title: str
    content: str
    word_count: int = 0
    start_page: int = 1
    end_page: int = 1

class ChapterResponse(ChapterBase):
    id: int
    document_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    title: str
    subject: str = "General"

class DocumentManualCreate(DocumentBase):
    content: str = Field(..., min_length=20, description="Raw educational text")

class DocumentSummary(BaseModel):
    id: int
    title: str
    filename: str
    file_type: str
    file_size: int
    page_count: int
    word_count: int
    subject: str
    processed_status: str
    is_sample: int
    created_at: datetime
    chapter_count: int = 0

    class Config:
        from_attributes = True

class DocumentDetail(DocumentSummary):
    raw_text: str
    chapters: List[ChapterResponse] = []

    class Config:
        from_attributes = True
