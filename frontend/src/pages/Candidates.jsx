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
} from 'lucide-react';
import { dummyCandidates } from '../lib/dummyData';
import AddCandidateModal from '../components/Modals/AddCandidateModal';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
  const [candidates, setCandidates] = useState(dummyCandidates);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [scoreFilter, setScoreFilter] = useState('All Score Ranges');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setCandidates(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Supabase fetch failed, fallback to dummy data:', e);
      }
    }
    setCandidates(dummyCandidates);
    setLoading(false);
  };

  const handleAddCandidate = async (formData) => {
    const newCand = {
      full_name: formData.full_name,
      email: formData.email,
      position: formData.position,
      keywords: formData.keywords || [],
      notes: formData.notes || '',
      status: 'Pending Review',
      date_registered: new Date().toISOString().split('T')[0],
      score: 0,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('candidates').insert([newCand]).select('*');
        if (!error && data) {
          setCandidates(prev => [data[0], ...prev]);
          await writeAuditLog({
            action: 'CANDIDATE_CREATED',
            entityType: 'candidate',
            entityId: data[0].id,
            details: `Added candidate: ${formData.full_name} (${formData.position})`,
            userEmail: user?.email,
          });
          setShowAddModal(false);
          return;
        }
      } catch (e) {
        console.error('Error inserting candidate:', e);
      }
    }

    const localCandidate = { id: `cand-${Date.now()}`, ...newCand };
    setCandidates(prev => [localCandidate, ...prev]);
    await writeAuditLog({
      action: 'CANDIDATE_CREATED',
      entityType: 'candidate',
      entityId: localCandidate.id,
      details: `Added candidate: ${formData.full_name} (${formData.position})`,
      userEmail: user?.email,
    });
    setShowAddModal(false);
  };

  const handleDeleteCandidate = async (id) => {
    const target = candidates.find(c => c.id === id);
    if (isSupabaseConfigured()) {
      await supabase.from('candidates').delete().eq('id', id);
    }
    setCandidates(prev => prev.filter(c => c.id !== id));
    await writeAuditLog({
      action: 'CANDIDATE_DELETED',
      entityType: 'candidate',
      entityId: id,
      details: `Deleted candidate: ${target?.full_name || id}`,
      userEmail: user?.email,
    });
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

  const positions = [...new Set(candidates.map(c => c.position))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Candidates</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition"
        >
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg text-sm font-medium border border-gray-700 hover:border-gray-600 transition">
          <Upload className="w-4 h-4" /> Bulk Import
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg text-sm font-medium border border-gray-700 hover:border-gray-600 transition">
          <Tag className="w-4 h-4" /> Keyword Benchmark
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg text-sm font-medium border border-gray-700 hover:border-gray-600 transition">
          <Sliders className="w-4 h-4" /> Weight Configuration
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

      {/* Filters */}
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
        <button onClick={fetchCandidates} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg text-sm border border-gray-700 hover:border-gray-600 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Table */}
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
                    <div className="w-9 h-9 rounded-full bg-[#3a3a3a] border border-gray-700 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-bold">
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
                  <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition">
                    <Link to={`/reports/${c.id}`} className="p-1.5 text-gray-400 hover:text-[#a8b88c] hover:bg-[#a8b88c]/10 rounded-lg transition">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDeleteCandidate(c.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/50">
          <span className="text-gray-500 text-xs">Rows: 1 - {filteredCandidates.length} of {candidates.length}</span>
          <button onClick={fetchCandidates} className="p-1 text-gray-500 hover:text-gray-300 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCandidate}
        />
      )}
    </div>
  );
};

export default Candidates;
