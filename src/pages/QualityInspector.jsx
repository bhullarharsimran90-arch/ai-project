import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, RefreshCw, 
  BrainCircuit, Sparkles, Filter, ChevronRight, Info, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import api from '../api';

export default function QualityInspector({ selectedDocId, documents = [], onNavigate }) {
  const [auditData, setAuditData] = useState(null);
  const [bloomsData, setBloomsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDocId) {
      loadAudit();
    }
  }, [selectedDocId]);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const [auditRes, bloomsRes] = await Promise.all([
        api.auditQuality(selectedDocId),
        api.getBloomsDistribution(selectedDocId)
      ]);
      setAuditData(auditRes);
      setBloomsData(bloomsRes.distribution || []);
    } catch (err) {
      console.error('Failed to load quality audit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            AI Quality Control & Factual Grounding Inspector
          </h1>
          <p className="text-xs text-slate-500">
            Automated verification against hallucinations, duplicate detection, ambiguity filters, and Bloom's cognitive distribution.
          </p>
        </div>

        <button
          onClick={loadAudit}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-run Quality Audit</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Running automated factual grounding and quality checks...
        </div>
      ) : !auditData ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          No audit data available. Please generate questions first.
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Composite Quality
              </span>
              <div className="text-2xl font-black text-slate-900">
                {auditData.avg_quality_score}%
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Standards Met
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Confidence Score
              </span>
              <div className="text-2xl font-black text-brand-600">
                {auditData.avg_confidence_score}%
              </div>
              <p className="text-[11px] text-slate-500">
                Certainty across syllabus
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Passed Quality Gates
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {auditData.passed_qc} / {auditData.total_evaluated}
              </div>
              <p className="text-[11px] text-slate-500">
                {Math.round((auditData.passed_qc / (auditData.total_evaluated || 1)) * 100)}% Pass Rate
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Audit Flags
              </span>
              <div className="text-2xl font-black text-amber-600">
                {auditData.duplicates_flagged + auditData.ambiguous_flagged + auditData.unsupported_flagged}
              </div>
              <p className="text-[11px] text-slate-500">
                Duplicates & Ambiguity
              </p>
            </div>
          </div>

          {/* Factual Grounding Verification System Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>1. Factual Grounding</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                  {auditData.unsupported_flagged === 0 ? 'Verified 100%' : `${auditData.unsupported_flagged} Flagged`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Checks that every answer key fact, entity, and proposition is explicitly supported by uploaded text excerpts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>2. Duplicate Removal</span>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                  {auditData.duplicates_flagged === 0 ? 'Zero Duplicates' : `${auditData.duplicates_flagged} Detected`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Computes Jaccard and n-gram similarity across the entire question pool to prevent redundant test items.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>3. Ambiguity Detector</span>
                <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px]">
                  {auditData.ambiguous_flagged === 0 ? 'Clear & Rigorous' : `${auditData.ambiguous_flagged} Ambiguous`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Filters vague qualifiers, improper double negatives, and validates distracter distinctness in MCQ stems.
              </p>
            </div>
          </div>

          {/* Bloom's Taxonomy Visual Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-brand-600" />
                  Bloom's Taxonomy Cognitive Level Breakdown
                </h2>
                <p className="text-xs text-slate-500">
                  Distribution of questions across the six educational cognitive domains
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bloomsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(val, name, props) => [`${val} Questions (${props.payload.percentage}%)`, "Count"]}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {bloomsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#4f46e5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie / Donut Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bloomsData}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bloomsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#4f46e5'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Audit Findings Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Detailed Inspection Audit Findings ({auditData.findings?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">Flags and recommendations for question bank improvement</p>
              </div>
            </div>

            {auditData.findings && auditData.findings.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {auditData.findings.map((f, i) => (
                  <div key={i} className="p-4 sm:p-5 flex items-start gap-3 hover:bg-slate-50 transition">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 capitalize">
                          Issue: {f.issue_type}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          f.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">"{f.question_text}"</p>
                      <p className="text-[11px] text-slate-500">{f.description}</p>
                      <div className="text-[11px] text-brand-700 font-semibold pt-1">
                        Recommendation: {f.recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-emerald-700 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold">Zero Quality Anomalies Detected!</p>
                <p className="text-slate-500 text-[11px]">
                  All generated questions satisfy strict factual grounding, clarity, and non-duplication criteria.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
