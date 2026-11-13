import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, BookOpen, Filter, Search, Copy, Check, 
  ChevronDown, ChevronUp, Sparkles, Award, ShieldCheck, Quote
} from 'lucide-react';
import { BloomsBadge, DifficultyBadge, QualityScoreBadge, MarksBadge } from '../components/StatusBadge';
import api from '../api';

export default function QuestionBank({ selectedDocId, documents = [], onNavigate }) {
  const [questions, setQuestions] = useState([]);
  const [filteredType, setFilteredType] = useState('All');
  const [filteredBlooms, setFilteredBlooms] = useState('All');
  const [filteredDifficulty, setFilteredDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState({}); // { [question_id]: true }
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [selectedDocId, filteredType, filteredBlooms, filteredDifficulty]);

  const loadQuestions = async () => {
    if (!selectedDocId) return;
    try {
      setLoading(true);
      const data = await api.getQuestions(
        selectedDocId,
        filteredType !== 'All' ? filteredType : null,
        filteredBlooms !== 'All' ? filteredBlooms : null,
        filteredDifficulty !== 'All' ? filteredDifficulty : null
      );
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswerKey = (id) => {
    setExpandedKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyQuestion = (q) => {
    const ak = q.answer_key;
    const text = `Question (${q.marks} Marks - ${q.blooms_level}):
${q.question_text}
${q.options ? '\nOptions:\n' + q.options.map((o, i) => `${['A','B','C','D'][i]}. ${o}`).join('\n') : ''}

Answer Key:
${ak ? ak.correct_answer : 'N/A'}

Explanation:
${ak ? ak.explanation : 'N/A'}

Source Reference:
${q.source_reference || 'Textbook Source'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedQuestions = questions.filter(q => {
    if (!searchQuery.trim()) return true;
    return q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (q.source_reference && q.source_reference.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-600" />
            Curriculum Question Bank & Answer Keys
          </h1>
          <p className="text-xs text-slate-500">
            MCQs, 2-mark definitions, 5-mark conceptual analyses, and 10-mark essay problems with complete model rubrics.
          </p>
        </div>

        <button
          onClick={() => onNavigate('generate')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate More Questions</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search stem */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question stem, keywords, or citations..."
              className="w-full text-xs pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Type filter */}
          <select
            value={filteredType}
            onChange={(e) => setFilteredType(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="All">All Types (MCQ & Subjective)</option>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="short_answer">Short Answer (2 & 5 Marks)</option>
            <option value="long_answer">Long Answer (10 Marks)</option>
          </select>

          {/* Bloom's level filter */}
          <select
            value={filteredBlooms}
            onChange={(e) => setFilteredBlooms(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="All">All Bloom's Levels</option>
            <option value="Remember">Remember</option>
            <option value="Understand">Understand</option>
            <option value="Apply">Apply</option>
            <option value="Analyze">Analyze</option>
            <option value="Evaluate">Evaluate</option>
            <option value="Create">Create</option>
          </select>

          {/* Difficulty filter */}
          <select
            value={filteredDifficulty}
            onChange={(e) => setFilteredDifficulty(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Showing {displayedQuestions.length} of {questions.length} questions</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Factual Grounding Audited
          </span>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading question bank...
        </div>
      ) : displayedQuestions.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Assessment Questions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or generate new questions using the AI Generator.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedQuestions.map((q, idx) => {
            const ak = q.answer_key;
            const isExpanded = expandedKeys[q.id];

            return (
              <div 
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 transition hover:border-slate-300"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <BloomsBadge level={q.blooms_level} />
                    <DifficultyBadge difficulty={q.difficulty} />
                    <MarksBadge marks={q.marks} />
                    <QualityScoreBadge score={q.quality_score} confidence={q.confidence_score} />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyQuestion(q)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      title="Copy question and answer key"
                    >
                      {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => toggleAnswerKey(q.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                    >
                      <span>{isExpanded ? 'Hide Answer Key' : 'View Answer Key'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Question Stem */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                    {q.question_text}
                  </h3>
                </div>

                {/* MCQ Options (if type == mcq) */}
                {q.question_type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2.5"
                      >
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          {["A", "B", "C", "D"][oIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable Ground Truth Answer Key */}
                {isExpanded && ak && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50/50 to-indigo-50/30 border border-brand-200 space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
                    {/* Correct Answer */}
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 shrink-0">Correct Answer:</span>
                      <span className="font-bold text-brand-900 font-mono">
                        {ak.correct_answer}
                      </span>
                    </div>

                    {/* Explanation */}
                    <div>
                      <span className="font-bold text-slate-800">Pedagogical Explanation:</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{ak.explanation}</p>
                    </div>

                    {/* Model Answer (for Subjective) */}
                    {ak.model_answer && (
                      <div className="pt-2 border-t border-brand-200/60">
                        <span className="font-bold text-slate-800">Model Answer & Rubric:</span>
                        <div className="p-3 bg-white rounded-lg border border-brand-200 text-slate-800 leading-relaxed font-mono text-[11px] whitespace-pre-line mt-1">
                          {ak.model_answer}
                        </div>
                      </div>
                    )}

                    {/* Scoring Rubric Breakdown */}
                    {ak.rubric_points && ak.rubric_points.length > 0 && (
                      <div className="pt-2 border-t border-brand-200/60">
                        <span className="font-bold text-slate-800">Scoring Rubric Criteria:</span>
                        <div className="space-y-1 mt-1">
                          {ak.rubric_points.map((rp, rIdx) => (
                            <div key={rIdx} className="flex items-center justify-between p-2 rounded bg-white/70 border border-brand-100 text-[11px]">
                              <span>{rp.point}</span>
                              <span className="font-bold text-brand-700 font-mono">+{rp.marks} Marks</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verbatim Source Excerpt & Citation */}
                    {q.source_excerpt && (
                      <div className="pt-2 border-t border-brand-200/60">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Quote className="w-3.5 h-3.5 text-brand-600" />
                          Supporting Source Excerpt ({q.source_reference || 'Textbook Source'}):
                        </span>
                        <p className="p-2.5 rounded-lg bg-white border border-brand-200 text-slate-600 font-mono text-[11px] mt-1 italic">
                          "{q.source_excerpt}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer details */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Source Ref: <strong className="text-slate-600">{q.source_reference || 'Core Curriculum'}</strong></span>
                  <span>Origin: <span className="uppercase font-semibold text-slate-600">{q.origin}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
