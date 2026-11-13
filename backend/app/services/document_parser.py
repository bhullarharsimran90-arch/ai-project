import re
from typing import List, Dict, Any, Tuple
from pathlib import Path
import pymupdf as fitz
from docx import Document as DocxDocument

class DocumentParser:
    @staticmethod
    def extract_from_pdf(file_path: Path) -> Tuple[str, List[Dict[str, Any]], int]:
        """
        Extracts clean text and page-wise structure from PDF using PyMuPDF.
        Returns: (full_text, pages_list, total_pages)
        """
        doc = fitz.open(file_path)
        pages_list = []
        full_text_parts = []
        total_pages = len(doc)

        for page_num in range(total_pages):
            page = doc[page_num]
            text = page.get_text("text").strip()
            if text:
                pages_list.append({
                    "page_number": page_num + 1,
                    "text": text
                })
                full_text_parts.append(f"[Page {page_num + 1}]\n{text}")

        full_text = "\n\n".join(full_text_parts)
        doc.close()
        return full_text, pages_list, total_pages

    @staticmethod
    def extract_from_docx(file_path: Path) -> Tuple[str, List[Dict[str, Any]], int]:
        """
        Extracts text from DOCX preserving paragraphs and headings.
        """
        doc = DocxDocument(file_path)
        paragraphs = []
        full_text_parts = []

        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                is_heading = p.style.name.startswith("Heading") if p.style else False
                paragraphs.append({
                    "text": text,
                    "is_heading": is_heading,
                    "style": p.style.name if p.style else "Normal"
                })
                full_text_parts.append(text)

        full_text = "\n\n".join(full_text_parts)
        # Approximate pages (~350 words per page)
        words = len(full_text.split())
        est_pages = max(1, (words + 349) // 350)
        return full_text, paragraphs, est_pages

    @staticmethod
    def extract_from_txt(file_path: Path) -> Tuple[str, int]:
        """
        Reads TXT file with utf-8 or latin-1 fallback.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="latin-1") as f:
                text = f.read()
        
        words = len(text.split())
        est_pages = max(1, (words + 349) // 350)
        return text, est_pages

    @staticmethod
    def segment_into_chapters(full_text: str, total_pages: int = 1) -> List[Dict[str, Any]]:
        """
        Intelligently segments educational content into chapters or distinct sections.
        Detects markers like:
        - 'Chapter 1: ...', 'Unit 1', 'Module 1', 'Section 1.0'
        - Numbered headings (e.g. '1. Introduction to Operating Systems')
        - Major capital headings
        If no explicit chapter headings exist, segments logically into proportional topics.
        """
        lines = [line.strip() for line in full_text.split("\n") if line.strip()]
        
        # Regex for chapter patterns
        chapter_pattern = re.compile(
            r'^(chapter\s+\d+|unit\s+\d+|module\s+\d+|section\s+\d+|part\s+\d+|\d+\.\s+[A-Z][a-zA-Z\s]{3,})',
            re.IGNORECASE
        )

        detected_sections = []
        current_title = "Introduction & Overview"
        current_content = []
        current_start_line = 0

        for idx, line in enumerate(lines):
            # Check if this line looks like a major chapter title
            if chapter_pattern.match(line) and len(line) < 100:
                if current_content:
                    content_str = "\n".join(current_content).strip()
                    if len(content_str.split()) > 40:
                        detected_sections.append({
                            "title": current_title,
                            "content": content_str,
                            "word_count": len(content_str.split())
                        })
                        current_content = []
                current_title = line
            else:
                current_content.append(line)

        # Append remaining
        if current_content:
            content_str = "\n".join(current_content).strip()
            if content_str:
                detected_sections.append({
                    "title": current_title,
                    "content": content_str,
                    "word_count": len(content_str.split())
                })

        # If no chapters were detected or only 1 small chapter, partition into logical topic blocks
        if len(detected_sections) <= 1:
            words = full_text.split()
            total_words = len(words)
            if total_words > 600:
                # Divide into 3-4 coherent modules
                chunk_size = max(400, total_words // 3)
                detected_sections = []
                for i in range(0, total_words, chunk_size):
                    chunk_words = words[i:i + chunk_size]
                    part_num = (i // chunk_size) + 1
                    # Extract first sentence or title as chapter title
                    snippet = " ".join(chunk_words[:6])
                    clean_title = re.sub(r'[^a-zA-Z0-9\s]', '', snippet).strip()
                    detected_sections.append({
                        "title": f"Chapter {part_num}: {clean_title}...",
                        "content": " ".join(chunk_words),
                        "word_count": len(chunk_words)
                    })
            else:
                detected_sections = [{
                    "title": "Chapter 1: Foundational Concepts",
                    "content": full_text,
                    "word_count": total_words
                }]

        # Add chapter numbers and estimated pages
        total_sections = len(detected_sections)
        for idx, section in enumerate(detected_sections):
            section["chapter_number"] = idx + 1
            section["start_page"] = max(1, int((idx / total_sections) * total_pages) + 1)
            section["end_page"] = max(1, int(((idx + 1) / total_sections) * total_pages))

        return detected_sections
