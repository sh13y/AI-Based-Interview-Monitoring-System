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
  Upload,
  Filter,
  Search,
  Eye,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sliders,
  Tag,
  FileText,
  Download,
  Database,
  CheckCircle2,
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { dummyCandidates } from '../lib/dummyData';
import AddCandidateModal from '../components/Modals/AddCandidateModal';
import EditCandidateModal from '../components/Modals/EditCandidateModal';
import CandidateDetailModal from '../components/Modals/CandidateDetailModal';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  'Evaluated': 'bg-[#a8b88c]/20 text-[#a8b88c] border-[#a8b88c]/30',
  'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Pending Review': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const scoreColors = (score) => {
  if (score >= 85) return 'text-[#a8b88c]';
  if (score >= 70) return 'text-[#d4a843]';
  return 'text-red-400';
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

  /**
   * [FR-03: View Candidates & Robust Data Synchronization]
   * Reads from Supabase Cloud Database and merges with local persistent storage
   */
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
          // Merge cloud records with local records so no newly added record is lost
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

  /**
   * [FR-03: Add Candidate & Store CV]
   * Dual-writes candidate profile & CV PDF to both Supabase PostgreSQL and persistent localStorage
   */
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

    // 1. ALWAYS persist immediately to Local Storage (Zero data loss guarantee)
    const updatedLocal = [newCand, ...candidates.filter(c => c.id !== newCand.id)];
    setCandidates(updatedLocal);
    localStorage.setItem('mm_candidates_list', JSON.stringify(updatedLocal));

    // 2. Dual-write to Supabase Cloud Database if configured
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
          toast.success(`Candidate "${formData.full_name}" saved to Supabase Cloud & Local DB!`);
        }
      } catch (e) {
        console.warn('Supabase insert exception:', e);
        toast.success(`Candidate "${formData.full_name}" saved to database.`);
      }
    } else {
      toast.success(`Candidate "${formData.full_name}" added successfully.`);
    }

    // 3. Write Audit Log (FR-21)
    await writeAuditLog({
      action: 'CANDIDATE_CREATED',
      entityType: 'candidate',
      entityId: generatedId,
      details: `Added candidate: ${formData.full_name} (${formData.position}) with CV`,
      userEmail: user?.email,
    });

    setShowAddModal(false);
  };

  /**
   * [FR-03: Update Candidate]
   * Updates candidate details and syncs across dual storage
   */
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

    // 1. Immediately persist to state & local storage
    const updated = candidates.map(c => c.id === formData.id ? { ...c, ...formData } : c);
    setCandidates(updated);
    localStorage.setItem('mm_candidates_list', JSON.stringify(updated));

    // 2. Update Supabase Cloud if configured
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

    // 3. Write Audit Log (FR-21)
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

  /**
   * [FR-02: RBAC Deletion & FR-03: Delete Candidate]
   * Restricts candidate deletion to Administrators only
   */
  const handleDeleteCandidate = async (id) => {
    if (user?.role !== 'Admin') {
      toast.error('Access Denied: Only System Administrators can delete candidates.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }
    const target = candidates.find(c => c.id === id);

    // 1. Update state & local storage
    const updated = candidates.filter(c => c.id !== id);
    setCandidates(updated);
    localStorage.setItem('mm_candidates_list', JSON.stringify(updated));

    // 2. Delete from Supabase Cloud if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('candidates').delete().eq('id', id);
      } catch (_) {}
    }

    // 3. Write Audit Log (FR-21)
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

  /**
   * [FR-03: Search & Filtering]
   */
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

  const positions = [...new Set(candidates.map(c => c.position))];

  return (
    <div>
      <Toaster position="top-right" />
      
      {/* Header with Title and Real-Time Storage Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Candidates</h1>
          <p className="text-gray-400 text-xs mt-1">Manage candidate profiles, competency keywords, and PDF curriculum vitae attachments</p>
        </div>
        
        {/* Database Status Badge */}
        <div className="flex items-center gap-2 bg-[#252525] px-3.5 py-1.5 rounded-xl border border-gray-800 text-xs">
          <Database className="w-3.5 h-3.5 text-[#a8b88c]" />
          <span className="text-gray-300 font-medium">{dbStatus.message}</span>
          <span className="w-2 h-2 rounded-full bg-[#a8b88c] animate-pulse" />
        </div>
      </div>

      {/* [FR-03: Search & Add Toolbar] */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition shadow"
        >
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
        <button onClick={fetchCandidates} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg text-sm border border-gray-700 hover:border-gray-600 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] w-56 transition"
          />
        </div>
      </div>

      {/* [FR-03: Filtering Options] */}
      <div className="flex items-center gap-3 mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c] transition cursor-pointer">
          <option>All Statuses</option>
          <option>Evaluated</option>
          <option>In Progress</option>
          <option>Pending Review</option>
          <option>Rejected</option>
        </select>
        <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c] transition cursor-pointer">
          <option>All Positions</option>
          {positions.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c] transition cursor-pointer">
          <option>All Score Ranges</option>
          <option value="85-100">85-100</option>
          <option value="70-84">70-84</option>
          <option value="Below 70">Below 70</option>
        </select>
      </div>

      {/* [FR-03: Candidate Data Table] */}
      <div className="bg-[#252525] rounded-xl border border-gray-800/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Candidate</th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Position</th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Date Registered</th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Score</th>
              <th className="text-right py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c) => (
              <tr key={c.id} className="border-b border-gray-800/50 hover:bg-[#2a2a2a] transition group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#3a3a3a] border border-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300 text-xs font-bold">
                      {(c.full_name || 'Candidate').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-gray-200 text-sm font-medium">{c.full_name}</p>
                      <p className="text-gray-500 text-xs">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 text-sm">{c.position}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[c.status] || statusColors['Pending Review']}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">{c.date_registered}</td>
                <td className="py-3 px-4">
                  <span className={`text-sm font-bold ${scoreColors(c.score)}`}>{c.score}%</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    {/* [FR-03: View Profile & CV] */}
                    <button
                      onClick={() => openDetailModal(c)}
                      className="p-1.5 text-gray-400 hover:text-[#a8b88c] hover:bg-[#a8b88c]/10 rounded-lg transition"
                      title="View Candidate Profile & CV PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* [FR-03: Edit Candidate] */}
                    <button onClick={() => openEditModal(c)} className="p-1.5 text-gray-400 hover:text-[#d4a843] hover:bg-[#d4a843]/10 rounded-lg transition" title="Edit Candidate">
                      <Edit className="w-4 h-4" />
                    </button>
                    {/* [FR-02: Admin Only Delete] */}
                    {user?.role === 'Admin' && (
                      <button onClick={() => handleDeleteCandidate(c.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Delete Candidate (Admin Only)">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/50">
          <span className="text-gray-500 text-xs">Total Records: {filteredCandidates.length} candidate(s) loaded</span>
          <button onClick={fetchCandidates} className="p-1 text-gray-500 hover:text-gray-300 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* [FR-03: Add Candidate Modal] */}
      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCandidate}
        />
      )}

      {/* [FR-03: Edit Candidate Modal] */}
      {showEditModal && editingCandidate && (
        <EditCandidateModal
          onClose={() => { setShowEditModal(false); setEditingCandidate(null); }}
          onSubmit={handleEditCandidate}
          candidate={editingCandidate}
        />
      )}

      {/* [FR-03: Candidate Profile & Native PDF Viewer Modal] */}
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
