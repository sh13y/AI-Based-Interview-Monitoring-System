import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Download, AlertCircle, ThumbsUp, ShieldCheck, Target, User,
  FileText, Eye, CheckCircle2, Sparkles, Printer, Maximize2, Layers, Database
} from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { dummyCandidates, dummyBehavioralScores, dummyInterviewSessions, dummyTranscripts } from '../lib/dummyData';
import { generateCandidatePdf, downloadCandidatePdf } from '../lib/pdfGenerator';
import { isSupabaseConfigured } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CandidateReport = () => {
  const { id } = useParams();
  const [showCvModal, setShowCvModal] = useState(false);
  const [viewMode, setViewMode] = useState('embed'); // 'embed' or 'paper'
  const [pdfData, setPdfData] = useState(null);

  const candidate = dummyCandidates.find((c) => c.id === id) || dummyCandidates[0];
  const session = dummyInterviewSessions.find((s) => s.candidate_id === candidate.id) || dummyInterviewSessions[0];
  const scores = dummyBehavioralScores[session.id] || { honesty: 94, attitude: 89, confidence: 88, relevance: 91, overall: 90 };

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

  const handleDownloadCv = () => {
    try {
      downloadCandidatePdf(candidate);
      toast.success(`Downloaded ${candidate.full_name}'s CV (.pdf)`);
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

  const radarData = {
    labels: ['Honesty', 'Attitude', 'Confidence', 'Relevance'],
    datasets: [
      {
        label: 'Candidate Score',
        data: [scores.honesty, scores.attitude, scores.confidence, scores.relevance],
        backgroundColor: 'rgba(168, 184, 140, 0.35)',
        borderColor: '#a8b88c',
        borderWidth: 2,
        pointBackgroundColor: '#a8b88c',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#a8b88c',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: '#a8b88c',
          font: { size: 12, weight: 'bold' },
        },
        ticks: { display: false, stepSize: 20 },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Back Button */}
      <Link to="/reports" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 text-sm mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> Back to Reports
      </Link>

      {/* Candidate Banner */}
      <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center font-bold text-lg text-white">
            {candidate.full_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{candidate.full_name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Database className="w-3 h-3" /> {isSupabaseConfigured() ? 'Supabase Database' : 'Local DB'}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{candidate.position}</p>
            <p className="text-gray-500 text-xs mt-1">
              Interview Date: {new Date(session.session_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {session.position} · {session.round || 'Round 1'}
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-gray-800 text-right min-w-[180px]">
          <p className="text-gray-400 text-xs font-medium">Final Performance Score</p>
          <p className="text-[#a8b88c] text-3xl font-extrabold mt-1">{scores.overall}%</p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${scores.overall}%` }} className="bg-[#a8b88c] h-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Candidate CV / Resume Card */}
      <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold">Candidate Curriculum Vitae (Actual PDF)</h3>
            <p className="text-gray-400 text-xs font-mono">
              {pdfData?.pdfFileName || `${candidate.full_name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCvModal(!showCvModal)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-gray-700 text-gray-200 rounded-lg text-xs font-semibold transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#a8b88c]" />
            {showCvModal ? 'Hide PDF' : 'Preview Actual PDF'}
          </button>
          <button
            onClick={handleDownloadCv}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 rounded-lg text-xs font-bold transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Embedded Actual Native PDF Preview Drawer */}
      {showCvModal && (
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-800 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('embed')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition border ${
                  viewMode === 'embed'
                    ? 'bg-[#a8b88c]/20 text-[#a8b88c] border-[#a8b88c]/40'
                    : 'bg-[#252525] text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3 inline mr-1" /> Native Interactive PDF View
              </button>
              <button
                onClick={() => setViewMode('paper')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition border ${
                  viewMode === 'paper'
                    ? 'bg-[#d4a843]/20 text-[#d4a843] border-[#d4a843]/40'
                    : 'bg-[#252525] text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3 inline mr-1" /> Clean Paper Layout
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white px-2.5 py-1 bg-[#252525] border border-gray-700 rounded transition"
                title="Print PDF"
              >
                <Printer className="w-3 h-3" /> Print
              </button>
              {pdfData?.pdfUrl && (
                <a
                  href={pdfData.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#a8b88c] hover:underline px-2.5 py-1 bg-[#252525] border border-gray-700 rounded transition"
                >
                  <Maximize2 className="w-3 h-3" /> Open Full Screen
                </a>
              )}
            </div>
          </div>

          {/* 1. Actual Native PDF IFRAME Embed */}
          {viewMode === 'embed' && pdfData?.pdfUrl && (
            <div className="w-full h-[550px] rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#525659]">
              <iframe
                src={`${pdfData.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full border-none rounded-xl"
                title={`PDF Preview for ${candidate.full_name}`}
              />
            </div>
          )}

          {/* 2. Paper Layout */}
          {viewMode === 'paper' && (
            <div className="bg-white text-gray-900 rounded-xl p-8 border border-gray-300 shadow-2xl font-sans max-h-[500px] overflow-y-auto">
              <div className="border-b-2 border-gray-800 pb-4 mb-5 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{candidate.full_name}</h1>
                  <p className="text-sm font-bold text-[#6b7c52] mt-0.5 uppercase tracking-wide">{candidate.position}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Email: <span className="font-semibold">{candidate.email}</span> · Status: {candidate.status}
                  </p>
                </div>
                <div className="bg-gray-900 text-white px-3.5 py-2 rounded-lg text-center shadow">
                  <span className="text-[9px] block text-gray-400 uppercase font-bold">Interview Score</span>
                  <span className="text-lg font-black text-[#d4a843]">{scores.overall}%</span>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200 mb-2">
                  Professional Summary
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Dedicated and results-oriented {candidate.position} evaluated under the Modern Matrix AI Interview Monitoring framework. Demonstrated outstanding technical command and high honesty across all interview rounds.
                </p>
              </div>

              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200 mb-2">
                  Key Competency Benchmarks
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {(candidate.keywords && candidate.keywords.length > 0 ? candidate.keywords : ['System Architecture', 'SQL', 'React', 'DevOps']).map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-800 text-[11px] font-semibold rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Modern Matrix Verified Candidate Record
                </span>
                <span>Document Ref: MM-CV-{candidate.id?.slice(0, 8) || '2026'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evaluation Summary Grid */}
      <h2 className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-4">Behavioral Evaluation Summary</h2>

      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Radar Chart Card */}
        <div className="col-span-12 lg:col-span-5 bg-[#252525] rounded-xl p-6 border border-gray-800 flex flex-col justify-center items-center min-h-[320px]">
          <div className="w-full h-64">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* 4 Score Cards */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Honesty */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#a8b88c]/20 flex items-center justify-center text-[#a8b88c]">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-gray-300 text-sm font-semibold">Honesty</span>
              </div>
            </div>
            <p className="text-white text-3xl font-extrabold mt-3">{scores.honesty}%</p>
            <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
              <div style={{ width: `${scores.honesty}%` }} className="bg-[#a8b88c] h-full rounded-full" />
            </div>
          </div>

          {/* Attitude */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#a8b88c]/20 flex items-center justify-center text-[#a8b88c]">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <span className="text-gray-300 text-sm font-semibold">Attitude</span>
              </div>
            </div>
            <p className="text-white text-3xl font-extrabold mt-3">{scores.attitude}%</p>
            <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
              <div style={{ width: `${scores.attitude}%` }} className="bg-[#a8b88c] h-full rounded-full" />
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#a8b88c]/20 flex items-center justify-center text-[#a8b88c]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-gray-300 text-sm font-semibold">Confidence</span>
              </div>
            </div>
            <p className="text-white text-3xl font-extrabold mt-3">{scores.confidence}%</p>
            <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
              <div style={{ width: `${scores.confidence}%` }} className="bg-[#a8b88c] h-full rounded-full" />
            </div>
          </div>

          {/* Relevance */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#a8b88c]/20 flex items-center justify-center text-[#a8b88c]">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-gray-300 text-sm font-semibold">Relevance</span>
              </div>
            </div>
            <p className="text-white text-3xl font-extrabold mt-3">{scores.relevance}%</p>
            <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
              <div style={{ width: `${scores.relevance}%` }} className="bg-[#a8b88c] h-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Output Section (FR-10) */}
      <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">Interview Transcript (OpenAI Whisper)</h3>
          </div>
          <span className="px-2.5 py-1 bg-[#a8b88c]/20 text-[#a8b88c] border border-[#a8b88c]/30 text-xs rounded-full font-semibold">
            WER: 5.06% · Accuracy: 94.94%
          </span>
        </div>
        <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#1e1e1e] rounded-lg p-4 border border-gray-800 max-h-64 overflow-y-auto">
          {dummyTranscripts[session.id] || dummyTranscripts['ses-001']}
        </pre>
      </div>

      {/* Interview Session Summary */}
      <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white text-base font-bold mb-4">Interview Session Summary</h3>
          <div className="flex items-center gap-8 text-xs text-gray-400">
            <div>
              <p className="text-gray-500 mb-1">Session Duration</p>
              <p className="text-white font-bold text-sm">
                {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Questions Answered</p>
              <p className="text-white font-bold text-sm">
                {session.questions_answered} out of {session.questions_total}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Noise Level Avg</p>
              <p className="text-white font-bold text-sm">{session.noise_level_db} dB</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Evaluator</p>
              <p className="text-white font-bold text-sm">{session.evaluator_name}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadCv}
          className="flex items-center gap-2 px-6 py-3 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-bold text-sm rounded-lg transition shadow-lg"
        >
          <Download className="w-4 h-4" /> Download Candidate CV (.pdf)
        </button>
      </div>
    </div>
  );
};

export default CandidateReport;
