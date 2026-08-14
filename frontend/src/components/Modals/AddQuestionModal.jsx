// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Add/Edit Question Modal
// Implements:
//   [FR-04: QUESTION BANK MANAGEMENT (Question Creation & AI Scoring Weights)]
// ==============================================================================

import React, { useState } from 'react';
import { X } from 'lucide-react';

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-white text-lg font-bold">{isEditing ? 'Edit Question' : 'Add Question'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Question Text */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Question:</label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Enter your Interview question..."
              rows={3}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition resize-none"
              required
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
              >
                <option>Technical</option>
                <option>Behavioral</option>
                <option>Situational</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty:</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          {/* Keyword Benchmarks */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Keyword Benchmarks:</label>
            <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-2 flex flex-wrap items-center gap-2">
              {formData.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#3a3a3a] text-gray-300 text-xs rounded-md flex items-center gap-1.5"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="text-gray-500 hover:text-gray-300"
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
                placeholder="Tap keywords..."
                className="bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none flex-1 min-w-[100px] px-2"
              />
            </div>
          </div>

          {/* Enable AI Toggle */}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, ai_scoring_enabled: !formData.ai_scoring_enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                formData.ai_scoring_enabled ? 'bg-[#d4a843]' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  formData.ai_scoring_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
            <span className="text-gray-200 text-sm font-medium">Enable AI Keyword Scoring</span>
          </div>

          {/* Scoring Weights */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Scoring Weight (Optional Override)
            </label>
            <div className="grid grid-cols-2 gap-4 bg-[#252525] p-4 rounded-xl border border-gray-800">
              {['honesty', 'confidence', 'attitude', 'relevance'].map((attr) => (
                <div key={attr} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 capitalize">
                    <span>{attr}</span>
                    <span className="text-[#a8b88c] font-bold">{formData.weights[attr]}%</span>
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
                    className="w-full accent-[#a8b88c] cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-400 hover:text-gray-200 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition"
            >
              {isEditing ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
