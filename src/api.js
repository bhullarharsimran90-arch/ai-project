import axios from 'axios';

// Detect base URL (direct backend port 8000 fallback or proxy)
const API_BASE = window.location.port === '5173' ? 'http://127.0.0.1:8000/api' : '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const api = {
  // System & Status
  getHealth: async () => (await apiClient.get('/health')).data,
  getAIStatus: async () => (await apiClient.get('/generate/status')).data,

  // Documents
  getDocuments: async () => (await apiClient.get('/documents')).data,
  getDocument: async (id) => (await apiClient.get(`/documents/${id}`)).data,
  deleteDocument: async (id) => (await apiClient.delete(`/documents/${id}`)).data,
  loadSamples: async () => (await apiClient.post('/documents/load-samples')).data,
  
  uploadDocument: async (file, title, subject) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (subject) formData.append('subject', subject);
    
    return (await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  createManualDocument: async (title, subject, content) => {
    return (await apiClient.post('/documents/manual', { title, subject, content })).data;
  },

  // Content Generation
  generateContent: async (payload) => {
    return (await apiClient.post('/generate', payload)).data;
  },

  // Study Materials: Summaries, Flashcards, Questions
  getSummaries: async (docId) => (await apiClient.get(`/materials/summaries/${docId}`)).data,
  
  getFlashcards: async (docId, chapter, status) => {
    const params = {};
    if (chapter) params.chapter = chapter;
    if (status) params.status = status;
    return (await apiClient.get(`/materials/flashcards/${docId}`, { params })).data;
  },

  updateFlashcardStatus: async (cardId, status) => {
    return (await apiClient.put(`/materials/flashcards/${cardId}/status`, { mastery_status: status })).data;
  },

  getQuestions: async (docId, qType, bloomsLevel, difficulty) => {
    const params = {};
    if (qType) params.q_type = qType;
    if (bloomsLevel) params.blooms_level = bloomsLevel;
    if (difficulty) params.difficulty = difficulty;
    return (await apiClient.get(`/materials/questions/${docId}`, { params })).data;
  },

  // Quizzes & Practice Tests
  startQuiz: async (docId, chapterTitle, questionCount, difficulty) => {
    return (await apiClient.post('/quizzes/start', {
      document_id: docId,
      chapter_title: chapterTitle || 'All',
      question_count: questionCount || 5,
      difficulty: difficulty || 'All',
    })).data;
  },

  submitQuiz: async (docId, title, timeSpent, answers) => {
    return (await apiClient.post('/quizzes/submit', {
      document_id: docId,
      title,
      time_spent_seconds: timeSpent,
      answers,
    })).data;
  },

  getQuizHistory: async (docId) => (await apiClient.get(`/quizzes/history/${docId}`)).data,
  getQuizAttempt: async (attemptId) => (await apiClient.get(`/quizzes/attempt/${attemptId}`)).data,

  // Quality Control & Bloom's Taxonomy
  auditQuality: async (docId) => (await apiClient.get(`/quality/audit/${docId}`)).data,
  getBloomsDistribution: async (docId) => (await apiClient.get(`/quality/blooms-distribution/${docId}`)).data,

  // Blind Evaluation
  getBlindDeck: async (limit = 6) => (await apiClient.get(`/evaluations/blind-deck?limit=${limit}`)).data,
  submitBlindRating: async (payload) => (await apiClient.post('/evaluations/rate', payload)).data,
  getEvaluationDashboard: async () => (await apiClient.get('/evaluations/dashboard')).data,
};

export default api;
