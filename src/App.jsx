import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentManager from './pages/DocumentManager';
import GenerateContent from './pages/GenerateContent';
import SummaryViewer from './pages/SummaryViewer';
import FlashcardStudio from './pages/FlashcardStudio';
import QuizArena from './pages/QuizArena';
import QuestionBank from './pages/QuestionBank';
import QualityInspector from './pages/QualityInspector';
import BlindEvaluation from './pages/BlindEvaluation';
import api from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Load initial documents & AI status
  useEffect(() => {
    refreshInitialData();
  }, []);

  const refreshInitialData = async () => {
    try {
      setLoadingDocs(true);
      const [docs, status] = await Promise.all([
        api.getDocuments().catch(() => []),
        api.getAIStatus().catch(() => ({ active_provider: 'local_engine' }))
      ]);

      setDocuments(docs);
      setAiStatus(status);

      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleLoadSamples = async () => {
    try {
      setLoadingSamples(true);
      const res = await api.loadSamples();
      await refreshInitialData();
      if (res.document_ids && res.document_ids.length > 0) {
        setSelectedDocId(res.document_ids[0]);
      }
      alert('Sample textbooks, chapter summaries, flashcards, MCQs, and human benchmark questions loaded successfully!');
    } catch (err) {
      alert('Failed to load sample data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingSamples(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Navigation */}
      <Navbar
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={setSelectedDocId}
        aiStatus={aiStatus}
        onLoadSamples={handleLoadSamples}
        loadingSamples={loadingSamples}
      />

      {/* Main Container with Sidebar + Page Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          stats={{
            documentsCount: documents.length,
            qcScore: 96
          }}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={setSelectedDocId}
              onNavigate={setActiveTab}
              onLoadSamples={handleLoadSamples}
              loadingSamples={loadingSamples}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManager
              documents={documents}
              onRefresh={refreshInitialData}
              onSelectDoc={setSelectedDocId}
              selectedDocId={selectedDocId}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'generate' && (
            <GenerateContent
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={setSelectedDocId}
              onNavigate={setActiveTab}
              onRefresh={refreshInitialData}
            />
          )}

          {activeTab === 'summaries' && (
            <SummaryViewer
              selectedDocId={selectedDocId}
              documents={documents}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardStudio
              selectedDocId={selectedDocId}
              documents={documents}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizArena
              selectedDocId={selectedDocId}
              documents={documents}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionBank
              selectedDocId={selectedDocId}
              documents={documents}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'quality' && (
            <QualityInspector
              selectedDocId={selectedDocId}
              documents={documents}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'blind-eval' && (
            <BlindEvaluation />
          )}
        </main>
      </div>
    </div>
  );
}
