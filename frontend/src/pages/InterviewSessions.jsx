import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Eye, Clock, CheckCircle2, AlertCircle, X, UserCheck, Video } from 'lucide-react';
import { dummyInterviewSessions, dummyCandidates } from '../lib/dummyData';

const InterviewSessions = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(dummyCandidates[0]?.id || 'cand-001');
  const [selectedRound, setSelectedRound] = useState('Round 1');

  const handleStartSession = (e) => {
    e.preventDefault();
    setShowModal(false);
    navigate(`/interviews/live?candidateId=${selectedCandidateId}&round=${encodeURIComponent(selectedRound)}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Interview Sessions</h1>
          <p className="text-gray-400 text-xs">Manage active and past candidate monitoring sessions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" /> Start New Live Session
        </button>
      </div>

      {/* Grid of Interview Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dummyInterviewSessions.map((session) => {
          return (
            <div
              key={session.id}
              className="bg-[#252525] rounded-xl p-5 border border-gray-800/50 hover:border-gray-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      session.status === 'Completed'
                        ? 'bg-[#a8b88c]/20 text-[#a8b88c] border-[#a8b88c]/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}
                  >
                    {session.status}
                  </span>
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#3a3a3a] border border-gray-700 flex items-center justify-center text-gray-300 font-bold text-sm">
                    {session.candidate_name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-gray-200 text-sm font-semibold">{session.candidate_name}</p>
                    <p className="text-gray-500 text-xs">{session.position}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-400 mb-5 bg-[#1e1e1e] p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between">
                    <span>Evaluator:</span>
                    <span className="text-gray-300">{session.evaluator_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="text-gray-300">
                      {session.questions_answered} out of {session.questions_total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Noise Level:</span>
                    <span className="text-gray-300">{session.noise_level_db} dB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <span className="text-xs text-gray-500">
                  {new Date(session.session_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <Link
                  to={`/interviews/${session.id}`}
                  className="flex items-center gap-1.5 text-xs text-[#a8b88c] hover:underline font-medium"
                >
                  <Eye className="w-4 h-4" /> View Session
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start New Live Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-[#a8b88c]" />
                <h2 className="text-white text-base font-bold">Start Live Interview Session</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Select Candidate
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
                >
                  {dummyCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.position}) - Status: {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Interview Round
                </label>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#a8b88c] transition cursor-pointer"
                >
                  <option value="Round 1">Round 1 (Initial Screening)</option>
                  <option value="Round 2">Round 2 (Technical & Behavioral)</option>
                  <option value="Final Round">Final Round (Management Review)</option>
                </select>
              </div>

              <div className="p-3.5 bg-[#252525] rounded-xl border border-gray-800 text-xs text-gray-400 space-y-1">
                <p className="font-semibold text-gray-300">Live Recording Setup:</p>
                <p>• Web Audio API real-time microphone capture</p>
                <p>• 60 dB environmental noise threshold validation</p>
                <p>• 5-second automatic session checkpoint recovery</p>
              </div>

              <div className="flex items-center gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-400 hover:text-gray-200 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#a8b88c] text-gray-900 font-bold text-xs rounded-lg hover:bg-[#98a87c] transition shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Live Recording
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
