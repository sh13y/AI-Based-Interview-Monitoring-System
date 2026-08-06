import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit, Sliders, RefreshCw } from 'lucide-react';
import { dummyQuestions } from '../lib/dummyData';
import AddQuestionModal from '../components/Modals/AddQuestionModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const difficultyColors = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const QuestionBank = () => {
  const [questions, setQuestions] = useState(dummyQuestions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [difficultyFilter, setDifficultyFilter] = useState('All Difficulties');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('question_bank').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setQuestions(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Supabase fetch failed, fallback to dummy data:', e);
      }
    }
    setQuestions(dummyQuestions);
    setLoading(false);
  };

  const handleAddQuestion = async (formData) => {
    const newQuestion = {
      question_text: formData.question_text,
      category: formData.category,
      difficulty: formData.difficulty,
      keywords: formData.keywords || [],
      ai_scoring_enabled: formData.ai_scoring_enabled,
      weights: formData.weights,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('question_bank').insert([newQuestion]).select('*');
        if (!error && data) {
          setQuestions(prev => [data[0], ...prev]);
          setShowAddModal(false);
          return;
        }
      } catch (e) {
        console.error('Error inserting question:', e);
      }
    }

    setQuestions(prev => [{ id: `q-${Date.now()}`, ...newQuestion }, ...prev]);
    setShowAddModal(false);
  };

  const handleDeleteQuestion = async (id) => {
    if (isSupabaseConfigured()) {
      await supabase.from('question_bank').delete().eq('id', id);
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
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
      <h1 className="text-2xl font-bold text-white mb-6">Question Bank</h1>

      {/* Toolbar */}
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

      {/* Filters */}
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

      {/* Questions Grid */}
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
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddQuestionModal onClose={() => setShowAddModal(false)} onSubmit={handleAddQuestion} />
      )}
    </div>
  );
};

export default QuestionBank;
