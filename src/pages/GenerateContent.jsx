import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Wand2, BookOpen, Layers, CheckSquare, 
  ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';
import api from '../api';

export default function GenerateContent({ 
  documents = [], 
  selectedDocId, 
  onSelectDoc, 
  onNavigate,
  onRefresh 
}) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('Full Document');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [generateSummary, setGenerateSummary] = useState(true);
  const [generateFlashcards, setGenerateFlashcards] = useState(true);
  const [generateMCQs, setGenerateMCQs] = useState(true);
  const [generateQuestions, setGenerateQuestions] = useState(true);
  const [mcqCount, setMcqCount] = useState(5);
  const [questionsCount, setQuestionsCount] = useState(4);
  const [targetDifficulty, setTargetDifficulty] = useState('Mixed');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDocId) {
      api.getDocument(selectedDocId).then(setSelectedDoc).catch(console.error);
    } else if (documents.length > 0) {
      api.getDocument(documents[0].id).then(doc => {
        setSelectedDoc(doc);
        onSelectDoc(doc.id);
      }).catch(console.error);
    }
  }, [selectedDocId, documents]);

  const handleDocChange = async (docId) => {
    onSelectDoc(docId);
    try {
      const doc = await api.getDocument(docId);
      setSelectedDoc(doc);
      setChapterTitle('Full Document');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedDoc) {
      setError('Please select a document first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setGenerationResult(null);

      setLoadingStep('Analyzing document semantics & structure...');
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep('Synthesizing chapter summaries, key definitions & formulas...');
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep('Formulating Bloom\'s classified questions and distracters...');
      
      const payload = {
        document_id: selectedDoc.id,
        chapter_title: chapterTitle,
        summary_length: summaryLength,
        generate_summary: generateSummary,
        generate_flashcards: generateFlashcards,
        generate_mcqs: generateMCQs,
        generate_questions: generateQuestions,
        mcq_count: Number(mcqCount),
        questions_count: Number(questionsCount),
        target_difficulty: targetDifficulty
      };

      const res = await api.generateContent(payload);

      setLoadingStep('Auditing factual correctness & running quality inspection...');
      await new Promise(r => setTimeout(r, 500));

      setGenerationResult(res);
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content: ' + err.message);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-brand-600" />
          AI Learning Content & Assessment Studio
        </h1>
        <p className="text-xs text-slate-500">
          Configure educational objectives, summary depths, and assessment parameters grounded strictly in source materials.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Generation Success Card */}
      {generationResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Generation & Factual Audit Passed</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{generationResult.message}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="font-semibold">⚡ Summary: {generationResult.summary_id ? 'Generated' : 'Skipped'}</span>
                <span>•</span>
                <span className="font-semibold">🗂️ Flashcards: +{generationResult.flashcards_count}</span>
                <span>•</span>
                <span className="font-semibold">❓ MCQs: +{generationResult.mcqs_count}</span>
                <span>•</span>
                <span className="font-semibold">📝 Subjective (2/5/10M): +{generationResult.questions_count}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">🛡️ Average QC: {generationResult.quality_score_avg}%</span>
              </div>
            </div>

            <button
              onClick={() => setGenerationResult(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-emerald-200/60">
            <button
              onClick={() => onNavigate('summaries')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-emerald-200 shadow-sm transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>View Summaries</span>
            </button>

            <button
              onClick={() => onNavigate('flashcards')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-emerald-200 shadow-sm transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Practice Flashcards</span>
            </button>

            <button
              onClick={() => onNavigate('quizzes')}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Attempt Interactive Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('questions')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-emerald-200 shadow-sm transition flex items-center gap-1.5"
            >
              <span>Inspect Question Bank & Answer Keys</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Step 1: Target Material Scope */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. Source Material Scope
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Uploaded Document *
              </label>
              <select
                value={selectedDoc?.id || ''}
                onChange={(e) => handleDocChange(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chapter / Section Scope
              </label>
              <select
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Full Document">Full Document (All Chapters)</option>
                {selectedDoc?.chapters?.map((ch) => (
                  <option key={ch.id} value={ch.title}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Content Modules to Generate */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. Learning Material Modules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Summary Option */}
            <label className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
              generateSummary ? 'bg-brand-50/50 border-brand-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={generateSummary}
                onChange={(e) => setGenerateSummary(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">Chapter Summaries & Key Notes</span>
                <p className="text-[11px] text-slate-500">
                  Definitions, key concepts, formulas, and multi-length summaries.
                </p>
                {generateSummary && (
                  <div className="flex gap-2 pt-2">
                    {['short', 'medium', 'detailed'].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setSummaryLength(len)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                          summaryLength === len 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>

            {/* Flashcards Option */}
            <label className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
              generateFlashcards ? 'bg-brand-50/50 border-brand-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={generateFlashcards}
                onChange={(e) => setGenerateFlashcards(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">Revision Flashcards</span>
                <p className="text-[11px] text-slate-500">
                  Concept prompts & factual definitions for 3D flip card memory retention.
                </p>
              </div>
            </label>

            {/* MCQs Option */}
            <label className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
              generateMCQs ? 'bg-brand-50/50 border-brand-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={generateMCQs}
                onChange={(e) => setGenerateMCQs(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="space-y-1 flex-1">
                <span className="text-xs font-bold text-slate-800">Multiple Choice Questions (MCQs)</span>
                <p className="text-[11px] text-slate-500">
                  4 options (A-D), distracters, explanations, and Bloom's levels.
                </p>
                {generateMCQs && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-600 font-semibold">Count:</span>
                    <select
                      value={mcqCount}
                      onChange={(e) => setMcqCount(e.target.value)}
                      className="text-xs p-1 rounded border border-slate-200 bg-white"
                    >
                      <option value="3">3 MCQs</option>
                      <option value="5">5 MCQs</option>
                      <option value="8">8 MCQs</option>
                      <option value="12">12 MCQs</option>
                    </select>
                  </div>
                )}
              </div>
            </label>

            {/* Subjective Questions Option */}
            <label className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
              generateQuestions ? 'bg-brand-50/50 border-brand-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={generateQuestions}
                onChange={(e) => setGenerateQuestions(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="space-y-1 flex-1">
                <span className="text-xs font-bold text-slate-800">Subjective Questions (2, 5, 10 Marks)</span>
                <p className="text-[11px] text-slate-500">
                  Examination questions, comprehensive model answers, and scoring rubrics.
                </p>
                {generateQuestions && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-600 font-semibold">Count:</span>
                    <select
                      value={questionsCount}
                      onChange={(e) => setQuestionsCount(e.target.value)}
                      className="text-xs p-1 rounded border border-slate-200 bg-white"
                    >
                      <option value="2">2 Questions</option>
                      <option value="4">4 Questions</option>
                      <option value="6">6 Questions</option>
                    </select>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Step 3: Difficulty & Quality Assurance */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Target Difficulty:</span>
            <div className="flex gap-1.5">
              {['Easy', 'Medium', 'Hard', 'Mixed'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setTargetDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    targetDifficulty === diff
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Factual Verification Enabled</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Generates fully grounded materials based exclusively on uploaded text.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-brand-500/25 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Materials...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Study Material</span>
              </>
            )}
          </button>
        </div>

        {/* Live Loading Step Indicator */}
        {loading && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
            <div>
              <span className="font-bold">{loadingStep}</span>
              <p className="text-[10px] text-brand-600">Cross-referencing textbook tokens & Bloom's criteria...</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
