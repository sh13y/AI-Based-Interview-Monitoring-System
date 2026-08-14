// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Edit Candidate Modal
// Implements:
//   [FR-03: CANDIDATE DATA MANAGEMENT (Candidate Update & CV PDF Replacement)]
// ==============================================================================

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Trash2, Download } from 'lucide-react';

const EditCandidateModal = ({ onClose, onSubmit, candidate }) => {
  const [formData, setFormData] = useState({
    full_name: candidate?.full_name || '',
    email: candidate?.email || '',
    position: candidate?.position || 'Software Engineer',
    keywords: candidate?.keywords || [],
    notes: candidate?.notes || '',
    status: candidate?.status || 'Pending Review',
    resume_url: candidate?.resume_url || null,
    resume_name: candidate?.resume_name || null,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const positions = [
    'Software Engineer',
    'Marketing Manager',
    'HR Coordinator',
    'Data Analyst',
    'Product Manager',
    'AI Specialist',
    'UX Designer',
    'DevOps Engineer'
  ];

  const keywordOptions = ['Java Developer', 'React', 'Node.js', 'Python', 'SQL', 'Machine Learning', 'AWS', 'Docker', 'System Design'];
  const statuses = ['Pending Review', 'In Progress', 'Evaluated', 'Rejected'];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        resume_url: event.target.result,
        resume_name: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, resume_url: null, resume_name: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id: candidate.id });
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-white text-lg font-bold">Edit Candidate</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter Full Name"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition"
              required
            />
          </div>

          {/* Position & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer appearance-none"
              >
                {positions.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer appearance-none"
              >
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Resume Upload / Replace */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Candidate Resume / CV File</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt,.doc"
              onChange={handleFileChange}
              className="hidden"
            />

            {!formData.resume_name && !formData.resume_url && !selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-[#a8b88c] rounded-xl p-5 text-center transition cursor-pointer bg-[#2a2a2a]/40 group"
              >
                <Upload className="w-6 h-6 text-gray-500 group-hover:text-[#a8b88c] mx-auto mb-1.5 transition" />
                <p className="text-gray-300 text-xs font-semibold">Click to upload CV (.pdf, .docx, .txt)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-[#252525] border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#a8b88c]" />
                  <div>
                    <p className="text-white text-xs font-bold truncate max-w-xs">{formData.resume_name || selectedFile?.name || `${formData.full_name}_cv.pdf`}</p>
                    <p className="text-gray-500 text-[10px]">Resume file attached</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#a8b88c] hover:underline font-semibold"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-gray-400 hover:text-red-400 transition"
                    title="Remove CV"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Keyword Benchmarks</label>
            <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-2 flex flex-wrap items-center gap-2 min-h-[44px]">
              {formData.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#3a3a3a] text-gray-300 text-xs rounded-md flex items-center gap-1.5"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== kw) })}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              ))}
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.keywords.includes(e.target.value)) {
                    setFormData({ ...formData, keywords: [...formData.keywords, e.target.value] });
                  }
                  e.target.value = '';
                }}
                className="bg-transparent text-sm text-gray-300 focus:outline-none flex-1 min-w-[100px] px-2 cursor-pointer"
              >
                <option value="">Add keyword...</option>
                {keywordOptions.filter(k => !formData.keywords.includes(k)).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes..."
              rows={2}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-400 hover:text-gray-200 text-sm font-medium transition">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition">
              Update Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCandidateModal;
