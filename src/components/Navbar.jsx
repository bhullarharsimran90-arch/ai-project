import React from 'react';
import { 
  Sparkles, BookOpen, Cpu, RefreshCw, CheckCircle2, 
  HelpCircle, ChevronDown, Database
} from 'lucide-react';

export default function Navbar({ 
  documents = [], 
  selectedDocId, 
  onSelectDoc, 
  aiStatus, 
  onLoadSamples, 
  loadingSamples 
}) {
  const currentDoc = documents.find(d => d.id === selectedDocId);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-900 bg-clip-text text-transparent">
                CogniLearn
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-100 to-accent-100 text-brand-700 border border-brand-200">
                PRO AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              AI-Assisted Learning Content & Assessment Generation Platform
            </p>
          </div>
        </div>

        {/* Center: Active Document Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedDocId || ''}
              onChange={(e) => onSelectDoc(Number(e.target.value))}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 pl-9 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition cursor-pointer max-w-[240px] sm:max-w-xs truncate"
            >
              {documents.length === 0 ? (
                <option value="">No documents loaded</option>
              ) : (
                documents.map(d => (
                  <option key={d.id} value={d.id}>
                    📄 {d.title} ({d.subject})
                  </option>
                ))
              )}
            </select>
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Right: Engine Indicator & Actions */}
        <div className="flex items-center gap-3">
          {/* AI Provider Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <Cpu className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>AI Provider:</span>
            <span className="font-bold text-slate-900 capitalize">
              {aiStatus?.active_provider === 'local_engine' ? 'Local Semantic Engine' : aiStatus?.active_provider || 'Ready'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          {/* Load Sample Button */}
          <button
            onClick={onLoadSamples}
            disabled={loadingSamples}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition shadow-sm disabled:opacity-50"
            title="Load ready-made textbooks and benchmark assessment questions"
          >
            {loadingSamples ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Database className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Load Sample Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
