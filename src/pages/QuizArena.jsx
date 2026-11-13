import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Clock, CheckCircle2, XCircle, Award, 
  ArrowRight, RotateCcw, BookOpen, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { BloomsBadge, DifficultyBadge } from '../components/StatusBadge';
import api from '../api';

export default function QuizArena({ selectedDocId, documents = [], onNavigate }) {
  const [quizState, setQuizState] = useState('setup'); // 'setup' | 'taking' | 'review'
  const [chapter, setChapter] = useState('All');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('All');
  
  // Active quiz session
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [question_id]: "A" }
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Completed results
  const [quizResult, setQuizResult] = useState(null);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDocId) {
      loadQuizHistory();
    }
  }, [selectedDocId]);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadQuizHistory = async () => {
    try {
      const data = await api.getQuizHistory(selectedDocId);
      setPastAttempts(data);
    } catch (err) {
      console.error('Failed to load quiz history:', err);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.startQuiz(
        selectedDocId,
        chapter !== 'All' ? chapter : null,
        Number(questionCount),
        difficulty !== 'All' ? difficulty : null
      );

      setQuizQuestions(data.questions || []);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTimerSeconds(0);
      setTimerActive(true);
      setQuizState('taking');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleSubmitQuiz = async () => {
    setTimerActive(false);
    try {
      setLoading(true);
      const submissionAnswers = quizQuestions.map(q => ({
        question_id: q.id,
        selected_option: userAnswers[q.id] || ''
      }));

      const res = await api.submitQuiz(
        selectedDocId,
        `Assessment on ${documents.find(d => d.id === selectedDocId)?.title || 'Material'}`,
        timerSeconds,
        submissionAnswers
      );

      setQuizResult(res);
      setQuizState('review');
      await loadQuizHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectPastAttempt = async (attemptId) => {
    try {
      setLoading(true);
      const res = await api.getQuizAttempt(attemptId);
      setQuizResult(res);
      setQuizState('review');
    } catch (err) {
      alert('Failed to load attempt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const currentQ = quizQuestions[currentQIndex] || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            Interactive Assessment & Quiz Arena
          </h1>
          <p className="text-xs text-slate-500">
            Timed practice tests, automated scoring, Bloom's cognitive distribution, and verifiable answer citations.
          </p>
        </div>

        {quizState !== 'setup' && (
          <button
            onClick={() => {
              setQuizState('setup');
              setTimerActive(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Quiz Setup</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* VIEW 1: QUIZ SETUP */}
      {quizState === 'setup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">Configure Practice Quiz</h2>
              <p className="text-xs text-slate-500">Select chapter scope and assessment parameters</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Chapter / Topic
                </label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="All">All Chapters (Comprehensive Quiz)</option>
                  {documents.find(d => d.id === selectedDocId)?.chapters?.map((ch) => (
                    <option key={ch.id} value={ch.title}>{ch.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="3">3 Questions (Quick Sprint)</option>
                    <option value="5">5 Questions (Standard)</option>
                    <option value="8">8 Questions (Deep Practice)</option>
                    <option value="12">12 Questions (Full Test)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="All">Mixed (All Difficulties)</option>
                    <option value="Easy">Easy (Recall & Basics)</option>
                    <option value="Medium">Medium (Application)</option>
                    <option value="Hard">Hard (Analysis & Evaluation)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Instant grading and source citations provided upon completion.
              </span>
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                <span>Start Interactive Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Past Attempts Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Past Quiz History ({pastAttempts.length})
            </h3>

            {pastAttempts.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-400">
                No past attempts recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {pastAttempts.map((att) => (
                  <div 
                    key={att.id}
                    onClick={() => handleInspectPastAttempt(att.id)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{att.score} / {att.max_score}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' :
                        att.percentage >= 50 ? 'bg-blue-100 text-blue-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {att.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{new Date(att.completed_at).toLocaleDateString()}</span>
                      <span>{formatTime(att.time_spent_seconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TAKING THE QUIZ */}
      {quizState === 'taking' && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Quiz Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-mono text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
                Question {currentQIndex + 1} of {quizQuestions.length}
              </span>
              <BloomsBadge level={currentQ.blooms_level} />
              <DifficultyBadge difficulty={currentQ.difficulty} />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.question_text}
            </h2>

            {/* MCQ Options A, B, C, D */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options && currentQ.options.map((optionText, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = userAnswers[currentQ.id] === letter;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, letter)}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {letter}
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-brand-950 font-bold' : 'text-slate-800'}`}>
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition"
            >
              Previous
            </button>

            <div className="flex gap-1.5">
              {quizQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition ${
                    currentQIndex === idx 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : userAnswers[q.id] 
                      ? 'bg-brand-100 text-brand-800' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQIndex === quizQuestions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={() => setCurrentQIndex(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: SCORECARD & DETAILED ANSWER REVIEW */}
      {quizState === 'review' && quizResult && (
        <div className="space-y-6">
          {/* Scorecard Hero */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Assessment Completed
                </span>
                <h2 className="text-2xl font-black mt-1">
                  Score: {quizResult.score} / {quizResult.max_score} ({quizResult.percentage}%)
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Time Spent: {formatTime(quizResult.time_spent_seconds)} • {quizResult.total_questions} Questions Evaluated
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuizState('setup')}
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-sm"
                >
                  Retake / New Test
                </button>
              </div>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${
                  quizResult.percentage >= 75 ? 'bg-emerald-400' :
                  quizResult.percentage >= 50 ? 'bg-amber-400' :
                  'bg-rose-400'
                }`}
                style={{ width: `${quizResult.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Question-by-Question Review with Citations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Detailed Question Review & Grounded Answer Keys
            </h3>

            <div className="space-y-4">
              {quizResult.reviews?.map((r, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl bg-white border transition shadow-sm space-y-3 ${
                    r.is_correct ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  {/* Top tags */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{idx + 1}
                      </span>
                      <BloomsBadge level={r.blooms_level} />
                      <DifficultyBadge difficulty={r.difficulty} />
                    </div>

                    <div className="flex items-center gap-2">
                      {r.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{r.marks})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <XCircle className="w-4 h-4" /> Incorrect (0 Marks)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stem */}
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {r.question_text}
                  </p>

                  {/* Options with color coding */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {r.options?.map((opt, oIdx) => {
                      const letter = ["A", "B", "C", "D"][oIdx];
                      const isCorrectAnswer = letter === r.correct_answer.trim().toUpperCase() || opt.toLowerCase().includes(r.correct_answer.toLowerCase());
                      const isUserChoice = letter === r.selected_option?.trim().toUpperCase();

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2.5 ${
                            isCorrectAnswer
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                              : isUserChoice && !r.is_correct
                              ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="font-mono text-[11px] font-bold">{letter}.</span>
                          <span>{opt}</span>
                          {isCorrectAnswer && <span className="ml-auto text-emerald-700 font-bold text-[10px]">✓ Correct</span>}
                          {isUserChoice && !r.is_correct && <span className="ml-auto text-rose-700 font-bold text-[10px]">Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Grounded Explanation & Verbatim Source Excerpt */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-2">
                    <div>
                      <span className="font-bold text-slate-800">Explanation & Justification:</span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{r.explanation}</p>
                    </div>

                    {r.source_excerpt && (
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        <span className="font-semibold text-brand-700">Source Excerpt Citation ({r.source_reference || 'Core Document'}):</span>
                        <p className="italic text-slate-600 mt-0.5 font-mono bg-white p-2 rounded border border-slate-200">
                          "{r.source_excerpt}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
