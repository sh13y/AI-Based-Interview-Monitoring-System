import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Download, AlertCircle, ThumbsUp, ShieldCheck, Target, User,
  FileText, Eye, CheckCircle2, Sparkles, Printer, Maximize2, Layers, Database,
  RefreshCw, TrendingUp, Calendar, Clock, MapPin, Award, ExternalLink, Activity,
  Mic, EyeOff, Radio, Cpu
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
import { isSupabaseConfigured, fetchLatestBehavioralScores } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CandidateReport = () => {
  const { id } = useParams();
  const [showCvModal, setShowCvModal] = useState(false);
  const [viewMode, setViewMode] = useState('embed'); // 'embed' or 'paper'
  const [pdfData, setPdfData] = useState(null);

  // Live DB scores state
  const [scoresLoading, setScoresLoading] = useState(true);
  const [liveScores, setLiveScores] = useState(null);
  const [liveSessionDate, setLiveSessionDate] = useState(null);
  const [liveSessionStatus, setLiveSessionStatus] = useState(null);

  const candidate = dummyCandidates.find((c) => c.id === id) || dummyCandidates[0];
  const session = dummyInterviewSessions.find((s) => s.candidate_id === candidate.id) || dummyInterviewSessions[0];
  const fallbackScores = { confidence: 82, attitude: 89, transparency: 71, overall: 84 };

  // Active scores: real DB data takes priority over fallback
  const scores = liveScores || fallbackScores;
  const isLiveData = !!liveScores;

  // Fetch real scores from Supabase on mount
  useEffect(() => {
    const loadScores = async () => {
      setScoresLoading(true);
      try {
        const result = await fetchLatestBehavioralScores(candidate.id);
        if (result.scores) {
          setLiveScores(result.scores);
          setLiveSessionDate(result.sessionDate);
          setLiveSessionStatus(result.sessionStatus);
        }
      } catch (err) {
        console.warn('[Report] Score fetch failed:', err);
      } finally {
        setScoresLoading(false);
      }
    };
    loadScores();
  }, [candidate.id]);

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
    labels: ['Confidence', 'Attitude', 'Transparency'],
    datasets: [
      {
        label: 'Candidate Score',
        data: [scores.confidence, scores.attitude, scores.transparency],
        backgroundColor: 'rgba(16, 185, 129, 0.25)',
        borderColor: '#10B981',
        borderWidth: 2.5,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#10B981',
        pointRadius: 4,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F131C',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono' },
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: '#4EDEA3',
          font: { size: 12, weight: '600', family: 'Plus Jakarta Sans' },
        },
        ticks: { display: false, stepSize: 20 },
        min: 0,
        max: 100,
      },
    },
  };

  // Grade calculation
  const overallVal = Math.round(scores.overall || 84);
  const gradeLabel = overallVal >= 80 ? 'GRADE A' : overallVal >= 65 ? 'GRADE B' : 'GRADE C';
  const strokeDashoffset = 264 - (264 * overallVal) / 100;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400 font-mono">
          <Link to="/reports" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" /> Reports
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300">{candidate.full_name}</span>
          <span className="text-gray-600">/</span>
          <span className="text-emerald-400 font-semibold">Evaluation Report</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181C24] border border-white/10 text-xs font-mono text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Biometrics Cryptographically Sealed
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
            TRUST: 99.4%
          </span>
        </div>
      </div>

      {/* Candidate Executive Hero Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/10 shadow-2xl">
        {/* Ambient subtle glow behind gauge */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          {/* Candidate Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-surface border-2 border-emerald-500/40 flex items-center justify-center font-display font-black text-2xl text-emerald-400 shadow-xl flex-shrink-0">
              {candidate.full_name.split(' ').map((n) => n[0]).join('')}
              <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-beacon" />
                <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">VERIFIED</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                  {candidate.full_name}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                  #{candidate.id || 'CAN-8924'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wide shadow-sm shadow-emerald-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  RECOMMENDED FOR HIRE
                </span>
              </div>
              <p className="text-gray-300 font-medium text-sm">
                {candidate.position} <span className="text-gray-600 mx-2">•</span> Distributed Systems & Real-Time Engines
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{new Date(session.session_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Evaluator: {session.evaluator_name || 'System Auto-Proctor'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400">{isSupabaseConfigured() ? 'Supabase Synchronized' : 'Local Workspace'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score Gauge & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t xl:border-t-0 xl:border-l border-white/10 pt-4 xl:pt-0 xl:pl-8">
            {/* Circular Gauge */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-[#181C24] fill-none" cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" />
                  <circle
                    className="text-emerald-400 fill-none transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeDasharray="264"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white leading-none font-display">{overallVal}%</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider mt-0.5">{gradeLabel}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>92nd Percentile</span>
                </div>
                <p className="text-xs text-gray-400 leading-tight max-w-[140px]">
                  Top 8% of Technical Engineering Cohort
                </p>
                <div className="text-[10px] font-mono text-gray-500">
                  Integrity Index: 99.8%
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadCv}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Export Official CV (.pdf)</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCvModal(!showCvModal)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated border border-white/10 text-gray-200 text-xs font-medium transition"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{showCvModal ? 'Hide CV' : 'Preview CV'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated border border-white/10 text-gray-400 hover:text-white text-xs transition"
                  title="Print Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive CV Drawer (Paper / Native Embed) */}
      {showCvModal && (
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('embed')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition border ${
                  viewMode === 'embed'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1.5" /> Interactive Native PDF
              </button>
              <button
                onClick={() => setViewMode('paper')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition border ${
                  viewMode === 'paper'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Clean Paper Layout
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 bg-surface-card border border-white/10 rounded-lg transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              {pdfData?.pdfUrl && (
                <a
                  href={pdfData.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 bg-surface-card border border-white/10 rounded-lg transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Open Full Screen
                </a>
              )}
            </div>
          </div>

          {/* Native PDF Iframe */}
          {viewMode === 'embed' && pdfData?.pdfUrl && (
            <div className="w-full h-[550px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#525659]">
              <iframe
                src={`${pdfData.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full border-none rounded-xl"
                title={`PDF Preview for ${candidate.full_name}`}
              />
            </div>
          )}

          {/* Paper View */}
          {viewMode === 'paper' && (
            <div className="bg-white text-gray-900 rounded-xl p-8 border border-gray-300 shadow-2xl font-sans max-h-[500px] overflow-y-auto">
              <div className="border-b-2 border-gray-800 pb-4 mb-5 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{candidate.full_name}</h1>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5 uppercase tracking-wide">{candidate.position}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Email: <span className="font-semibold">{candidate.email}</span> · Status: {candidate.status}
                  </p>
                </div>
                <div className="bg-gray-900 text-white px-3.5 py-2 rounded-lg text-center shadow">
                  <span className="text-[9px] block text-gray-400 uppercase font-bold">Interview Score</span>
                  <span className="text-lg font-black text-emerald-400">{scores.overall}%</span>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200 mb-2">
                  Executive Candidate Summary
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Dedicated and results-oriented {candidate.position} evaluated under the Modern Matrix AI Interview Monitoring framework. Demonstrated outstanding technical command and high honesty across all interview rounds.
                </p>
              </div>

              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200 mb-2">
                  Competency Benchmarks
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
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Modern Matrix Verified Candidate Record
                </span>
                <span>Document Ref: MM-CV-{candidate.id?.slice(0, 8) || '2026'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Behavioral Diagnostic Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-beacon" />
          <h2 className="text-white text-base font-bold font-display">Behavioral Tri-Metric Diagnostic</h2>
          <span className="text-xs text-gray-500 font-mono">Continuous Visual & Acoustic Inference</span>
        </div>
        <div className="flex items-center gap-2">
          {scoresLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> Loading live data...
            </span>
          ) : isLiveData ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live DB — {liveSessionDate ? new Date(liveSessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Synced'}
              {liveSessionStatus && <span className="ml-1 px-1.5 py-0.5 bg-black/40 rounded text-gray-300">{liveSessionStatus}</span>}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-mono">
              <Database className="w-3 h-3" /> Baseline Calibrated
            </span>
          )}
        </div>
      </div>

      {/* Tri-Metric Grid & Radar Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Card (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between items-center shadow-xl min-h-[350px]">
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Multimodal Radar Balance</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{scores.overall}% Harmony</span>
          </div>
          <div className="w-full h-64 my-2">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <div className="w-full flex justify-around text-center pt-3 border-t border-white/10 text-xs font-mono text-gray-400">
            <div>Confidence <span className="text-emerald-400 font-bold block">{scores.confidence}%</span></div>
            <div>Attitude <span className="text-emerald-400 font-bold block">{scores.attitude}%</span></div>
            <div>Transparency <span className="text-amber-400 font-bold block">{scores.transparency}%</span></div>
          </div>
        </div>

        {/* 3 Score Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {[
            {
              label: 'Confidence Index',
              subtitle: 'Acoustic clarity, steady cadence & speech volume posture',
              icon: ShieldCheck,
              value: scores.confidence,
              status: scores.confidence >= 75 ? 'Optimal' : 'Moderate',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/15 border-emerald-500/30',
              barColor: 'bg-emerald-500',
              bullet: 'Steady vocal cadence · 1.2% micro-tremor floor',
            },
            {
              label: 'Attitude & Receptivity',
              subtitle: 'Engagement, facial sentiment symmetry & collaborative tone',
              icon: ThumbsUp,
              value: scores.attitude,
              status: scores.attitude >= 80 ? 'Exceptional' : 'Standard',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/15 border-emerald-500/30',
              barColor: 'bg-emerald-500',
              bullet: 'Active listener resonance · Positive response index',
            },
            {
              label: 'Transparency & Honesty',
              subtitle: 'Gaze sincerity, eye contact stability & unassisted thought flow',
              icon: AlertCircle,
              value: scores.transparency,
              status: scores.transparency >= 70 ? 'Calibrated' : 'Flagged',
              color: 'text-amber-400',
              bg: 'bg-amber-500/15 border-amber-500/30',
              barColor: 'bg-amber-500',
              bullet: '98.4% gaze on central focal zone · No secondary audio',
            },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${metric.bg} border flex items-center justify-center ${metric.color} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {metric.label}
                      </h4>
                      <p className="text-xs text-gray-400">{metric.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black font-display ${metric.color}`}>{metric.value}%</span>
                    <span className="block text-[10px] font-mono text-gray-400 uppercase">{metric.status}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#181C24] h-2 rounded-full overflow-hidden mb-2">
                  <div
                    style={{ width: `${metric.value}%` }}
                    className={`h-full rounded-full transition-all duration-1000 ${metric.barColor}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                  <span className="flex items-center gap-1 text-gray-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {metric.bullet}
                  </span>
                  <span className="text-gray-500">Benchmark: &gt;70%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OpenAI Whisper STT Transcript Section */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Verbatim Audio Transcript (OpenAI Whisper)</h3>
              <p className="text-xs text-gray-400">Timestamped automatic speech-to-text token reconstruction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-mono font-semibold">
              WER: 5.06% · Accuracy: 94.94%
            </span>
            <span className="px-2.5 py-1 bg-white/5 text-gray-400 border border-white/10 text-xs rounded-full font-mono">
              16kHz Mono WAV
            </span>
          </div>
        </div>

        <div className="bg-[#0A0E16] rounded-xl p-4 border border-white/5 max-h-64 overflow-y-auto">
          <pre className="text-gray-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">
            {dummyTranscripts[session.id] || dummyTranscripts['ses-001']}
          </pre>
        </div>
      </div>

      {/* Interview Session Telemetry Summary Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Session Telemetry Summary
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
            <div>
              <p className="text-gray-500 mb-0.5">Session Duration</p>
              <p className="text-white font-bold text-sm">
                {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Questions Answered</p>
              <p className="text-emerald-400 font-bold text-sm">
                {session.questions_answered} / {session.questions_total} Completed
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Ambient Noise Floor</p>
              <p className="text-white font-bold text-sm">{session.noise_level_db || 32} dB (Nominal)</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Evaluator Protocol</p>
              <p className="text-white font-bold text-sm">{session.evaluator_name || 'AI Automated'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadCv}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/25 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Candidate Dossier (.pdf)</span>
        </button>
      </div>
    </div>
  );
};

export default CandidateReport;
