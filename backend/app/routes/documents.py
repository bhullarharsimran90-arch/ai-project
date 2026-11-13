import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.document import UploadedDocument, Chapter
from app.models.question import Question
from app.models.answer_key import AnswerKey
from app.schemas.document import DocumentSummary, DocumentDetail, DocumentManualCreate
from app.services.document_parser import DocumentParser
from app.services.ai_service import AIService
from app.samples.sample_documents import SAMPLE_DOCS, SAMPLE_HUMAN_QUESTIONS

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentSummary])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(UploadedDocument).order_by(UploadedDocument.created_at.desc()).all()
    results = []
    for d in docs:
        item = DocumentSummary(
            id=d.id,
            title=d.title,
            filename=d.filename,
            file_type=d.file_type,
            file_size=d.file_size,
            page_count=d.page_count,
            word_count=d.word_count,
            subject=d.subject,
            processed_status=d.processed_status,
            is_sample=d.is_sample,
            created_at=d.created_at,
            chapter_count=len(d.chapters)
        )
        results.append(item)
    return results

@router.get("/{doc_id}", response_model=DocumentDetail)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentDetail(
        id=doc.id,
        title=doc.title,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        page_count=doc.page_count,
        word_count=doc.word_count,
        subject=doc.subject,
        processed_status=doc.processed_status,
        is_sample=doc.is_sample,
        created_at=doc.created_at,
        chapter_count=len(doc.chapters),
        raw_text=doc.raw_text,
        chapters=doc.chapters
    )

