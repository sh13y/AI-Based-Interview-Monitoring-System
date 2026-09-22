// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Edit Candidate Modal
// Implements:
//   [FR-03: CANDIDATE DATA MANAGEMENT (Candidate Update & CV PDF Replacement)]
// ==============================================================================

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Trash2, Edit } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Edit className="w-5 h-5 text-amber-400" />
            <h2 className="text-white text-base font-bold font-display">Update Candidate Dossier</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter Full Name"
              className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter Email"
              className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
              required
            />
          </div>

          {/* Position & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Target Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer font-mono"
              >
                {positions.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Pipeline Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer font-mono"
              >
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Add Competency Tag</label>
            <select
              onChange={(e) => {
                if (e.target.value && !formData.keywords.includes(e.target.value)) {
                  setFormData({ ...formData, keywords: [...formData.keywords, e.target.value] });
                }
                e.target.value = '';
              }}
              className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer font-mono"
            >
              <option value="">+ Add Tag</option>
              {keywordOptions.filter(k => !formData.keywords.includes(k)).map(k => <option key={k}>{k}</option>)}
            </select>
          </div>

          {/* Selected Keywords Badges */}
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#0A0E16] rounded-xl border border-white/5">
              {formData.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-white/5 text-gray-300 text-[11px] font-mono rounded-lg flex items-center gap-1.5 border border-white/10">
                  {kw}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== kw) })}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Resume / CV File Upload */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">
              Resume / CV File (.pdf, .docx, .txt)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt,.doc"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile && !formData.resume_name && !formData.resume_url ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
                className="border border-dashed border-white/15 hover:border-emerald-500/40 rounded-xl p-5 text-center transition cursor-pointer bg-[#0A0E16]/60 group"
              >
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-400 mx-auto mb-1.5 transition" />
                <p className="text-gray-300 text-xs font-mono">
                  Select candidate PDF CV or drag & drop file
                </p>
                <p className="text-gray-500 text-[10px] font-mono mt-0.5">Parsed for native preview & verification</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-[#0A0E16] border border-white/10 rounded-xl font-mono">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white text-xs font-bold truncate max-w-xs">{formData.resume_name || `${formData.full_name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`}</p>
                    <p className="text-gray-500 text-[10px]">
                      {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB · Uploaded` : 'Resume attached'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-rose-400 transition"
                  title="Remove CV"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider">Evaluation Dossier Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Candidate interview preparation notes or background details..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition resize-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-400 hover:text-white text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 font-display"
            >
              Update Candidate Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCandidateModal;
