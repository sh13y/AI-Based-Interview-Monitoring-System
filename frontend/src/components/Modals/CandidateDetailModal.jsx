import React, { useState, useEffect } from 'react';
import {
  X, FileText, Download, Eye, Calendar, Mail, Briefcase, Award,
  CheckCircle2, User, ExternalLink, Sparkles, Printer, Maximize2, ShieldCheck,
  FileCode, Layers, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateCandidatePdf, downloadCandidatePdf } from '../../lib/pdfGenerator';
import { isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';

const CandidateDetailModal = ({ candidate, onClose }) => {
  const [showCvViewer, setShowCvViewer] = useState(false);
  const [viewMode, setViewMode] = useState('embed'); // 'embed' (Native PDF) or 'paper' (HTML layout)
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    if (candidate) {
      try {
        const generated = generateCandidatePdf(candidate);
        setPdfData(generated);
      } catch (err) {
        console.warn('PDF generation fallback:', err);
      }
    }
  }, [candidate]);

  if (!candidate) return null;

  const handleDownload = () => {
    try {
      downloadCandidatePdf(candidate);
      toast.success(`Downloaded ${candidate.full_name}'s CV as PDF`);
    } catch (err) {
      toast.error('Download failed: ' + err.message);
    }
  };

  const handlePrint = () => {
    if (pdfData?.pdfUrl) {
      const printWindow = window.open(pdfData.pdfUrl, '_blank');
      if (printWindow) printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl border border-white/10 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0E16]/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-surface border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 font-display text-sm shadow">
              {candidate.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white text-base font-bold font-display">{candidate.full_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {candidate.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Database className="w-3 h-3" /> {isSupabaseConfigured() ? 'Supabase Synced' : 'Local Storage'}
                </span>
              </div>
              <p className="text-gray-400 text-xs font-mono mt-0.5">{candidate.position} · {candidate.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0E16] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-gray-500 text-[10px] uppercase font-mono block">Pipeline Status</span>
              <span className="text-emerald-400 text-xs font-mono font-bold mt-1 inline-block">{candidate.status}</span>
            </div>
            <div className="bg-[#0A0E16] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-gray-500 text-[10px] uppercase font-mono block">Registered Date</span>
              <span className="text-gray-200 text-xs font-mono font-bold mt-1 inline-block">{candidate.date_registered || '2026-04-15'}</span>
            </div>
            <div className="bg-[#0A0E16] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-gray-500 text-[10px] uppercase font-mono block">Composite AI Score</span>
              <span className="text-emerald-400 text-sm font-mono font-black mt-0.5 inline-block">{candidate.score || 88}%</span>
            </div>
          </div>

          {/* Actual PDF Resume / CV Document Section */}
          <div className="bg-[#0A0E16] p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold font-display">Candidate Curriculum Vitae (Actual PDF)</h3>
                  <p className="text-gray-400 text-[11px] font-mono">
                    {pdfData?.pdfFileName || `${candidate.full_name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCvViewer(!showCvViewer)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-card hover:bg-surface-elevated border border-white/10 text-gray-200 rounded-xl text-xs font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {showCvViewer ? 'Hide PDF' : 'Preview Actual PDF'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 font-display"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Actual Embedded PDF Preview Viewer */}
            {showCvViewer && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('embed')}
                      className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition border ${
                        viewMode === 'embed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3 inline mr-1" /> Native PDF Viewer
                    </button>
                    <button
                      onClick={() => setViewMode('paper')}
                      className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition border ${
                        viewMode === 'paper'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3 h-3 inline mr-1" /> Clean Paper Layout
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 text-xs text-gray-300 hover:text-white px-3 py-1.5 bg-surface-card border border-white/10 rounded-xl transition"
                      title="Print PDF"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    {pdfData?.pdfUrl && (
                      <a
                        href={pdfData.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 bg-surface-card border border-white/10 rounded-xl transition"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Open Full Screen
                      </a>
                    )}
                  </div>
                </div>

                {/* 1. ACTUAL NATIVE PDF IFRAME VIEWER */}
                {viewMode === 'embed' && pdfData?.pdfUrl && (
                  <div className="w-full h-[550px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#525659]">
                    <iframe
                      src={`${pdfData.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      type="application/pdf"
                      className="w-full h-full border-none rounded-xl"
                      title={`Actual PDF Preview for ${candidate.full_name}`}
                    />
                  </div>
                )}

                {/* 2. PAPER DOCUMENT LAYOUT */}
                {viewMode === 'paper' && (
                  <div className="bg-white text-gray-900 rounded-xl p-8 border border-gray-300 shadow-2xl font-sans max-h-[500px] overflow-y-auto">
                    <div className="border-b-2 border-gray-800 pb-4 mb-5 flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{candidate.full_name}</h1>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5 uppercase tracking-wide">{candidate.position}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Email: <span className="font-semibold">{candidate.email}</span> · Registered: {candidate.date_registered || '2026-04-15'}
                        </p>
                      </div>
                      <div className="bg-gray-900 text-white px-3.5 py-2 rounded-lg text-center shadow">
                        <span className="text-[9px] block text-gray-400 uppercase font-bold">Interview Score</span>
                        <span className="text-lg font-black text-emerald-400">{candidate.score || 88}%</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Dedicated and analytical {candidate.position} evaluated under Modern Matrix AI monitoring framework. Verified competencies in scalable system architecture, collaborative problem solving, and engineering excellence.
                      </p>
                    </div>

                    <div className="mb-4">
                      <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200 mb-2">
                        Key Competencies & Benchmarks
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {(candidate.keywords && candidate.keywords.length > 0 ? candidate.keywords : ['Java', 'SQL', 'React', 'Docker']).map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-800 text-[11px] font-semibold rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {candidate.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700 italic">
                        <span className="font-bold not-italic text-gray-900 block mb-0.5">Evaluator Notes:</span>
                        "{candidate.notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Keywords & Benchmarks */}
          <div>
            <h3 className="text-gray-300 text-xs font-mono uppercase tracking-wider mb-2">Competency Benchmarks</h3>
            <div className="flex flex-wrap gap-2">
              {(candidate.keywords && candidate.keywords.length > 0 ? candidate.keywords : ['Java', 'SQL', 'Docker', 'React']).map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-[#0A0E16] border border-white/10 text-gray-300 rounded-xl text-xs font-mono">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {candidate.notes && (
            <div>
              <h3 className="text-gray-300 text-xs font-mono uppercase tracking-wider mb-1.5">Candidate Notes</h3>
              <p className="text-gray-300 text-xs font-mono leading-relaxed bg-[#0A0E16] p-3.5 rounded-xl border border-white/5">
                {candidate.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0A0E16]/80">
          <Link
            to={`/reports/${candidate.id}`}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold font-display"
          >
            View Full Behavioral Performance Report <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface text-xs font-bold font-display rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              Download PDF CV
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-surface-card text-gray-300 text-xs font-semibold rounded-xl hover:bg-surface-elevated border border-white/10 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