@router.post("/upload", response_model=DocumentDetail)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    subject: str = Form("General"),
    db: Session = Depends(get_db)
):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload PDF, DOCX, or TXT."
        )

    # Save to uploads directory
    save_path = settings.UPLOAD_DIR / file.filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = save_path.stat().st_size
    doc_title = title.strip() if title and title.strip() else file.filename.rsplit(".", 1)[0]

    # Extract text based on file format
    try:
        if ext == "pdf":
            raw_text, _, total_pages = DocumentParser.extract_from_pdf(save_path)
        elif ext == "docx":
            raw_text, _, total_pages = DocumentParser.extract_from_docx(save_path)
        else:  # txt
            raw_text, total_pages = DocumentParser.extract_from_txt(save_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document text: {str(e)}")

    word_count = len(raw_text.split())

    # Create document record
    doc = UploadedDocument(
        title=doc_title,
        filename=file.filename,
        file_type=ext,
        file_size=file_size,
        page_count=total_pages,
        word_count=word_count,
        subject=subject,
        raw_text=raw_text,
        processed_status="completed",
        is_sample=0
    )
    db.add(doc)
    db.flush()

    # Parse and store chapters
    chapters_data = DocumentParser.segment_into_chapters(raw_text, total_pages)
    for c in chapters_data:
        ch = Chapter(
            document_id=doc.id,
            chapter_number=c.get("chapter_number", 1),
            title=c.get("title", f"Chapter {c.get('chapter_number', 1)}"),
            content=c.get("content", ""),
            word_count=c.get("word_count", 0),
            start_page=c.get("start_page", 1),
            end_page=c.get("end_page", 1)
        )
        db.add(ch)

    db.commit()
    db.refresh(doc)
    return doc

@router.post("/manual", response_model=DocumentDetail)
def create_manual_document(
    data: DocumentManualCreate,
    db: Session = Depends(get_db)
):
    raw_text = data.content.strip()
    word_count = len(raw_text.split())
    total_pages = max(1, (word_count + 349) // 350)

    doc = UploadedDocument(
        title=data.title,
        filename=f"{data.title.lower().replace(' ', '_')}.txt",
        file_type="manual",
        file_size=len(raw_text.encode('utf-8')),
        page_count=total_pages,
        word_count=word_count,
        subject=data.subject,
        raw_text=raw_text,
        processed_status="completed",
        is_sample=0
    )
    db.add(doc)
    db.flush()

    # Parse chapters
    chapters_data = DocumentParser.segment_into_chapters(raw_text, total_pages)
    for c in chapters_data:
        ch = Chapter(
            document_id=doc.id,
            chapter_number=c.get("chapter_number", 1),
            title=c.get("title", "Section 1"),
            content=c.get("content", ""),
            word_count=c.get("word_count", 0),
            start_page=c.get("start_page", 1),
            end_page=c.get("end_page", 1)
        )
        db.add(ch)

    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(doc)
    db.commit()
    return {"success": True, "message": f"Document '{doc.title}' deleted successfully"}

@router.post("/load-samples")
async def load_sample_documents(db: Session = Depends(get_db)):
    """
    Seeds rich educational documents, generates initial content,
    and populates human reference questions for blind evaluation.
    """
    created_docs = []

    for s in SAMPLE_DOCS:
        # Check if already exists
        existing = db.query(UploadedDocument).filter(UploadedDocument.title == s["title"]).first()
        if existing:
            created_docs.append(existing.id)
            continue

        raw_text = s["content"].strip()
        word_count = len(raw_text.split())
        est_pages = 5

        doc = UploadedDocument(
            title=s["title"],
            filename=s["filename"],
            file_type=s["file_type"],
            file_size=len(raw_text.encode('utf-8')),
            page_count=est_pages,
            word_count=word_count,
            subject=s["subject"],
            raw_text=raw_text,
            processed_status="completed",
            is_sample=1
        )
        db.add(doc)
        db.flush()

        # Chapters
        chapters_data = DocumentParser.segment_into_chapters(raw_text, est_pages)
        for c in chapters_data:
            ch = Chapter(
                document_id=doc.id,
                chapter_number=c.get("chapter_number", 1),
                title=c.get("title", "Chapter 1"),
                content=c.get("content", ""),
                word_count=c.get("word_count", 0),
                start_page=c.get("start_page", 1),
                end_page=c.get("end_page", 1)
            )
            db.add(ch)

        # Generate initial learning content for this sample document
        # 1. Summary
        summary_data = await AIService.generate_summary(raw_text, "Full Document", "medium")
        from app.models.summary import GeneratedSummary
        sum_record = GeneratedSummary(
            document_id=doc.id,
            chapter_title="Full Document",
            short_summary=summary_data["short_summary"],
            medium_summary=summary_data["medium_summary"],
            detailed_summary=summary_data["detailed_summary"],
            key_definitions=summary_data["key_definitions"],
            key_concepts=summary_data["key_concepts"],
            formulas_and_laws=summary_data["formulas_and_laws"],
            chapter_notes=summary_data["chapter_notes"]
        )
        db.add(sum_record)

        # 2. Flashcards
        flashcards_data = await AIService.generate_flashcards(raw_text, "Core Syllabus", count=6)
        from app.models.flashcard import Flashcard
        for fc in flashcards_data:
            fc_record = Flashcard(
                document_id=doc.id,
                chapter_title=fc.get("chapter_title", "General"),
                front=fc["front"],
                back=fc["back"],
                category=fc.get("category", "Concept"),
                mastery_status="unreviewed"
            )
            db.add(fc_record)

        # 3. AI Generated Questions & Answer Keys
        questions_data = await AIService.generate_questions(raw_text, "Core Syllabus", mcq_count=5, subjective_count=3)
        for q in questions_data:
            q_rec = Question(
                document_id=doc.id,
                chapter_title=q.get("source_reference", "General"),
                question_type=q["question_type"],
                question_text=q["question_text"],
                options=q.get("options"),
                marks=q.get("marks", 1),
                difficulty=q.get("difficulty", "Medium"),
                blooms_level=q.get("blooms_level", "Understand"),
                blooms_explanation=q.get("blooms_explanation"),
                confidence_score=q.get("confidence_score", 95.0),
                quality_score=q.get("quality_score", 92.0),
                is_grounded=q.get("is_grounded", 1),
                is_duplicate=q.get("is_duplicate", 0),
                is_ambiguous=q.get("is_ambiguous", 0),
                is_answerable=q.get("is_answerable", 1),
                source_reference=q.get("source_reference"),
                source_excerpt=q.get("source_excerpt"),
                origin="ai",
                anonymous_id=q.get("anonymous_id")
            )
            db.add(q_rec)
            db.flush()

            # Answer key
            ak_rec = AnswerKey(
                question_id=q_rec.id,
                correct_answer=q.get("correct_answer", ""),
                explanation=q.get("explanation", ""),
                supporting_info=q.get("supporting_info"),
                source_reference=q.get("source_reference"),
                model_answer=q.get("model_answer"),
                rubric_points=q.get("rubric_points", [])
            )
            db.add(ak_rec)

        # Seed Human reference questions (for blind evaluation module)
        for hq in SAMPLE_HUMAN_QUESTIONS:
            h_rec = Question(
                document_id=doc.id,
                chapter_title="Curriculum Benchmark",
                question_type=hq["question_type"],
                question_text=hq["question_text"],
                options=hq.get("options"),
                marks=hq["marks"],
                difficulty=hq["difficulty"],
                blooms_level=hq["blooms_level"],
                blooms_explanation=f"Authored by human subject-matter expert for {hq['blooms_level']} level.",
                confidence_score=98.0,
                quality_score=96.0,
                is_grounded=1,
                is_duplicate=0,
                is_ambiguous=0,
                is_answerable=1,
                source_reference="Human Expert Curriculum Benchmark",
                origin="human",
                anonymous_id=hq["anonymous_id"]
            )
            db.add(h_rec)
            db.flush()

            h_ak = AnswerKey(
                question_id=h_rec.id,
                correct_answer=hq["correct_answer"],
                explanation=hq["explanation"],
                supporting_info="Standard textbook knowledge",
                source_reference="Curriculum Benchmark",
                model_answer=hq["correct_answer"],
                rubric_points=[{"point": "Expert human evaluation criterion", "marks": hq["marks"]}]
            )
            db.add(h_ak)

        created_docs.append(doc.id)

    db.commit()
    return {
        "success": True,
        "message": f"Successfully initialized {len(created_docs)} comprehensive educational sample documents with summaries, flashcards, MCQs, and human benchmark questions.",
        "document_ids": created_docs
    }
