// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Interview Sessions
// Implements:
//   [FR-18: SESSION HISTORY (Search, Filter by Status, Detailed Session Inspection)]
//   [FR-06: INITIATE NEW LIVE MONITORING SESSION]
// ==============================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play, Eye, Clock, CheckCircle2, AlertCircle, X, Video, Search, Filter,
  Activity, Shield, Mic, UserCheck, Sparkles, ChevronRight
} from 'lucide-react';
import { dummyInterviewSessions, dummyCandidates } from '../lib/dummyData';

const statusBadges = {
  'Completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'In Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Pending Review': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const InterviewSessions = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(dummyCandidates[0]?.id || 'cand-001');
  const [selectedRound, setSelectedRound] = useState('Round 1');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleStartSession = (e) => {
    e.preventDefault();
    setShowModal(false);
    navigate(`/interviews/live?candidateId=${selectedCandidateId}&round=${encodeURIComponent(selectedRound)}`);
  };

  const filteredSessions = dummyInterviewSessions.filter((session) => {
    const matchSearch =
      searchQuery === '' ||
      session.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.evaluator_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || session.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
            <span>Interview Monitoring Sessions</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
              {dummyInterviewSessions.length} Total
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Real-time proctored sessions, biometric logs, acoustic noise floors, and verbatim transcripts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Start Live Monitoring
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate, session ID, position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
          >
            <option value="All">All Session Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
          </select>
          <span className="text-gray-500 font-mono text-xs">
            {filteredSessions.length} sessions
          </span>
        </div>
      </div>

      {/* Grid of Interview Sessions */}
      {filteredSessions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 border border-white/10 text-center">
          <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-300 text-sm font-medium">No sessions found matching your query.</p>
          <p className="text-gray-500 text-xs mt-1">Try refining your search keyword or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const minutes = Math.floor(session.duration_seconds / 60);
            const seconds = session.duration_seconds % 60;
            return (
              <div
                key={session.id}
                className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-200 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Status & Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${
                        statusBadges[session.status] || statusBadges['Pending Review']
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-gray-400 font-mono text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {minutes}m {seconds}s
                    </span>
                  </div>

                  {/* Candidate Profile Header */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-surface border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-display shadow-md">
                      {session.candidate_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-bold group-hover:text-emerald-300 transition-colors">
                        {session.candidate_name}
                      </h3>
                      <p className="text-gray-400 text-xs">{session.position}</p>
                    </div>
                  </div>

                  {/* Telemetry Metrics Card */}
                  <div className="bg-[#0A0E16]/80 rounded-xl p-3.5 border border-white/5 space-y-2 text-xs font-mono text-gray-400 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Evaluator:</span>
                      <span className="text-gray-200 font-medium">{session.evaluator_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Response Rate:</span>
                      <span className="text-emerald-400 font-semibold">
                        {session.questions_answered} / {session.questions_total} answered
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Acoustic Noise:</span>
                      <span className="text-gray-200 font-medium">{session.noise_level_db || 34} dB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Session ID:</span>
                      <span className="text-gray-500 text-[10px]">{session.id}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono">
                  <span className="text-gray-500">
                    {new Date(session.session_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <Link
                    to={`/interviews/${session.id}`}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold group/link"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Live Session Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-panel rounded-2xl border border-white/10 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-emerald-400" />
                <h2 className="text-white text-base font-bold font-display">Initialize Live Proctor Session</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider mb-2">
                  Select Target Candidate
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0E16] border border-white/10 rounded-xl text-gray-200 text-xs focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
                >
                  {dummyCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} — {c.position} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-mono uppercase tracking-wider mb-2">
                  Interview Stage / Round
                </label>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0E16] border border-white/10 rounded-xl text-gray-200 text-xs focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
                >
                  <option value="Round 1">Round 1 (Initial Screening)</option>
                  <option value="Round 2">Round 2 (Technical & Behavioral Deep-Dive)</option>
                  <option value="Final Round">Final Round (Executive Architecture Review)</option>
                </select>
              </div>

              <div className="p-4 bg-[#0A0E16]/80 rounded-xl border border-white/5 text-xs text-gray-400 space-y-1.5 font-mono">
                <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Live Proctor Readiness:
                </p>
                <p className="text-[11px]">• Real-time microphone & audio visualizer active</p>
                <p className="text-[11px]">• Whisper speech-to-text token stream</p>
                <p className="text-[11px]">• Continuous behavioral AI inference</p>
              </div>

              <div className="flex items-center gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-gray-400 hover:text-white text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Launch Live Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSessions;
