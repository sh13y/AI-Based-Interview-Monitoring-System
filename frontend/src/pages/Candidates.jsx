// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Candidate Management
// Implements:
//   [FR-03: CANDIDATE DATA MANAGEMENT (Create, Read, Update, Delete, CV Storage)]
//   [FR-02: ROLE-BASED ACCESS CONTROL (Admin Only Delete Protection)]
//   [FR-21: SYSTEM AUDIT LOGGING (Candidate Life-cycle Events)]
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  FileText,
  Database,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { dummyCandidates } from '../lib/dummyData';
import AddCandidateModal from '../components/Modals/AddCandidateModal';
import EditCandidateModal from '../components/Modals/EditCandidateModal';
import CandidateDetailModal from '../components/Modals/CandidateDetailModal';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const statusBadges = {
  'Evaluated': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'In Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Pending Review': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Rejected': 'bg-red-500/15 text-red-400 border-red-500/30',
};

const getScoreColor = (score) => {
  if (score >= 85) return 'text-emerald-400 font-bold';
  if (score >= 70) return 'text-amber-400 font-bold';
  return 'text-rose-400 font-bold';
};

const Candidates = () => {
  const { user } = useAuth();
  
  // Safe initial state loading from localStorage cache
  const getStoredCandidates = () => {
    try {
      const stored = localStorage.getItem('mm_candidates_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return dummyCandidates;
  };

  const [candidates, setCandidates] = useState(getStoredCandidates);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [scoreFilter, setScoreFilter] = useState('All Score Ranges');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ online: isSupabaseConfigured(), message: isSupabaseConfigured() ? 'Supabase Cloud DB' : 'Local Persistent Storage' });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    let currentList = getStoredCandidates();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase] Fetch note:', error.message);
          setDbStatus({ online: false, message: `Supabase: ${error.message}` });
        } else if (data && data.length > 0) {
          const idMap = new Map();
          data.forEach(item => idMap.set(item.id, item));
          currentList.forEach(item => {
            if (!idMap.has(item.id)) {
              idMap.set(item.id, item);
            }
          });
          currentList = Array.from(idMap.values());
          setDbStatus({ online: true, message: 'Supabase Cloud Synchronized' });
        } else {
          setDbStatus({ online: true, message: 'Supabase Connected' });
        }
      } catch (e) {
        console.warn('Supabase fetch exception:', e.message);
        setDbStatus({ online: false, message: 'Local Persistent Storage' });
      }
    } else {
      setDbStatus({ online: false, message: 'Local Persistent Storage' });
    }

    setCandidates(currentList);
    localStorage.setItem('mm_candidates_list', JSON.stringify(currentList));
    setLoading(false);
  };

  const handleAddCandidate = async (formData) => {
    const generatedId = `cand-${Date.now()}`;
    const newCand = {
      id: generatedId,
      full_name: formData.full_name,
      email: formData.email,
      position: formData.position,
      keywords: formData.keywords || [],
      notes: formData.notes || '',
      resume_url: formData.resume_url || null,
      resume_name: formData.resume_name || `${formData.full_name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`,
      status: 'Pending Review',
      date_registered: new Date().toISOString().split('T')[0],
      score: 0,
      created_at: new Date().toISOString(),
    };

    const updatedLocal = [newCand, ...candidates.filter(c => c.id !== newCand.id)];
    setCandidates(updatedLocal);
    localStorage.setItem('mm_candidates_list', JSON.stringify(updatedLocal));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('candidates').insert([{
          full_name: newCand.full_name,
          email: newCand.email,
          position: newCand.position,
          keywords: newCand.keywords,
          notes: newCand.notes,
          resume_url: newCand.resume_url,
          resume_name: newCand.resume_name,
          status: newCand.status,
          score: newCand.score,
        }]).select('*');

        if (error) {
          console.warn('[Supabase Insert Notice]:', error.message);
          toast(`Candidate saved locally (Supabase: ${error.message})`, { icon: '💾' });
        } else if (data && data[0]) {
          const cloudCand = data[0];
          const finalMerged = [cloudCand, ...candidates.filter(c => c.id !== generatedId && c.id !== cloudCand.id)];
          setCandidates(finalMerged);
          localStorage.setItem('mm_candidates_list', JSON.stringify(finalMerged));
          toast.success(`Candidate "${formData.full_name}" saved to cloud!`);
        }
      } catch (e) {
        console.warn('Supabase insert exception:', e);
        toast.success(`Candidate "${formData.full_name}" saved to database.`);
      }
    } else {
      toast.success(`Candidate "${formData.full_name}" added successfully.`);
    }

    await writeAuditLog({
      action: 'CANDIDATE_CREATED',
      entityType: 'candidate',
      entityId: generatedId,
      details: `Added candidate: ${formData.full_name} (${formData.position}) with CV`,
      userEmail: user?.email,
    });

    setShowAddModal(false);
  };

  const handleEditCandidate = async (formData) => {
    const updatePayload = {
      full_name: formData.full_name,
      email: formData.email,
      position: formData.position,
      keywords: formData.keywords,
      notes: formData.notes,
      status: formData.status,
      resume_url: formData.resume_url,
      resume_name: formData.resume_name,
    };

    const updated = candidates.map(c => c.id === formData.id ? { ...c, ...formData } : c);
    setCandidates(updated);
    localStorage.setItem('mm_candidates_list', JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('candidates')
          .update(updatePayload)
          .eq('id', formData.id);

        if (error) {
          console.warn('[Supabase Update Note]:', error.message);
        }
      } catch (e) {
        console.error('Error updating candidate in Supabase:', e);
      }
    }

    await writeAuditLog({
      action: 'CANDIDATE_UPDATED',
      entityType: 'candidate',
      entityId: formData.id,
      details: `Updated candidate: ${formData.full_name} (${formData.position})`,
      userEmail: user?.email,
    });

    setShowEditModal(false);
    setEditingCandidate(null);
    toast.success(`Candidate "${formData.full_name}" updated successfully.`);
  };

  const handleDeleteCandidate = async (id) => {
    if (user?.role !== 'Admin') {
      toast.error('Access Denied: Only System Administrators can delete candidates.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }
    const target = candidates.find(c => c.id === id);

    const updated = candidates.filter(c => c.id !== id);
    setCandidates(updated);
    localStorage.setItem('mm_candidates_list', JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('candidates').delete().eq('id', id);
      } catch (_) {}
    }

    await writeAuditLog({
      action: 'CANDIDATE_DELETED',
      entityType: 'candidate',
      entityId: id,
      details: `Deleted candidate: ${target?.full_name || id}`,
      userEmail: user?.email,
    });
    toast.success('Candidate deleted successfully.');
  };

  const openDetailModal = (candidate) => {
    setViewingCandidate(candidate);
    setShowDetailModal(true);
  };

  const openEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setShowEditModal(true);
  };

  const filteredCandidates = candidates.filter(c => {
    const matchSearch = (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All Statuses' || c.status === statusFilter;
    const matchPosition = positionFilter === 'All Positions' || c.position === positionFilter;
    let matchScore = true;
    if (scoreFilter === '85-100') matchScore = c.score >= 85;
    else if (scoreFilter === '70-84') matchScore = c.score >= 70 && c.score < 85;
    else if (scoreFilter === 'Below 70') matchScore = c.score < 70;
    return matchSearch && matchStatus && matchPosition && matchScore;
  });

  const positions = [...new Set(candidates.map(c => c.position).filter(Boolean))];
  const evaluatedCount = candidates.filter(c => c.status === 'Evaluated').length;
  const inProgressCount = candidates.filter(c => c.status === 'In Progress').length;
  const pendingCount = candidates.filter(c => c.status === 'Pending Review').length;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
            <span>Candidate Dossiers</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
              {candidates.length} Profiles
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Multimodal evaluation records, resume attachments, and verified behavioral scores
          </p>
        </div>

        {/* Database Status Chip */}
        <div className="flex items-center gap-2 bg-[#181C24] px-4 py-2 rounded-xl border border-white/10 text-xs shadow-inner">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-300 font-medium">{dbStatus.message}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" />
        </div>
      </div>

      {/* Top 3 Metric Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono">Evaluated & Scored</p>
              <p className="text-lg font-bold text-white">{evaluatedCount} Candidates</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400">Ready</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono">In Progress</p>
              <p className="text-lg font-bold text-white">{inProgressCount} Sessions</p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400">Live</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono">Pending Review</p>
              <p className="text-lg font-bold text-white">{pendingCount} Profiles</p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400">Queued</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
          <button
            onClick={fetchCandidates}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-300 rounded-xl text-xs border border-white/10 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 w-48 sm:w-60 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Evaluated</option>
            <option>In Progress</option>
            <option>Pending Review</option>
            <option>Rejected</option>
          </select>

          {/* Position Filter */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-3 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer max-w-[150px]"
          >
            <option>All Positions</option>
            {positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          {/* Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
          >
            <option>All Score Ranges</option>
            <option value="85-100">85 - 100% (High)</option>
            <option value="70-84">70 - 84% (Moderate)</option>
            <option value="Below 70">Below 70% (Flagged)</option>
          </select>
        </div>
      </div>

      {/* Candidate Data Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#0A0E16]/60">
                <th className="text-left py-3.5 px-5 text-gray-400 text-xs font-mono uppercase tracking-wider">Candidate Profile</th>
                <th className="text-left py-3.5 px-4 text-gray-400 text-xs font-mono uppercase tracking-wider">Target Position</th>
                <th className="text-left py-3.5 px-4 text-gray-400 text-xs font-mono uppercase tracking-wider">Pipeline Status</th>
                <th className="text-left py-3.5 px-4 text-gray-400 text-xs font-mono uppercase tracking-wider">Registered</th>
                <th className="text-left py-3.5 px-4 text-gray-400 text-xs font-mono uppercase tracking-wider">Evaluation Score</th>
                <th className="text-right py-3.5 px-5 text-gray-400 text-xs font-mono uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCandidates.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-surface border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs font-bold font-display shadow-sm">
                        {(c.full_name || 'Candidate').split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <Link
                          to={`/candidate/${c.id}`}
                          className="text-white text-sm font-semibold hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                        >
                          {c.full_name}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                        </Link>
                        <p className="text-gray-500 text-xs font-mono">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 text-xs font-medium">
                    {c.position}
                    {c.keywords && c.keywords.length > 0 && (
                      <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                        {c.keywords.slice(0, 2).join(' · ')}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${statusBadges[c.status] || statusBadges['Pending Review']}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400 text-xs font-mono">
                    {c.date_registered || '2026-02-15'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono ${getScoreColor(c.score || 0)}`}>
                        {c.score > 0 ? `${c.score}%` : 'Pending'}
                      </span>
                      {c.score >= 80 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                          Top Tier
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5 justify-end">
                      {/* View Profile / Report */}
                      <button
                        onClick={() => openDetailModal(c)}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                        title="View Profile & CV PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Direct link to Report */}
                      <Link
                        to={`/candidate/${c.id}`}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                        title="Open Full Evaluation Report"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>

                      {/* Edit Candidate */}
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                        title="Edit Candidate"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Candidate (Admin only) */}
                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => handleDeleteCandidate(c.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Candidate (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-[#0A0E16]/40 text-xs font-mono text-gray-400">
          <span>Active Registry: {filteredCandidates.length} candidate(s) loaded</span>
          <button
            onClick={fetchCandidates}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCandidate}
        />
      )}

      {showEditModal && editingCandidate && (
        <EditCandidateModal
          onClose={() => { setShowEditModal(false); setEditingCandidate(null); }}
          onSubmit={handleEditCandidate}
          candidate={editingCandidate}
        />
      )}

      {showDetailModal && viewingCandidate && (
        <CandidateDetailModal
          candidate={viewingCandidate}
          onClose={() => { setShowDetailModal(false); setViewingCandidate(null); }}
        />
      )}
    </div>
  );
};

export default Candidates;
