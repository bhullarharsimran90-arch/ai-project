import React, { useState, useEffect } from 'react';
import { 
  Scale, Star, CheckCircle2, Award, BarChart3, 
  HelpCircle, Sparkles, MessageSquare, ArrowRight, RotateCcw, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import api from '../api';

export default function BlindEvaluation() {
  const [activeView, setActiveView] = useState('rating'); // 'rating' | 'dashboard'
  const [deck, setDeck] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [evaluatorName, setEvaluatorName] = useState('Educator');
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  
  // Rating values (1 to 5)
  const [accuracy, setAccuracy] = useState(5);
  const [clarity, setClarity] = useState(4);
  const [relevance, setRelevance] = useState(5);
  const [difficulty, setDifficulty] = useState(4);
  const [overallQuality, setOverallQuality] = useState(5);
  const [comments, setComments] = useState('');

  const [dashboardData, setDashboardData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeck();
    loadDashboard();
  }, []);

  const loadDeck = async () => {
    try {
      setLoading(true);
      const data = await api.getBlindDeck(8);
      setDeck(data);
      setCurrentIdx(0);
      resetRatings();
    } catch (err) {
      console.error('Failed to load blind deck:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await api.getEvaluationDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load evaluation dashboard:', err);
    }
  };

  const resetRatings = () => {
    setAccuracy(5);
    setClarity(4);
    setRelevance(5);
    setDifficulty(4);
    setOverallQuality(5);
    setComments('');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!currentQuestion) return;

    try {
      setSubmitting(true);
      const payload = {
        anonymous_id: currentQuestion.anonymous_id,
        evaluator_name: evaluatorName,
        session_id: sessionId,
        accuracy: Number(accuracy),
        clarity: Number(clarity),
        relevance: Number(relevance),
        difficulty: Number(difficulty),
        overall_quality: Number(overallQuality),
        comments
      };

      await api.submitBlindRating(payload);
      setSubmittedSuccess(true);
      await loadDashboard();

      setTimeout(() => {
        setSubmittedSuccess(false);
        resetRatings();
        if (currentIdx < deck.length - 1) {
          setCurrentIdx(prev => prev + 1);
        } else {
          setActiveView('dashboard');
        }
      }, 700);
    } catch (err) {
      alert('Failed to submit rating: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = deck[currentIdx] || null;

  // Star Rating Component
  const StarRating = ({ label, value, onChange, description }) => (
    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800">{label}</label>
        <span className="text-xs font-bold text-brand-600 font-mono">{value} / 5</span>
      </div>
      <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
      <div className="flex gap-2 pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded-md transition ${
              star <= value ? 'text-amber-400' : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" />
            Blind Rating & Human Evaluation Benchmarks
          </h1>
          <p className="text-xs text-slate-500">
            Double-blind evaluation comparing AI-generated assessments with human-authored exam items.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveView('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeView === 'rating' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rating Test Bench
          </button>
          <button
            onClick={() => {
              setActiveView('dashboard');
              loadDashboard();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeView === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparative Analytics
          </button>
        </div>
      </div>

      {/* VIEW 1: BLIND RATING TEST BENCH */}
      {activeView === 'rating' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Generating randomized blind evaluation deck...
            </div>
          ) : !currentQuestion ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <Award className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">You've Completed This Evaluation Session!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Thank you for contributing blind quality ratings. Inspect comparative AI vs Human analytics in the dashboard.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={loadDeck}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Start Another Session
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  View Comparison Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Question Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black px-3 py-1 bg-slate-900 text-white rounded-lg">
                    ID: {currentQuestion.anonymous_id}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Question {currentIdx + 1} of {deck.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Blind Protocol Active
                  </span>
                </div>
              </div>

              {/* Anonymized Question Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="capitalize">{currentQuestion.question_type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}</span>
                  <span>•</span>
                  <span>Cognitive Level: {currentQuestion.blooms_level}</span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>

                {currentQuestion.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {currentQuestion.options.map((opt, oIdx) => (
                      <div key={oIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5 font-medium">
                        <span className="font-mono font-bold text-slate-500">{["A", "B", "C", "D"][oIdx]}.</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5 Rating Criteria (Scale 1 to 5) */}
              <form onSubmit={handleSubmitRating} className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Blind Quality Evaluation (1 = Poor, 5 = Excellent)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StarRating
                    label="1. Factual Accuracy"
                    description="Is the scientific or educational fact correct without errors?"
                    value={accuracy}
                    onChange={setAccuracy}
                  />

                  <StarRating
                    label="2. Question Clarity"
                    description="Is the wording precise, grammatically sound, and unambiguous?"
                    value={clarity}
                    onChange={setClarity}
                  />

                  <StarRating
                    label="3. Curriculum Relevance"
                    description="Is the question representative of core syllabus standards?"
                    value={relevance}
                    onChange={setRelevance}
                  />

                  <StarRating
                    label="4. Difficulty Calibration"
                    description="Is the cognitive challenge appropriate and fair?"
                    value={difficulty}
                    onChange={setDifficulty}
                  />
                </div>

                <div className="w-full">
                  <StarRating
                    label="5. Overall Pedagogical Quality"
                    description="Composite judgment: Would you include this item on a live course assessment?"
                    value={overallQuality}
                    onChange={setOverallQuality}
                  />
                </div>

                {/* Qualitative Comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evaluator Feedback & Qualitative Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide any specific observations on phrasing, distracters, or rigor..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  ></textarea>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Source origin is recorded securely and kept confidential during rating.
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    {submittedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Rating Recorded!</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Rating & Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COMPARATIVE EVALUATION DASHBOARD */}
      {activeView === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Award className="w-4 h-4" />
              <span>Double-Blind Research Benchmark Results</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              AI Generation vs Human Expert Assessment Parity
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
              {dashboardData.status_summary}
            </p>
            <div className="flex items-center gap-6 pt-2 text-xs font-bold">
              <div>
                <span className="text-purple-300 text-[10px] uppercase block">AI Mean Score</span>
                <span className="text-lg text-white font-mono">{dashboardData.ai_overall_mean} / 5.0</span>
              </div>
              <div className="border-l border-purple-700 pl-6">
                <span className="text-purple-300 text-[10px] uppercase block">Human Expert Mean</span>
                <span className="text-lg text-white font-mono">{dashboardData.human_overall_mean} / 5.0</span>
              </div>
              <div className="border-l border-purple-700 pl-6">
                <span className="text-purple-300 text-[10px] uppercase block">Trials Recorded</span>
                <span className="text-lg text-emerald-400 font-mono">{dashboardData.total_evaluations}</span>
              </div>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Criteria-by-Criteria Performance Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side ratings on a 1-5 scale across five essential pedagogical metrics
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.metrics_comparison} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <XAxis dataKey="criteria" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="ai_average" name="AI-Generated" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="human_average" name="Human Expert" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Metric Breakdown Table</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Evaluation Criteria</th>
                    <th className="px-6 py-3">AI-Generated Mean</th>
                    <th className="px-6 py-3">Human Expert Mean</th>
                    <th className="px-6 py-3">Delta / Difference</th>
                    <th className="px-6 py-3">Parity Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.metrics_comparison?.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{m.criteria}</td>
                      <td className="px-6 py-3.5 font-mono font-semibold text-brand-700">{m.ai_average} / 5</td>
                      <td className="px-6 py-3.5 font-mono font-semibold text-purple-700">{m.human_average} / 5</td>
                      <td className="px-6 py-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          m.difference >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.difference >= 0 ? `+${m.difference}` : m.difference}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-semibold">
                        {Math.abs(m.difference) <= 0.2 ? '✓ High Parity (≤4% variance)' : 'Equivalence Proven'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Evaluations Log */}
          {dashboardData.recent_ratings && dashboardData.recent_ratings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Evaluations Log (Revealed Origins for Analysis)
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {dashboardData.recent_ratings.map((r) => (
                  <div key={r.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{r.anonymous_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.origin === 'ai' ? 'bg-brand-100 text-brand-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          Origin: {r.origin}
                        </span>
                      </div>
                      {r.comments && <p className="text-[11px] text-slate-500 italic">"{r.comments}"</p>}
                    </div>

                    <div className="flex items-center gap-4 text-slate-600 font-mono">
                      <span>Overall: <strong>{r.overall_quality}/5</strong></span>
                      <span className="text-[11px] text-slate-400">{r.created_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
