// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Question Bank Management
// Implements:
//   [FR-04: QUESTION BANK MANAGEMENT (Add, View, Update, Delete, Duplicate Prevention)]
//   [FR-02: ROLE-BASED ACCESS CONTROL (Admin Only Delete Protection)]
//   [FR-21: SYSTEM AUDIT LOGGING (Question Bank Operations)]
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit, Sliders, RefreshCw, Database } from 'lucide-react';
import { dummyQuestions } from '../lib/dummyData';
import AddQuestionModal from '../components/Modals/AddQuestionModal';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const difficultyColors = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const QuestionBank = () => {
  const { user } = useAuth();

  const getStoredQuestions = () => {
    try {
      const stored = localStorage.getItem('mm_question_bank_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return dummyQuestions;
  };

  const [questions, setQuestions] = useState(getStoredQuestions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [difficultyFilter, setDifficultyFilter] = useState('All Difficulties');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ online: isSupabaseConfigured(), message: isSupabaseConfigured() ? 'Supabase Cloud DB' : 'Local Persistent Storage' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  /**
   * [FR-04: View Questions]
   * Loads question bank repository from Supabase PostgreSQL and merges with local storage
   */
  const fetchQuestions = async () => {
    setLoading(true);
    let currentList = getStoredQuestions();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('question_bank').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn('[Supabase] Question fetch note:', error.message);
          setDbStatus({ online: false, message: `Supabase: ${error.message}` });
        } else if (data && data.length > 0) {
          const map = new Map();
          data.forEach(q => map.set(q.id, q));
          currentList.forEach(q => {
            if (!map.has(q.id)) map.set(q.id, q);
          });
          currentList = Array.from(map.values());
          setDbStatus({ online: true, message: 'Supabase Cloud Synchronized' });
        } else {
          setDbStatus({ online: true, message: 'Supabase Connected' });
        }
      } catch (e) {
        console.warn('Supabase fetch failed:', e.message);
        setDbStatus({ online: false, message: 'Local Persistent Storage' });
      }
    } else {
      setDbStatus({ online: false, message: 'Local Persistent Storage' });
    }

    setQuestions(currentList);
    localStorage.setItem('mm_question_bank_list', JSON.stringify(currentList));
    setLoading(false);
  };

  /**
   * [FR-04: Add Question & Duplicate Validation]
   */
  const handleAddQuestion = async (formData) => {
    const isDuplicate = questions.some(
      (q) => q.question_text.trim().toLowerCase() === formData.question_text.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error('Duplicate question detected. This question already exists in the bank.');
      return;
    }

    const generatedId = `q-${Date.now()}`;
    const newQuestion = {
      id: generatedId,
      question_text: formData.question_text,
      category: formData.category,
      difficulty: formData.difficulty,
      keywords: formData.keywords || [],
      ai_scoring_enabled: formData.ai_scoring_enabled,
      weights: formData.weights,
      created_at: new Date().toISOString(),
    };

    // 1. Immediately persist to state & local storage
    const updatedLocal = [newQuestion, ...questions.filter(q => q.id !== generatedId)];
    setQuestions(updatedLocal);
    localStorage.setItem('mm_question_bank_list', JSON.stringify(updatedLocal));

    // 2. Dual-write to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('question_bank').insert([{
          question_text: newQuestion.question_text,
          category: newQuestion.category,
          difficulty: newQuestion.difficulty,
          keywords: newQuestion.keywords,
          ai_scoring_enabled: newQuestion.ai_scoring_enabled,
          weights: newQuestion.weights,
        }]).select('*');

        if (error) {
          console.warn('[Supabase Insert Note]:', error.message);
          toast(`Question saved locally (Supabase: ${error.message})`, { icon: '💾' });
        } else if (data && data[0]) {
          const cloudQ = data[0];
          const finalMerged = [cloudQ, ...questions.filter(q => q.id !== generatedId && q.id !== cloudQ.id)];
          setQuestions(finalMerged);
          localStorage.setItem('mm_question_bank_list', JSON.stringify(finalMerged));
          toast.success('Question saved to Supabase Cloud & Local DB!');
        }
      } catch (e) {
        console.error('Error inserting question:', e);
        toast.success('Question added successfully.');
      }
    } else {
      toast.success('Question added successfully.');
    }

    // 3. Write Audit Log (FR-21)
    await writeAuditLog({
      action: 'QUESTION_CREATED',
      entityType: 'question_bank',
      entityId: generatedId,
      details: `Added question: "${formData.question_text.substring(0, 60)}..." (${formData.category})`,
      userEmail: user?.email,
    });

    setShowAddModal(false);
  };

  /**
   * [FR-04: Update Question]
   */
  const handleEditQuestion = async (formData) => {
    const isDuplicate = questions.some(
      (q) => q.id !== formData.id && q.question_text.trim().toLowerCase() === formData.question_text.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error('Duplicate question detected. Another question with this text already exists.');
      return;
    }

    const updatePayload = {
      question_text: formData.question_text,
      category: formData.category,
      difficulty: formData.difficulty,
      keywords: formData.keywords || [],
      ai_scoring_enabled: formData.ai_scoring_enabled,
      weights: formData.weights,
    };

    // 1. Immediately persist to state & local storage
    const updated = questions.map(q => q.id === formData.id ? { ...q, ...updatePayload } : q);
    setQuestions(updated);
    localStorage.setItem('mm_question_bank_list', JSON.stringify(updated));

    // 2. Update Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('question_bank')
          .update(updatePayload)
          .eq('id', formData.id);

        if (error) {
          console.warn('[Supabase Update Note]:', error.message);
        }
      } catch (e) {
        console.error('Error updating question in Supabase:', e);
      }
    }

    // 3. Write Audit Log (FR-21)
    await writeAuditLog({
      action: 'QUESTION_UPDATED',
      entityType: 'question_bank',
      entityId: formData.id,
      details: `Updated question: "${formData.question_text.substring(0, 60)}..." (${formData.category})`,
      userEmail: user?.email,
    });

    setEditingQuestion(null);
    toast.success('Question updated successfully.');
  };

  /**
   * [FR-02: RBAC Deletion & FR-04: Delete Question]
   */
  const handleDeleteQuestion = async (id) => {
    if (user?.role !== 'Admin') {
      toast.error('Access Denied: Only System Administrators can delete questions.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    const target = questions.find(q => q.id === id);

    // 1. Update state & local storage
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem('mm_question_bank_list', JSON.stringify(updated));

    // 2. Delete from Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('question_bank').delete().eq('id', id);
      } catch (_) {}
    }

    // 3. Write Audit Log (FR-21)
    await writeAuditLog({
      action: 'QUESTION_DELETED',
      entityType: 'question_bank',
      entityId: id,
      details: `Deleted question: "${(target?.question_text || '').substring(0, 60)}..."`,
      userEmail: user?.email,
    });

    toast.success('Question deleted successfully.');
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      (q.question_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.keywords || []).some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = categoryFilter === 'All Categories' || q.category === categoryFilter;
    const matchDifficulty = difficultyFilter === 'All Difficulties' || q.difficulty === difficultyFilter;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const categories = [...new Set(questions.map((q) => q.category))];

  return (
    <div>
      <Toaster position="top-right" />
      
      {/* Header with Title and Database Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank</h1>
          <p className="text-gray-400 text-xs mt-1">Manage technical and behavioral question repository with AI keyword scoring weights</p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2 bg-[#252525] px-3.5 py-1.5 rounded-xl border border-gray-800 text-xs">
          <Database className="w-3.5 h-3.5 text-[#a8b88c]" />
          <span className="text-gray-300 font-medium">{dbStatus.message}</span>
          <span className="w-2 h-2 rounded-full bg-[#a8b88c] animate-pulse" />
        </div>
      </div>

      {/* [FR-04: Toolbar with Add & Search] */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
        <button onClick={fetchQuestions} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg text-sm border border-gray-700 hover:border-gray-600 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] w-64 transition"
          />
        </div>
      </div>

      {/* [FR-04: Difficulty & Category Filters] */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
        >
          <option>All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
        >
          <option>All Difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      {/* [FR-04: Questions Cards Grid] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-[#252525] rounded-xl p-5 border border-gray-800/50 hover:border-gray-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 bg-[#2a2a2a] border border-gray-700 text-gray-300 rounded-md text-xs font-medium">
                  {q.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[q.difficulty] || difficultyColors['Medium']}`}
                >
                  {q.difficulty}
                </span>
              </div>
              <p className="text-gray-200 text-sm font-medium mb-4">{q.question_text}</p>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {(q.keywords || []).map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[#3a3a3a] text-gray-400 rounded text-[11px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sliders className="w-3.5 h-3.5 text-[#a8b88c]" />
                  <span>AI Keyword Scoring: {q.ai_scoring_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center gap-1">
                  {/* [FR-04: Edit Question Action] */}
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-1.5 text-gray-400 hover:text-[#d4a843] hover:bg-[#d4a843]/10 rounded transition"
                    title="Edit Question"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {/* [FR-02: Admin Delete Action] */}
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded transition"
                      title="Delete Question (Admin Only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* [FR-04: Add Question Modal] */}
      {showAddModal && (
        <AddQuestionModal onClose={() => setShowAddModal(false)} onSubmit={handleAddQuestion} />
      )}

      {/* [FR-04: Edit Question Modal] */}
      {editingQuestion && (
        <AddQuestionModal
          onClose={() => setEditingQuestion(null)}
          onSubmit={handleEditQuestion}
          editData={editingQuestion}
        />
      )}
    </div>
  );
};

export default QuestionBank;
