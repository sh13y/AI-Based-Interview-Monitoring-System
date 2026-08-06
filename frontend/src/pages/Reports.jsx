import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Filter, Calendar, Award } from 'lucide-react';
import { dummyCandidates, dummyBehavioralScores } from '../lib/dummyData';

const rankColors = {
  1: 'bg-[#d4a843] text-gray-900 font-bold',
  2: 'bg-gray-400 text-gray-900 font-bold',
  3: 'bg-amber-700 text-white font-bold',
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Evaluation Reports</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg text-sm border border-gray-700 hover:border-gray-600 transition">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Comparison Table Section */}
      <div className="bg-[#252525] rounded-xl border border-gray-800/50 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-white text-lg font-bold">Comparison Table</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] w-52 transition"
              />
            </div>

            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-3 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none cursor-pointer"
            >
              <option>Interview session Name</option>
              <option>Software Engineer Round 1</option>
              <option>Marketing Manager Round 1</option>
            </select>

            <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>2026-02-19</span>
            </div>

            <button className="px-4 py-2 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-semibold text-sm rounded-lg transition">
              Apply
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Overall Score</th>
                <th className="py-3 px-4 text-right">View Full Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredCandidates.map((c, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={c.id} className="hover:bg-[#2a2a2a]/50 transition">
                    <td className="py-4 px-4">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          rankColors[rank] || 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {rank}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#3a3a3a] border border-gray-700 flex items-center justify-center font-bold text-xs text-gray-300">
                          {c.full_name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-gray-200 text-sm font-semibold">{c.full_name}</p>
                          <p className="text-gray-500 text-xs">{c.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4 max-w-xs">
                        <span className="text-white font-bold text-sm min-w-[40px]">{c.score}%</span>
                        <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${c.score}%` }}
                            className="h-full bg-[#a8b88c] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/reports/${c.id}`}
                        className="px-4 py-2 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-semibold text-xs rounded-lg transition inline-block"
                      >
                        View Full Report
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
