// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Manage Job Role Weights Modal
// Allows evaluators to configure the Text-Based Linguistic Evaluation percentage
// and Acoustic Demeanor percentage per Job Role
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { X, Sliders, Cpu, Volume2, Plus, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { getAllRoleWeights, saveRoleWeights, resetRoleWeight } from '../../lib/roleWeights';
import toast from 'react-hot-toast';

const ManageRoleWeightsModal = ({ onClose, onSaved }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [textWeight, setTextWeight] = useState(70);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCategory, setNewRoleCategory] = useState('Engineering & Technology');
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const list = getAllRoleWeights();
    setRoles(list);
    if (list.length > 0 && !selectedRole) {
      setSelectedRole(list[0]);
      setTextWeight(list[0].textWeight);
    }
  };

  const handleSelectRole = (r) => {
    setSelectedRole(r);
    setTextWeight(r.textWeight);
    setIsAddingNew(false);
  };

  const handleSaveWeights = () => {
    if (isAddingNew) {
      if (!newRoleName.trim()) {
        toast.error('Please enter a job role name');
        return;
      }
      saveRoleWeights(newRoleName.trim(), textWeight, 100 - textWeight, newRoleCategory);
      toast.success(`Created job role "${newRoleName.trim()}" with ${textWeight}% Text / ${100 - textWeight}% Acoustic weighting!`);
      setNewRoleName('');
      setIsAddingNew(false);
    } else if (selectedRole) {
      saveRoleWeights(selectedRole.position, textWeight, 100 - textWeight, selectedRole.category);
      toast.success(`Updated "${selectedRole.position}" to ${textWeight}% Text / ${100 - textWeight}% Acoustic!`);
    }

    loadRoles();
    if (onSaved) onSaved();
  };

  const handleReset = (pos) => {
    resetRoleWeight(pos);
    toast.success(`Reset "${pos}" to default weighting.`);
    loadRoles();
    if (onSaved) onSaved();
  };

  const acousticWeight = 100 - textWeight;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-[#252525]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a8b88c]/20 border border-[#a8b88c]/40 rounded-xl text-[#a8b88c]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">Job Role Evaluation Weighting</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Configure Text-Based Linguistic Evaluation vs. Acoustic Demeanor percentages per Job Role
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Role List */}
          <div className="md:col-span-5 border-r border-gray-800 p-4 overflow-y-auto space-y-2 bg-[#1a1a1a]/50">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Roles</span>
              <button
                onClick={() => {
                  setIsAddingNew(true);
                  setSelectedRole(null);
                  setTextWeight(60);
                }}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition font-semibold ${
                  isAddingNew
                    ? 'bg-[#a8b88c] text-gray-900'
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            {roles.map((r) => {
              const isSelected = !isAddingNew && selectedRole?.position === r.position;
              return (
                <div
                  key={r.position}
                  onClick={() => handleSelectRole(r)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#252525] border-[#a8b88c] shadow'
                      : 'bg-[#222222] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{r.position}</span>
                    {r.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-400 text-[11px] truncate max-w-[130px]">{r.category}</span>
                    <span className="font-mono text-[11px] text-[#a8b88c] font-bold">
                      {r.textWeight}T / {r.acousticWeight}A
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Weight Adjuster */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-6">
            {isAddingNew ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
                  <Plus className="w-4 h-4 text-[#a8b88c]" />
                  <h3 className="text-white text-sm font-bold">Add New Job Role</h3>
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1.5">Job Role Title</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Lead QA Automation Engineer"
                    className="w-full px-3.5 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#a8b88c] transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1.5">Category</label>
                  <select
                    value={newRoleCategory}
                    onChange={(e) => setNewRoleCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
                  >
                    <option>Engineering & Technology</option>
                    <option>Data Science & Machine Learning</option>
                    <option>Product & Leadership</option>
                    <option>Human Resources & People Ops</option>
                    <option>Marketing & Brand Strategy</option>
                    <option>Sales & Client Relations</option>
                    <option>General Assessment Profile</option>
                  </select>
                </div>
              </div>
            ) : selectedRole ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                  <div>
                    <h3 className="text-white text-base font-bold">{selectedRole.position}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedRole.category}</p>
                  </div>
                  {selectedRole.isCustom && (
                    <button
                      onClick={() => handleReset(selectedRole.position)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition"
                      title="Reset to system defaults"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Default
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{selectedRole.focus}</p>
              </div>
            ) : null}

            {/* Weight Changer Controls */}
            <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Text-Based Linguistic Weight
                </span>
                <span className="text-lg font-black text-[#a8b88c] font-mono">{textWeight}%</span>
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={textWeight}
                  onChange={(e) => setTextWeight(Number(e.target.value))}
                  className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#a8b88c]"
                />
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>10% (Minimal Text)</span>
                  <span>50% (Equal)</span>
                  <span>90% (Linguistic Heavy)</span>
                </div>
              </div>

              {/* Split Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-800">
                <div style={{ width: `${textWeight}%` }} className="bg-[#a8b88c] transition-all duration-300" />
                <div style={{ width: `${acousticWeight}%` }} className="bg-[#d4a843] transition-all duration-300" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-[#a8b88c]" />
                    <span className="font-semibold">Text-Based Linguistic</span>
                  </div>
                  <span className="text-xl font-bold text-white">{textWeight}%</span>
                  <p className="text-[10px] text-gray-500 mt-1">Whisper speech accuracy & technical keywords</p>
                </div>

                <div className="p-3 bg-[#1e1e1e] rounded-lg border border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Volume2 className="w-3.5 h-3.5 text-[#d4a843]" />
                    <span className="font-semibold">Acoustic Demeanor</span>
                  </div>
                  <span className="text-xl font-bold text-white">{acousticWeight}%</span>
                  <p className="text-[10px] text-gray-500 mt-1">Confidence, attitude & honesty modulation</p>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2">
                <span className="text-[11px] text-gray-400 block mb-2 font-medium">Quick Role Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTextWeight(70)}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer border ${
                      textWeight === 70
                        ? 'bg-[#a8b88c] text-gray-900 border-[#a8b88c] font-bold'
                        : 'bg-[#1e1e1e] text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    Tech / Engineering (70% Text / 30% Acoustic)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextWeight(50)}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer border ${
                      textWeight === 50
                        ? 'bg-[#a8b88c] text-gray-900 border-[#a8b88c] font-bold'
                        : 'bg-[#1e1e1e] text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    Management (50% Text / 50% Acoustic)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextWeight(30)}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer border ${
                      textWeight === 30
                        ? 'bg-[#a8b88c] text-gray-900 border-[#a8b88c] font-bold'
                        : 'bg-[#1e1e1e] text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    HR & Relations (30% Text / 70% Acoustic)
                  </button>
                </div>
              </div>
            </div>

            {/* Formula Preview */}
            <div className="p-3 bg-[#1e1e1e] rounded-lg border border-gray-800 text-xs font-mono text-gray-300 flex items-center justify-between">
              <span className="text-gray-500">Evaluation Formula:</span>
              <span className="text-[#a8b88c]">({textWeight}% &times; Text Score)</span>
              <span>+</span>
              <span className="text-[#d4a843]">({acousticWeight}% &times; Acoustic Score)</span>
              <span>=</span>
              <span className="text-white font-bold">Composite Score</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#252525]">
          <span className="text-xs text-gray-400">
            Changes apply to all candidates evaluated under this position.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveWeights}
              className="flex items-center gap-2 px-5 py-2 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 rounded-lg text-sm font-bold transition shadow cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Weight Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRoleWeightsModal;
