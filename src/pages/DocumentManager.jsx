import React, { useState } from 'react';
import { 
  Upload, FileText, Plus, Trash2, Eye, BookOpen, 
  CheckCircle2, AlertCircle, FileCode, Clock, Layers, Sparkles, RefreshCw
} from 'lucide-react';
import api from '../api';

export default function DocumentManager({ 
  documents = [], 
  onRefresh, 
  onSelectDoc, 
  selectedDocId,
  onNavigate 
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manual'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [manualText, setManualText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const res = await api.uploadDocument(file, title, subject);
      setSuccessMsg(`Document '${res.title}' processed successfully! Segmented into ${res.chapters.length} chapters.`);
      setFile(null);
      setTitle('');
      await onRefresh();
      onSelectDoc(res.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and parse document.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualText.trim() || manualText.trim().split(/\s+/).length < 20) {
      setError('Please provide at least 20 words of syllabus or textbook content.');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const docTitle = title.trim() || 'Manual Syllabus Content';
      const res = await api.createManualDocument(docTitle, subject, manualText);
      setSuccessMsg(`Manual document '${res.title}' created and parsed into ${res.chapters.length} sections!`);
      setTitle('');
      setManualText('');
      await onRefresh();
      onSelectDoc(res.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process manual content.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, docTitle) => {
    if (!window.confirm(`Are you sure you want to delete '${docTitle}' and all its generated study materials?`)) {
      return;
    }
    try {
      await api.deleteDocument(docId);
      await onRefresh();
    } catch (err) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleViewPreview = async (docId) => {
    try {
      setLoadingPreview(true);
      const doc = await api.getDocument(docId);
      setPreviewDoc(doc);
    } catch (err) {
      alert('Failed to load document preview: ' + err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Document Upload & Management</h1>
          <p className="text-xs text-slate-500">
            Upload educational textbooks, research papers, lecture notes, or enter syllabus content manually.
          </p>
        </div>

        <button
          onClick={() => onNavigate('generate')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-md shadow-brand-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Generator</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Upload & Manual Input Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'upload' 
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document (PDF, DOCX, TXT)</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'manual' 
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Enter Syllabus Text Manually</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' ? (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Systems & Microservices"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Academic Discipline
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Science, Medicine, Physics"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center transition cursor-pointer bg-slate-50/50 hover:bg-brand-50/20">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800">{file.name}</p>
                      <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB • Ready to parse</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-1">
                        Click to upload or drag and drop your document
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Supports PDF (PyMuPDF parser), Microsoft Word (.docx), or Plain Text (.txt)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting & Segmenting Chapters...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Process Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Syllabus Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unit 3: Relational Database Normalization"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Category
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Database Systems"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Paste Educational Content / Lecture Notes *
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {manualText.trim() ? manualText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste textbook excerpts, definitions, formulas, or lecture material here..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !manualText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Content...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Parse & Save Content</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Uploaded Study Materials ({documents.length})</h2>
            <p className="text-xs text-slate-500">All parsed textbooks, documents, and syllabi</p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No study materials uploaded yet. Upload a PDF/DOCX/TXT file or click 'Load Sample Data' in the top bar.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDocId;

              return (
                <div 
                  key={doc.id} 
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                    isSelected ? 'bg-brand-50/40 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      doc.file_type === 'pdf' ? 'bg-rose-100 text-rose-700' :
                      doc.file_type === 'docx' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                          {doc.title}
                        </span>
                        {doc.is_sample === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Demo Sample
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                          {doc.file_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span>{doc.subject}</span>
                        <span>•</span>
                        <span>{doc.word_count.toLocaleString()} words</span>
                        <span>•</span>
                        <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                        <span>•</span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.chapter_count} chapters</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleViewPreview(doc.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                      title="Inspect extracted raw text & chapters"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectDoc(doc.id);
                        onNavigate('generate');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate</span>
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Content Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewDoc.title}</h3>
                <p className="text-xs text-slate-500">{previewDoc.chapters.length} Segmented Chapters • {previewDoc.word_count} words</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chapter Breakdown</h4>
              <div className="space-y-3">
                {previewDoc.chapters.map((ch) => (
                  <div key={ch.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{ch.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{ch.word_count} words</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-mono text-[11px]">
                      {ch.content}
                    </p>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-3">Raw Extracted Source Text Preview</h4>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                {previewDoc.raw_text.slice(0, 2000)}...
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
