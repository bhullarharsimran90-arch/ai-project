import React, { useState, useEffect } from 'react';
import { 
  FileText, BookOpen, Bookmark, Copy, Check, 
  Download, Sparkles, Sigma, ListChecks, HelpCircle
} from 'lucide-react';
import api from '../api';

export default function SummaryViewer({ selectedDocId, documents = [], onNavigate }) {
  const [summaries, setSummaries] = useState([]);
  const [selectedSummaryIdx, setSelectedSummaryIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('medium'); // 'short' | 'medium' | 'detailed' | 'definitions' | 'formulas' | 'notes'
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSummaries() {
      if (!selectedDocId) return;
      try {
        setLoading(true);
        const data = await api.getSummaries(selectedDocId);
        setSummaries(data);
        setSelectedSummaryIdx(0);
      } catch (err) {
        console.error('Failed to load summaries:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummaries();
  }, [selectedDocId]);

  const currentSummary = summaries[selectedSummaryIdx] || null;

  const handleCopy = () => {
    if (!currentSummary) return;
    let textToCopy = '';
    if (activeTab === 'short') textToCopy = currentSummary.short_summary;
    else if (activeTab === 'medium') textToCopy = currentSummary.medium_summary;
    else if (activeTab === 'detailed') textToCopy = currentSummary.detailed_summary;
    else if (activeTab === 'definitions') {
      textToCopy = currentSummary.key_definitions.map(d => `${d.term}: ${d.definition}`).join('\n\n');
    } else if (activeTab === 'formulas') {
      textToCopy = currentSummary.formulas_and_laws.map(f => `${f.name}: ${f.formula} (${f.notes})`).join('\n\n');
    } else {
      textToCopy = currentSummary.chapter_notes.join('\n- ');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentSummary) return;
    const content = `=== AI Generated Study Summary ===
Document Chapter: ${currentSummary.chapter_title}
Generated At: ${new Date(currentSummary.created_at).toLocaleString()}

--- SHORT SUMMARY ---
${currentSummary.short_summary}

--- DETAILED SUMMARY ---
${currentSummary.detailed_summary}

--- KEY DEFINITIONS ---
${currentSummary.key_definitions.map(d => `* ${d.term}: ${d.definition}`).join('\n')}

--- FORMULAS AND LAWS ---
${currentSummary.formulas_and_laws.map(f => `* ${f.name}: ${f.formula}`).join('\n')}

--- CHAPTER NOTES ---
${currentSummary.chapter_notes.map(n => `- ${n}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Summary_${currentSummary.chapter_title.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            Chapter Summaries & Notes
          </h1>
          <p className="text-xs text-slate-500">
            Multi-length executive digests, key definitions, formulas, and structured study notes.
          </p>
        </div>

        {currentSummary && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading chapter summaries...
        </div>
      ) : summaries.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Summaries Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Select a chapter and generate short, medium, or detailed chapter summaries grounded in your textbook.
            </p>
          </div>
          <button
            onClick={() => onNavigate('generate')}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
          >
            Generate Summary Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter Selector Sidebar */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Chapter Decks ({summaries.length})
            </span>
            <div className="space-y-1.5">
              {summaries.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSummaryIdx(idx)}
                  className={`w-full p-3 rounded-xl text-left transition border ${
                    selectedSummaryIdx === idx
                      ? 'bg-brand-50 border-brand-300 text-brand-900 font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs truncate">{s.chapter_title}</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab('short')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                  activeTab === 'short' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Short (Executive)
              </button>
              <button
                onClick={() => setActiveTab('medium')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                  activeTab === 'medium' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Medium (Standard)
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                  activeTab === 'detailed' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed (In-Depth)
              </button>
              <button
                onClick={() => setActiveTab('definitions')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'definitions' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Definitions ({currentSummary.key_definitions?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('formulas')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'formulas' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>Formulas & Laws ({currentSummary.formulas_and_laws?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'notes' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Chapter Notes</span>
              </button>
            </div>

            {/* Content Display */}
            <div className="p-6 sm:p-8 flex-1">
              {/* Short Summary */}
              {activeTab === 'short' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Concise 2-3 Sentence Summary</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {currentSummary.short_summary}
                  </p>
                </div>
              )}

              {/* Medium Summary */}
              {activeTab === 'medium' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Balanced Standard Overview</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {currentSummary.medium_summary}
                  </p>
                </div>
              )}

              {/* Detailed Summary */}
              {activeTab === 'detailed' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Comprehensive Detailed Breakdown</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
                    {currentSummary.detailed_summary}
                  </div>
                </div>
              )}

              {/* Definitions */}
              {activeTab === 'definitions' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Core Glossary & Terminology
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSummary.key_definitions?.map((d, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-xs font-bold text-brand-700">{d.term}</span>
                        <p className="text-xs text-slate-600 leading-relaxed">{d.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas & Laws */}
              {activeTab === 'formulas' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mathematical Laws & Formulas
                  </h3>
                  {currentSummary.formulas_and_laws?.length > 0 ? (
                    <div className="space-y-3">
                      {currentSummary.formulas_and_laws.map((f, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{f.name}</span>
                            <p className="text-[11px] text-slate-500">{f.notes}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-brand-700">
                            {f.formula}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 p-6 text-center">
                      No mathematical formulas identified in this chapter.
                    </div>
                  )}
                </div>
              )}

              {/* Chapter Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Key Points & Bullet Notes
                  </h3>
                  <ul className="space-y-2.5">
                    {currentSummary.chapter_notes?.map((n, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed p-2.5 rounded-lg hover:bg-slate-50 transition">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Reference */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
              <span>Chapter: <strong className="text-slate-700">{currentSummary.chapter_title}</strong></span>
              <span>Grounded in uploaded source text</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
