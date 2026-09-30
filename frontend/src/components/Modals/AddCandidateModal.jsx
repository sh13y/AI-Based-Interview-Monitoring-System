// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Add Candidate Modal
// Implements:
//   - Candidate Registration & CV File Upload
//   - Job Role Selection & Addition
//   - Text-Based Linguistic Evaluation Percentage Changer per Job Role
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Trash2, Cpu, Volume2, Sliders, Plus, Check } from 'lucide-react';
import { getRoleWeights, saveRoleWeights, getAllRoleWeights } from '../../lib/roleWeights';

const AddCandidateModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    position: 'Software Engineer',
    keywords: [],
    notes: '',
    resume_url: null,
    resume_name: null,
    adminOnly: false,
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [customPositionName, setCustomPositionName] = useState('');

  // Role Weight Configuration state
  const initialWeights = getRoleWeights('Software Engineer');
  const [textWeight, setTextWeight] = useState(initialWeights.textWeight);
  const acousticWeight = 100 - textWeight;

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const rolesList = getAllRoleWeights().map(r => r.position);
    setAvailableRoles(rolesList);
  }, []);

  const keywordOptions = ['Java Developer', 'React', 'Node.js', 'Python', 'SQL', 'Machine Learning', 'AWS', 'Docker', 'System Design'];

  const handlePositionSelect = (pos) => {
    if (pos === '__ADD_NEW__') {
      setIsCustomPosition(true);
      setCustomPositionName('');
      setTextWeight(60);
    } else {
      setIsCustomPosition(false);
      setFormData(prev => ({ ...prev, position: pos }));
      const weights = getRoleWeights(pos);
      setTextWeight(weights.textWeight);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
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
        resume_name: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, resume_url: null, resume_name: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPosition = isCustomPosition ? customPositionName.trim() || 'Software Engineer' : formData.position;

    // Save configured Text-Based Linguistic Evaluation weight for this position
    saveRoleWeights(finalPosition, textWeight, acousticWeight);

    onSubmit({
      ...formData,
      position: finalPosition,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-white text-lg font-bold">Add Candidate</h2>
            <p className="text-gray-400 text-xs mt-0.5">Register candidate details, upload CV, and configure job role evaluation weights</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition cursor-pointer">
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
              placeholder="e.g. Kasun Fernando"
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
              placeholder="e.g. candidate@example.com"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition"
              required
            />
          </div>

          {/* Position & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Job Role / Position</label>
              <select
                value={isCustomPosition ? '__ADD_NEW__' : formData.position}
                onChange={(e) => handlePositionSelect(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer appearance-none"
              >
                {availableRoles.map(p => <option key={p} value={p}>{p}</option>)}
                <option value="__ADD_NEW__">+ Add Custom Job Role...</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Keyword Benchmark</label>
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.keywords.includes(e.target.value)) {
                    setFormData({ ...formData, keywords: [...formData.keywords, e.target.value] });
                  }
                  e.target.value = '';
                }}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer appearance-none"
              >
                <option value="">Add keyword...</option>
                {keywordOptions.filter(k => !formData.keywords.includes(k)).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* Custom Job Role Input (if selected) */}
          {isCustomPosition && (
            <div className="p-3.5 bg-[#252525] rounded-xl border border-[#a8b88c]/40 space-y-2">
              <label className="block text-white text-xs font-bold">New Custom Job Role Title</label>
              <input
                type="text"
                value={customPositionName}
                onChange={(e) => setCustomPositionName(e.target.value)}
                placeholder="e.g. Senior Backend Architect"
                className="w-full px-3.5 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#a8b88c]"
                required
              />
            </div>
          )}

          {/* Selected Keywords Badges */}
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#252525] rounded-lg border border-gray-800">
              {formData.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-[#3a3a3a] text-gray-300 text-xs rounded-md flex items-center gap-1.5">
                  {kw}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== kw) })}
                    className="text-gray-500 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TEXT-BASED LINGUISTIC EVALUATION PERCENTAGE CHANGER */}
          {/* ========================================================================= */}
          <div className="p-4 bg-[#252525] rounded-xl border border-gray-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#a8b88c]" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Text-Based Linguistic Evaluation Weight
                </span>
              </div>
              <span className="text-sm font-black text-[#a8b88c] font-mono">
                {textWeight}% Text &bull; {acousticWeight}% Acoustic
              </span>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              Configures how much weight the Whisper speech-to-text linguistic accuracy has versus acoustic demeanor for <span className="text-white font-semibold">{isCustomPosition ? (customPositionName || 'New Role') : formData.position}</span>.
            </p>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 text-gray-400">
                <span className="flex items-center gap-1 text-[#a8b88c] font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> Text Content: {textWeight}%
                </span>
                <span className="flex items-center gap-1 text-[#d4a843] font-semibold">
                  <Volume2 className="w-3.5 h-3.5" /> Acoustic Demeanor: {acousticWeight}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={textWeight}
                onChange={(e) => setTextWeight(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#a8b88c]"
              />
            </div>

            {/* Visual Two-Tone Progress Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-800">
              <div style={{ width: `${textWeight}%` }} className="bg-[#a8b88c] transition-all duration-300" />
              <div style={{ width: `${acousticWeight}%` }} className="bg-[#d4a843] transition-all duration-300" />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-500 font-medium">Presets:</span>
              <button
                type="button"
                onClick={() => setTextWeight(70)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer border ${
                  textWeight === 70
                    ? 'bg-[#a8b88c] text-gray-900 border-[#a8b88c]'
                    : 'bg-[#1e1e1e] text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                Tech / Engineering (70/30)
              </button>
              <button
                type="button"
                onClick={() => setTextWeight(50)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer border ${
                  textWeight === 50
                    ? 'bg-[#a8b88c] text-gray-900 border-[#a8b88c]'
                    : 'bg-[#1e1e1e] text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                Management (50/50)
              </button>
              <button
                type="button"
                onClick={() => setTextWeight(30)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer border ${
                  textWeight === 30
                    ? 'bg-[#a8b88c] text-gray-900 border-[#a8b88c]'
                    : 'bg-[#1e1e1e] text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                HR & Relations (30/70)
              </button>
            </div>
          </div>

          {/* Real Resume / CV File Upload */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Candidate Resume / CV File (.pdf, .docx, .txt)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt,.doc"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile && !formData.resume_name ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-700 hover:border-[#a8b88c] rounded-xl p-5 text-center transition cursor-pointer bg-[#2a2a2a]/40 group"
              >
                <Upload className="w-7 h-7 text-gray-500 group-hover:text-[#a8b88c] mx-auto mb-1.5 transition" />
                <p className="text-gray-300 text-xs font-semibold">
                  Click to select candidate CV or drag & drop file here
                </p>
                <p className="text-gray-500 text-[11px] mt-1">Supports PDF, DOCX, and TXT files</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-[#252525] border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#a8b88c]" />
                  <div>
                    <p className="text-white text-xs font-bold truncate max-w-xs">{formData.resume_name || selectedFile?.name}</p>
                    <p className="text-gray-500 text-[10px]">
                      {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB • Attached` : 'Resume attached'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition cursor-pointer"
                  title="Remove CV"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Candidate interview preparation notes or background details..."
              rows={2}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 justify-end border-t border-gray-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-400 hover:text-gray-200 text-sm font-medium transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#98a87c] transition shadow cursor-pointer">
              Add Candidate & Save Role Weights
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
