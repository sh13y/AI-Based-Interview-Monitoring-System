// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Evaluation Reports Overview
// Implements:
//   [FR-10: REPORT VIEW (Cross-Candidate Comparison Table & Real Supabase Sync)]
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Filter, Calendar, Award, Database, RefreshCw } from 'lucide-react';
import { dummyCandidates } from '../lib/dummyData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const rankColors = {
  1: 'bg-[#d4a843] text-gray-900 font-bold',
  2: 'bg-gray-400 text-gray-900 font-bold',
  3: 'bg-amber-700 text-white font-bold',
};

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All Sessions');
  const [loading, setLoading] = useState(true);

  // Load candidates from cache or fallback
  const [candidatesList, setCandidatesList] = useState(() => {
    try {
      const stored = localStorage.getItem('mm_candidates_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return dummyCandidates;
  });

  // Fetch real candidates from Supabase
  useEffect(() => {
    let isMounted = true;

    const loadCandidates = async () => {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .order('score', { ascending: false });

          if (!error && data && data.length > 0 && isMounted) {
            setCandidatesList(data);
            localStorage.setItem('mm_candidates_list', JSON.stringify(data));
          }
        } catch (err) {
          console.warn('[Reports] Supabase load error:', err);
        }
      }
      if (isMounted) setLoading(false);
    };

    loadCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  const evaluatedCandidates = candidatesList
    .filter((c) => c.status === 'Evaluated' || (c.score && c.score > 0))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const filteredCandidates = evaluatedCandidates.filter((c) =>
    (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluation Reports</h1>
          <p className="text-xs text-gray-400 mt-1">Cross-candidate rankings and multi-modal behavioral dossiers</p>
        </div>
        <div className="flex items-center gap-2">
          {isSupabaseConfigured() && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Database Live
            </span>
          )}
        </div>
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
              <option>All Positions</option>
              <option>Software Engineer</option>
              <option>Product Manager</option>
              <option>AI Specialist</option>
              <option>Cloud Architect</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs font-semibold uppercase">
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Performance Score</th>
                <th className="py-3 px-4 text-right">Action</th>
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
                          {c.full_name?.split(' ').map((n) => n[0]).join('') || 'C'}
                        </div>
                        <div>
                          <p className="text-gray-200 text-sm font-semibold">{c.full_name}</p>
                          <p className="text-gray-500 text-xs">{c.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4 max-w-xs">
                        <span className="text-white font-bold text-sm min-w-[40px]">{c.score || 85}%</span>
                        <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${c.score || 85}%` }}
                            className="h-full bg-[#a8b88c] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/reports/${c.id}`}
                        className="px-4 py-2 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-semibold text-xs rounded-lg transition inline-block cursor-pointer shadow-md"
                      >
                        View Full Report
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                    No evaluated candidates found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
