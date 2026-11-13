import React from 'react';
import { 
  LayoutDashboard, FolderUp, Wand2, FileText, 
  Layers, HelpCircle, CheckSquare, ShieldCheck, 
  Scale, BookOpen, GraduationCap, ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, stats = {} }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Platform overview & analytics'
    },
    {
      id: 'documents',
      label: 'Document Hub',
      icon: FolderUp,
      badge: stats.documentsCount || null,
      desc: 'PDF, DOCX & text processor'
    },
    {
      id: 'generate',
      label: 'AI Generator',
      icon: Wand2,
      badge: 'Create',
      badgeColor: 'bg-brand-100 text-brand-700',
      desc: 'Generate summaries & questions'
    },
    {
      id: 'summaries',
      label: 'Summaries & Notes',
      icon: FileText,
      badge: stats.summariesCount || null,
      desc: 'Short, medium & detailed notes'
    },
    {
      id: 'flashcards',
      label: 'Flashcard Studio',
      icon: Layers,
      badge: stats.flashcardsCount || null,
      desc: '3D revision & mastery tracking'
    },
    {
      id: 'quizzes',
      label: 'Practice Quizzes',
      icon: HelpCircle,
      badge: stats.quizzesCount || null,
      desc: 'Interactive timed quizzes'
    },
    {
      id: 'questions',
      label: 'Question Bank & Keys',
      icon: CheckSquare,
      badge: stats.questionsCount || null,
      desc: 'MCQs, 2/5/10 marks & citations'
    },
    {
      id: 'quality',
      label: 'Quality Inspector',
      icon: ShieldCheck,
      badge: stats.qcScore ? `${stats.qcScore}%` : 'Audit',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Factual check & Bloom’s audit'
    },
    {
      id: 'blind-eval',
      label: 'Blind Human Eval',
      icon: Scale,
      badge: 'Benchmark',
      badgeColor: 'bg-purple-100 text-purple-800',
      desc: 'AI vs Human comparative rating'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Main Menu
            </span>
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-md shadow-brand-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-600'
                    }`} />
                    <span className="text-xs truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badgeColor || 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-gradient-to-br from-slate-50 to-brand-50/50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Factual Grounding</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All assessments are cross-referenced with uploaded source text to prevent hallucinations.
          </p>
        </div>
      </div>
    </aside>
  );
}
