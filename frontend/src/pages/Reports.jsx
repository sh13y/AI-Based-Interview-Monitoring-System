import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Search, Filter, Calendar, Award, Trophy,
  ChevronRight, BarChart3, TrendingUp, ShieldCheck
} from 'lucide-react';
import { dummyCandidates } from '../lib/dummyData';

const rankBadges = {
  1: 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold',
  2: 'bg-slate-300/20 text-slate-200 border border-slate-300/40 font-bold',
  3: 'bg-amber-600/20 text-amber-500 border border-amber-600/40 font-bold',
};

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All Sessions');

  const evaluatedCandidates = dummyCandidates
    .filter((c) => c.status === 'Evaluated')
    .sort((a, b) => b.score - a.score);

  const filteredCandidates = evaluatedCandidates.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
            <span>Executive Performance Reports</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
              Cohort Intelligence
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Comparative behavioral analytics, rank distribution, and official evaluation dossiers
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-200 text-xs font-semibold rounded-xl border border-white/10 transition shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Export Summary
        </button>
      </div>

      {/* Comparison Section */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-white text-base font-bold font-display">Integrity & Competency Leaderboard</h2>
              <p className="text-xs text-gray-400">Ranked by composite AI behavioral score across all verified interview stages</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 w-52 transition"
              />
            </div>

            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-3 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 transition cursor-pointer"
            >
              <option>All Interview Cohorts</option>
              <option>Senior Engineering Track</option>
              <option>Product & Systems Round</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#0A0E16]/60 text-left text-xs font-mono uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Candidate Identity</th>
                <th className="py-3.5 px-4">Composite Score</th>
                <th className="py-3.5 px-4">Status & Integrity</th>
                <th className="py-3.5 px-5 text-right">Evaluation Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCandidates.map((c, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={c.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-4 text-center">
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-mono ${
                          rankBadges[rank] || 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                      >
                        {rank}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-surface border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 font-display">
                          {c.full_name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold group-hover:text-emerald-300 transition-colors">
                            {c.full_name}
                          </p>
                          <p className="text-gray-400 text-xs font-mono">{c.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <span className="text-emerald-400 font-mono font-bold text-sm min-w-[40px]">
                          {c.score}%
                        </span>
                        <div className="flex-1 h-2 bg-[#0A0E16] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${c.score}%` }}
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified High
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/reports/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
