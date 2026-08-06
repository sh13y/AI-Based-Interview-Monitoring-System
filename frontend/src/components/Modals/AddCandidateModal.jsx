import React, { useState } from 'react';
import { X, Upload, CheckSquare } from 'lucide-react';

const AddCandidateModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    position: 'Software Engineer',
    keywords: [],
    notes: '',
    adminOnly: false,
  });

  const positions = ['Software Engineer', 'Marketing Manager', 'HR Coordinator', 'Data Analyst', 'Product Manager', 'AI Specialist', 'UX Designer', 'DevOps Engineer'];
  const keywordOptions = ['Java Developer', 'React', 'Node.js', 'Python', 'SQL', 'Machine Learning', 'AWS', 'Docker'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-white text-lg font-bold">Add Candidate</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter Full Name"
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition"
                required
              />
            </div>
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

          {/* Position & Keywords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Position Applying For</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer appearance-none"
              >
                {positions.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Keyword Benchmarks</label>
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.keywords.includes(e.target.value)) {
                    setFormData({ ...formData, keywords: [...formData.keywords, e.target.value] });
                  }
                }}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer appearance-none"
              >
                <option value="">Select...</option>
                {keywordOptions.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Resume Upload</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#a8b88c]/50 transition cursor-pointer bg-[#2a2a2a]/50">
              <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                Drag and drop file here, or click to upload PDF or DOCX
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes..."
              rows={3}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] transition resize-none"
            />
          </div>

          {/* Admin Only */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, adminOnly: !formData.adminOnly })}
              className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.adminOnly ? 'bg-[#a8b88c] border-[#a8b88c]' : 'border-gray-600 bg-transparent'}`}
            >
              {formData.adminOnly && <CheckSquare className="w-3.5 h-3.5 text-gray-900" />}
            </button>
            <div>
              <p className="text-gray-200 text-sm font-medium">System Admin Only</p>
              <p className="text-gray-500 text-xs">Restrict access to system administrators only.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-400 hover:text-gray-200 text-sm font-medium transition">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition">
              Add Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
