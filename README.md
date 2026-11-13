# AI-Assisted Learning Content & Assessment Generation Platform (CogniLearn AI)

CogniLearn AI is an enterprise-grade educational platform that enables educators and students to upload educational textbooks, PDFs, lecture notes, DOCX files, or syllabus content, and automatically generates high-retention learning content, adaptive flashcards, and Bloom's Taxonomy-classified assessments with factual quality control and blind human evaluation benchmarks.

---

## 🌟 Key Features

### 1. Document Ingestion & Multimodal Parsing
- **Multi-Format Processing**: Supports **PDF** (PyMuPDF / `fitz`), Microsoft Word (**DOCX** / `python-docx`), Plain Text (**TXT**), and manual copy-paste text.
- **Intelligent Chapter & Section Chunking**: Automatically segments documents into chapters, units, or logical curriculum sections with page and word counts.
- **Pre-packaged Educational Demo Textbooks**: Includes pre-loaded textbooks (*Operating Systems & Concurrency*, *Molecular Biology & Genetics*) for 1-click evaluation without setup.

### 2. Multi-Tier AI Summary Generator
- **Three Summary Lengths**: Generates **Short** (Executive digest), **Medium** (Standard overview), and **Detailed** (In-depth multi-section breakdown).
- **Structured Knowledge Extraction**:
  - Key Definitions & Glossary terms.
  - Important Concepts & Principles.
  - Mathematical Formulas, Laws & Equations.
  - Chapter Notes and actionable study bullet points.
- **Export & Print**: Export to Markdown (.md) or copy formatted summaries to the clipboard.

### 3. Interactive 3D Flashcard Studio
- **3D Flip-Card Animation**: Smooth CSS 3D card rotation between prompt and answer.
- **Active Recall & Mastery Tracking**: Mark cards as **"Known"** (Mastered) or **"Need Revision"** with live percentage progress tracking.
- **Deck Controls**: Next, Previous, and **Shuffle** randomization.
- **Dual Display Modes**: Focused Single-Card study mode and full Grid overview mode.

### 4. Bloom's Taxonomy Assessment Engine & Answer Keys
- **Six Bloom's Cognitive Levels**: Every generated question is automatically analyzed and classified into:
  1. *Remember*
  2. *Understand*
  3. *Apply*
  4. *Analyze*
  5. *Evaluate*
  6. *Create*
- **Multiple Assessment Formats**:
  - **Multiple Choice Questions (MCQs)**: 4 options (A-D) with plausible distracters.
  - **Short-Answer Questions**: 2 Marks and 5 Marks.
  - **Long-Answer Examination Questions**: 10 Marks.
- **Grounded Answer Keys**:
  - Correct answer identification.
  - Step-by-step pedagogical explanation.
  - Verbatim supporting excerpt cited from the source textbook.
  - Source chapter and section references.
  - Scoring rubric breakdowns for subjective questions.

### 5. Automated AI Quality Control & Grounding Verification
- **Factual Grounding Check**: Cross-references terms and claims against uploaded source text to prevent hallucinations.
- **Duplicate Question Detection**: Evaluates semantic and token similarity to flag/suppress duplicate items.
- **Ambiguity & Stem Clarity Inspection**: Identifies ambiguous qualifiers, negative phrasing, or vague prompts.
- **Answerability Verification**: Verifies whether the question is solvable using strictly the provided material.
- **Confidence & Quality Scoring**: Computes composite quality scores (0–100%) for every assessment item.

### 6. Double-Blind Human Evaluation Module
- **Masked Question Decks**: Mixes AI-generated questions and human-expert reference questions under randomized, anonymous IDs (e.g., `EVAL-B8924`).
- **5-Point Likert Rating Criteria**:
  1. *Factual Accuracy* (1-5)
  2. *Question Clarity* (1-5)
  3. *Curriculum Relevance* (1-5)
  4. *Difficulty Calibration* (1-5)
  5. *Overall Pedagogical Quality* (1-5)
