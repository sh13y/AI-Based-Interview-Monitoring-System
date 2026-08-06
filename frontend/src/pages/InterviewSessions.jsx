import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { dummyInterviewSessions, dummyCandidates } from '../lib/dummyData';

const InterviewSessions = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Interview Sessions</h1>
        <Link
          to="/interviews/ses-001"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#a8b88c] text-gray-900 rounded-lg text-sm font-semibold hover:bg-[#98a87c] transition"
        >
          <Play className="w-4 h-4 fill-current" /> Start New Live Session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dummyInterviewSessions.map((session) => {
          const candidate = dummyCandidates.find((c) => c.id === session.candidate_id);

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
    </div>
  );
};

export default InterviewSessions;
