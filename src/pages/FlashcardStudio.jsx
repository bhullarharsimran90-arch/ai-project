import React, { useState, useEffect } from 'react';
import { 
  Layers, Shuffle, ChevronLeft, ChevronRight, RotateCw, 
  CheckCircle2, AlertTriangle, Eye, Sparkles, Filter, Grid, Maximize2
} from 'lucide-react';
import api from '../api';

export default function FlashcardStudio({ selectedDocId, documents = [], onNavigate }) {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ total: 0, known: 0, need_revision: 0, unreviewed: 0, mastery_percentage: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState('study'); // 'study' | 'grid'
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashcards();
  }, [selectedDocId, selectedChapter]);

  const loadFlashcards = async () => {
    if (!selectedDocId) return;
    try {
      setLoading(true);
      const data = await api.getFlashcards(selectedDocId, selectedChapter !== 'All' ? selectedChapter : null);
      setCards(data.cards || []);
      setStats(data.stats || { total: 0, known: 0, need_revision: 0, unreviewed: 0, mastery_percentage: 0 });
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleStatusUpdate = async (cardId, status) => {
    try {
      await api.updateFlashcardStatus(cardId, status);
      // Update local state
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, mastery_status: status } : c));
      // Re-calculate stats
      const updated = cards.map(c => c.id === cardId ? { ...c, mastery_status: status } : c);
      const known = updated.filter(c => c.mastery_status === 'known').length;
      const need = updated.filter(c => c.mastery_status === 'need_revision').length;
      const pct = Math.round((known / updated.length) * 100);
      setStats({
        ...stats,
        known,
        need_revision: need,
        mastery_percentage: pct
      });
      // Auto advance to next card
      setTimeout(() => {
        handleNext();
      }, 300);
    } catch (err) {
      console.error('Failed to update flashcard status:', err);
    }
  };

  const currentCard = cards[currentIndex] || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            Interactive Flashcard Studio
          </h1>
          <p className="text-xs text-slate-500">
            Active recall with 3D flip card animations and spaced revision mastery tracking.
          </p>
        </div>

        {cards.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
              title="Shuffle cards"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode('study')}
                className={`p-1.5 rounded-md transition ${viewMode === 'study' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'}`}
                title="Single Card Focus"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'}`}
                title="Grid Overview"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Mastery Header */}
      {cards.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Mastery Progress:</span>
              <span className="text-emerald-700 font-bold">{stats.known} of {stats.total} Mastered ({stats.mastery_percentage}%)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {stats.known} Known
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> {stats.need_revision} Need Revision
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 transition-all duration-300" 
              style={{ width: `${(stats.known / (stats.total || 1)) * 100}%` }}
            ></div>
            <div 
              className="bg-amber-400 transition-all duration-300" 
              style={{ width: `${(stats.need_revision / (stats.total || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading flashcards...
        </div>
      ) : cards.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Flashcards Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Extract high-yield Q&A flashcards directly from your uploaded materials for active revision.
            </p>
          </div>
          <button
            onClick={() => onNavigate('generate')}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
          >
            Generate Flashcards
          </button>
        </div>
      ) : viewMode === 'study' ? (
        /* Focused 3D Single Card Mode */
        <div className="space-y-6">
          {/* Card Frame */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none perspective-1000 min-h-[300px] sm:min-h-[340px]"
          >
            <div 
              className={`relative w-full min-h-[300px] sm:min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-lg hover:shadow-xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-slate-200/80 p-8 flex flex-col justify-between backface-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {currentCard.category || 'Core Concept'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed max-w-xl mx-auto">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                  <span>{currentCard.chapter_title}</span>
                  <span className="flex items-center gap-1 text-brand-600 font-semibold">
                    <RotateCw className="w-3.5 h-3.5" /> Click or press Space to flip
                  </span>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 flex flex-col justify-between rotate-y-180 backface-hidden shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-emerald-300 border border-white/20">
                    Answer / Definition
                  </span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed max-w-xl mx-auto">
                    {currentCard.back}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
                  <span>Ground truth fact</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <RotateCw className="w-3.5 h-3.5" /> Click to flip front
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Mastery Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition shadow-sm"
                title="Previous card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition shadow-sm"
                title="Next card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mastery Tagging */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStatusUpdate(currentCard.id, 'need_revision')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border shadow-sm ${
                  currentCard.mastery_status === 'need_revision'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Need Revision</span>
              </button>

              <button
                onClick={() => handleStatusUpdate(currentCard.id, 'known')}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition border shadow-sm ${
                  currentCard.mastery_status === 'known'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Known</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Overview Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-brand-600">{c.category || 'Concept'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.mastery_status === 'known' ? 'bg-emerald-100 text-emerald-800' :
                    c.mastery_status === 'need_revision' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {c.mastery_status === 'known' ? 'Known' : c.mastery_status === 'need_revision' ? 'Needs Revision' : 'Unreviewed'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">{c.front}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {c.back}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleStatusUpdate(c.id, 'need_revision')}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold text-amber-700 hover:bg-amber-50"
                >
                  Need Review
                </button>
                <button
                  onClick={() => handleStatusUpdate(c.id, 'known')}
                  className="px-2.5 py-1 rounded text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  Known ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