- **Comparative Research Analytics Dashboard**: Displays comparative Bar & Radar charts, mean score comparisons, and parity percentage between AI and human educators.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.13 / FastAPI / Uvicorn / SQLAlchemy / Pydantic |
| **Document Parsers** | PyMuPDF (fitz), python-docx, text extraction |
| **Database** | SQLite (zero-config, self-initializing) |
| **AI Integration** | Modular Provider: Anthropic Claude, Google Gemini, OpenAI, or Built-in High-Fidelity Local Semantic Extractor |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts |

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment settings, API keys, path resolution
│   │   ├── database.py            # SQLite engine, sessionmaker, init_db()
│   │   ├── main.py                # FastAPI entrypoint, CORS, static SPA mount
│   │   ├── models/                # SQLAlchemy database models
│   │   │   ├── document.py        # UploadedDocument, Chapter
│   │   │   ├── summary.py         # GeneratedSummary
│   │   │   ├── flashcard.py       # Flashcard
│   │   │   ├── question.py        # Question (Bloom's, QC scores, citations)
│   │   │   ├── answer_key.py      # AnswerKey (model answers, rubrics)
│   │   │   ├── quiz.py            # QuizAttempt, QuizAnswer
│   │   │   ├── evaluation.py      # QualityEvaluationLog
│   │   │   └── human_rating.py    # HumanRating
│   │   ├── routes/                # REST API routers
│   │   │   ├── documents.py       # Upload, parse, list, sample loader
│   │   │   ├── generation.py      # Trigger summaries, flashcards, questions
│   │   │   ├── study_materials.py # Summaries, flashcard mastery, question bank
│   │   │   ├── quizzes.py         # Start quiz, submit answers, instant review
│   │   │   ├── quality.py         # Automated QC audit & Bloom's distribution
│   │   │   └── evaluations.py     # Blind rating deck, submit rating, dashboard
│   │   ├── samples/               # Pre-packaged educational textbooks & benchmarks
│   │   ├── schemas/               # Pydantic validation schemas
│   │   └── services/              # Core business & AI logic
│   │       ├── ai_service.py      # Modular Claude / Gemini / OpenAI / Local NLP
│   │       ├── blooms_taxonomy.py # 6-level cognitive classifier
│   │       ├── quality_control.py # Anti-hallucination & grounding checker
│   │       ├── blind_evaluation.py# Double-blind comparison service
│   │       └── document_parser.py # PDF / DOCX / TXT extractor
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api.js                 # Centralized API client
│   │   ├── App.jsx                # Main layout coordinator
│   │   ├── components/            # Navbar, Sidebar, StatusBadge
│   │   └── pages/                 # Dashboard, DocumentManager, GenerateContent,
│   │                              # SummaryViewer, FlashcardStudio, QuizArena,
│   │                              # QuestionBank, QualityInspector, BlindEvaluation
│   ├── dist/                      # Pre-built production frontend (served by FastAPI)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── run.py                         # Single-command Python launcher
├── run_app.bat                    # One-click Windows starter
├── start_backend.bat              # Backend dev starter (port 8000)
├── start_frontend.bat             # Frontend Vite dev starter (port 5173)
└── README.md
```

---

## ⚡ Quick Start Guide

### Option 1: Unified One-Click Launch (Recommended)
You can launch both the backend and frontend together with a single command or double-click:

**On Windows:**
Double-click `run_app.bat` or run in terminal:
```bash
.\run_app.bat
```

**Using Python directly:**
```bash
python run.py
```

Then open your browser at:
👉 **`http://127.0.0.1:8000`**

The unified server serves both the **REST API** (`/api/...`), interactive **Swagger Docs** (`/docs`), and the **compiled modern React UI** directly!

---

### Option 2: Running Backend & Frontend in Development Mode

If you wish to run the backend and frontend separately for active code development:

#### 1. Backend:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

#### 2. Frontend:
```bash
cd frontend
npm run dev
```
Development UI will be available at: `http://localhost:5173`

---

## 🔑 AI Provider Configuration

The application is engineered to work **100% out-of-the-box in Demo/Local Mode without requiring any API keys**, using its built-in High-Fidelity Local Semantic Extractor.

To connect live cloud LLMs, create or edit `backend/.env`:

```env
# Supported: "auto", "claude", "gemini", "openai"
AI_PROVIDER=auto

# Optional Cloud API Keys:
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-...
```

When an API key is provided, the platform automatically switches to that LLM provider while retaining all factual grounding checks and Bloom's classification!

---

## 🧪 Testing the Complete Workflow

1. **Open Dashboard**: Visit `http://127.0.0.1:8000`.
2. **Explore Pre-loaded Samples**: If you are starting fresh, click the **"Load Sample Data"** button in the top navigation bar. It instantly loads the *Operating Systems: Concurrency & Synchronization* and *Molecular Biology* textbooks.
3. **Upload Your Own Document**: Go to **Document Hub** → Upload your PDF, DOCX, or TXT file, or paste your syllabus content.
4. **Generate Study Materials**: Navigate to **AI Generator** → Select the chapter scope → Choose what to generate (Summaries, Flashcards, MCQs, Subjective Questions) → Click **"Generate Study Material"**.
5. **View Chapter Summaries**: Navigate to **Summaries & Notes** to browse short, medium, and detailed summaries, key glossary definitions, and formulas.
6. **Practice Active Recall**: Open **Flashcard Studio** → Click cards to flip them in 3D → Mark items as *Known* or *Need Revision*.
7. **Attempt Quizzes**: Head over to **Practice Quizzes** → Choose question count and difficulty → Answer questions → Submit to receive an instant scorecard with source textbook citations.
8. **Inspect Question Bank**: Check out **Question Bank & Keys** to inspect 2-mark, 5-mark, and 10-mark examination questions, model answers, and grading rubrics.
9. **Quality Audit**: Review **Quality Inspector** to see factual correctness scores, anti-hallucination checks, and the Bloom's cognitive distribution bar chart.
10. **Blind Human Evaluation**: Go to **Blind Human Eval** → Rate masked questions on a 1-5 scale across 5 criteria → Switch to **Comparative Analytics** to see how AI compares against expert human-authored questions!
