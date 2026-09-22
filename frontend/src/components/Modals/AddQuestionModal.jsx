// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Add/Edit Question Modal
// Implements:
//   [FR-04: QUESTION BANK MANAGEMENT (Question Creation & AI Scoring Weights)]
// ==============================================================================

import React, { useState } from 'react';
import { X, HelpCircle, Sliders } from 'lucide-react';

const AddQuestionModal = ({ onClose, onSubmit, editData }) => {
  const isEditing = !!editData;

  const [formData, setFormData] = useState({
    question_text: editData?.question_text || '',
    category: editData?.category || 'Technical',
    difficulty: editData?.difficulty || 'Medium',
    keywords: editData?.keywords || ['SQL', 'Indexing', 'Optimization', 'Logs'],
    ai_scoring_enabled: editData?.ai_scoring_enabled ?? true,
    weights: editData?.weights || {
      honesty: 50,
      confidence: 50,
      attitude: 50,
      relevance: 50,
    },
  });

  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.keywords.includes(keywordInput.trim())) {
        setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (tag) => {
    setFormData({ ...formData, keywords: formData.keywords.filter((k) => k !== tag) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit({ ...formData, id: editData.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white text-base font-bold font-display">
              {isEditing ? 'Configure Interview Prompt' : 'Create Interview Prompt'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">
              Prompt Specification:
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Enter question text or coding problem statement..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition resize-none font-mono"
              required
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer font-mono"
              >
                <option>Technical</option>
                <option>Behavioral</option>
                <option>Situational</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Difficulty:</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer font-mono"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          {/* Keyword Benchmarks */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">
              Required Token Keywords:
            </label>
            <div className="bg-[#0A0E16] border border-white/10 rounded-xl p-2.5 flex flex-wrap items-center gap-2">
              {formData.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 text-[11px] font-mono rounded-lg flex items-center gap-1.5"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Type & press Enter..."
                className="bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none flex-1 min-w-[120px] px-1 font-mono"
              />
            </div>
          </div>

          {/* Enable AI Toggle */}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, ai_scoring_enabled: !formData.ai_scoring_enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                formData.ai_scoring_enabled ? 'bg-emerald-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-4 h-4 bg-surface rounded-full absolute top-1 transition-transform ${
                  formData.ai_scoring_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-gray-200 text-xs font-mono font-medium">Enable AI Semantic Scoring Weight</span>
          </div>

          {/* Scoring Weights */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">
              Scoring Weights (Multimodal Bias)
            </label>
            <div className="grid grid-cols-2 gap-3 bg-[#0A0E16] p-3.5 rounded-xl border border-white/5 font-mono">
              {['honesty', 'confidence', 'attitude', 'relevance'].map((attr) => (
                <div key={attr} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 capitalize">
                    <span>{attr}</span>
                    <span className="text-emerald-400 font-bold">{formData.weights[attr]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.weights[attr]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weights: { ...formData.weights, [attr]: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-surface-card rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface rounded-xl text-xs font-bold font-display transition shadow-lg shadow-emerald-500/20"
            >
              {isEditing ? 'Save Prompt Changes' : 'Publish Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
