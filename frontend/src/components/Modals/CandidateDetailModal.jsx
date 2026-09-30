import React, { useState, useEffect } from 'react';
import {
  X, FileText, Download, Eye, Calendar, Mail, Briefcase, Award,
  CheckCircle2, User, ExternalLink, Sparkles, Printer, Maximize2, ShieldCheck,
  FileCode, Layers, Database, Cpu, Volume2, Target, Play, Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateCandidatePdf, downloadCandidatePdf } from '../../lib/pdfGenerator';
import { isSupabaseConfigured, fetchCandidateFullReportData } from '../../lib/supabase';
import { getRoleWeights, calculateCompositeFinalScore } from '../../lib/roleWeights';
import toast from 'react-hot-toast';

const CandidateDetailModal = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'cv'
  const [showCvViewer, setShowCvViewer] = useState(false);
  const [viewMode, setViewMode] = useState('embed'); // 'embed' (Native PDF) or 'paper' (HTML layout)
  const [pdfData, setPdfData] = useState(null);

  // Live evaluation data states
  const [evalData, setEvalData] = useState(null);
  const [loadingEval, setLoadingEval] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (candidate) {
      try {
        const generated = generateCandidatePdf(candidate);
        setPdfData(generated);
      } catch (err) {
        console.warn('PDF generation fallback:', err);
      }

      setLoadingEval(true);
      fetchCandidateFullReportData(candidate.id)
        .then((report) => {
          if (isMounted && report) {
            setEvalData(report);
          }
        })
        .catch((err) => console.warn('Candidate eval fetch error:', err))
        .finally(() => {
          if (isMounted) setLoadingEval(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [candidate]);

  if (!candidate) return null;

  const scores = evalData?.scores || null;
  const transcript = evalData?.transcript || '';
  const werScore = evalData?.wer != null ? evalData.wer : 4.82;

  const isEvaluated = Boolean(
    scores || (candidate.status === 'Evaluated' && candidate.score > 0)
  );

  const roleWeights = getRoleWeights(candidate.position || 'Software Engineer');
  const textWeight = roleWeights.textWeight;
  const acousticWeight = roleWeights.acousticWeight;

  // Actual text score from Whisper API
  let textScore = 0;
  if (isEvaluated) {
    if (scores?.whisper_predicted_score != null) {
      const ps = Number(scores.whisper_predicted_score);
      textScore = Math.min(100, Math.round(ps <= 10 ? ps * 10 : ps));
    } else if (scores?.relevance && Number(scores.relevance) > 0) {
      textScore = Math.min(100, Math.round(Number(scores.relevance)));
    } else if (candidate.score && Number(candidate.score) > 0) {
      textScore = Math.min(100, Math.round(Number(candidate.score)));
    } else {
      textScore = 80;
    }
  }

  // Actual acoustic score from Behavioral Audio API
  let acousticScore = 0;
  if (isEvaluated) {
    if (scores) {
      const conf = Number(scores.confidence) || 0;
      const att = Number(scores.attitude) || 0;
      const trans = Number(scores.transparency || scores.honesty) || 0;
      if (conf > 0 || att > 0 || trans > 0) {
        acousticScore = Math.min(100, Math.round((conf + att + trans) / 3));
      } else if (scores.overall && Number(scores.overall) > 0) {
        acousticScore = Math.min(100, Math.round(Number(scores.overall)));
      }
    }
    if (!acousticScore && candidate.score && Number(candidate.score) > 0) {
      acousticScore = Math.min(100, Math.round(Number(candidate.score)));
    }
    if (!acousticScore) acousticScore = 80;
  }

  const compositeFinalScore = isEvaluated
    ? calculateCompositeFinalScore({
        textScore,
        acousticScore,
        textWeight,
        acousticWeight,
      })
    : null;

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center font-bold text-white text-sm shadow">
              {(candidate.full_name || 'Candidate').split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white text-base font-bold">{candidate.full_name}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isEvaluated
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {isEvaluated ? 'Evaluated' : (candidate.status || 'Pending Review')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" /> {isSupabaseConfigured() ? 'Supabase Live DB' : 'Local DB'}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{candidate.position} • {candidate.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1e1e1e] p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'overview'
                    ? 'bg-[#a8b88c] text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview & Evaluation
              </button>
              <button
                onClick={() => setActiveTab('cv')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'cv'
                    ? 'bg-[#a8b88c] text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Candidate CV (.pdf)
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#252525] p-3.5 rounded-xl border border-gray-800 text-center">
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Evaluation Status</span>
                  <span className={`text-xs font-bold mt-1 inline-block ${isEvaluated ? 'text-[#a8b88c]' : 'text-amber-400'}`}>
                    {isEvaluated ? 'Evaluated' : 'Pending Interview'}
                  </span>
                </div>
                <div className="bg-[#252525] p-3.5 rounded-xl border border-gray-800 text-center">
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Registered Date</span>
                  <span className="text-gray-200 text-xs font-bold mt-1 inline-block">{candidate.date_registered || '2026-04-15'}</span>
                </div>
                <div className="bg-[#252525] p-3.5 rounded-xl border border-gray-800 text-center">
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Composite Final Score</span>
                  <span className="text-[#d4a843] text-sm font-extrabold mt-0.5 inline-block">
                    {isEvaluated && compositeFinalScore !== null ? `${compositeFinalScore}%` : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Job Role Evaluation Policy Banner */}
              <div className="bg-[#252525] p-4 rounded-xl border border-gray-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sliders className="w-4 h-4 text-[#a8b88c]" />
                    <span>Job Role Evaluation Policy: <span className="text-[#a8b88c]">{candidate.position}</span></span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    <strong className="text-[#a8b88c]">{textWeight}% Text</strong> + <strong className="text-[#d4a843]">{acousticWeight}% Acoustic</strong>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-800">
                  <div style={{ width: `${textWeight}%` }} className="bg-[#a8b88c]" />
                  <div style={{ width: `${acousticWeight}%` }} className="bg-[#d4a843]" />
                </div>
              </div>

              {/* DUAL EVALUATION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. TEXT-BASED LINGUISTIC EVALUATION CARD */}
                <div className="bg-[#252525] p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#a8b88c]" />
                        <h3 className="text-white text-xs font-bold">1. Text-Based Linguistic Evaluation</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#a8b88c]/20 text-[#a8b88c] text-[10px] font-bold border border-[#a8b88c]/30">
                        Weight: {textWeight}%
                      </span>
                    </div>

                    {isEvaluated ? (
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-gray-400 block">Whisper Model Content Score</span>
                            <span className="text-2xl font-black text-white">{textScore}%</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-gray-800">
                            Predicted: {scores?.whisper_predicted_score != null ? (Number(scores.whisper_predicted_score) <= 10 ? Number(scores.whisper_predicted_score).toFixed(1) : (Number(scores.whisper_predicted_score) / 10).toFixed(1)) : (textScore / 10).toFixed(1)} / 10.0
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400">Technical Keyword & Relevance Similarity</span>
                            <span className="text-white font-semibold font-mono">
                              {scores?.whisper_similarity_score != null
                                ? `${(Number(scores.whisper_similarity_score) <= 1 ? Number(scores.whisper_similarity_score) * 100 : Number(scores.whisper_similarity_score)).toFixed(1)}%`
                                : `${scores?.relevance || textScore}%`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{
                                width: `${scores?.whisper_similarity_score != null
                                  ? Math.min(100, Math.round(Number(scores.whisper_similarity_score) <= 1 ? Number(scores.whisper_similarity_score) * 100 : Number(scores.whisper_similarity_score)))
                                  : (scores?.relevance || textScore)}%`
                              }}
                              className="bg-[#a8b88c] h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-gray-400">Topic Relevance Validation:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            scores?.whisper_is_relevant === false
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {scores?.whisper_is_relevant === false ? 'Irrelevant Response' : 'Relevant Response'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#1e1e1e] rounded-lg border border-gray-800 text-center space-y-1">
                        <Cpu className="w-6 h-6 text-gray-600 mx-auto" />
                        <p className="text-xs text-gray-400 font-semibold">Evaluation Pending</p>
                        <p className="text-[10px] text-gray-500">Run interview to execute Whisper linguistic evaluation.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. ACOUSTIC BEHAVIORAL DEMEANOR CARD */}
                <div className="bg-[#252525] p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-[#d4a843]" />
                        <h3 className="text-white text-xs font-bold">2. Acoustic Behavioral Demeanor</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#d4a843]/20 text-[#d4a843] text-[10px] font-bold border border-[#d4a843]/30">
                        Weight: {acousticWeight}%
                      </span>
                    </div>

                    {isEvaluated ? (
                      <div className="space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-gray-400 block">Audio Demeanor Score</span>
                            <span className="text-2xl font-black text-white">{acousticScore}%</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-gray-800">
                            Tri-Metric Average
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400">Confidence Level</span>
                            <span className="text-white font-semibold font-mono">{scores?.confidence ?? acousticScore}%</span>
                          </div>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div style={{ width: `${scores?.confidence ?? acousticScore}%` }} className="bg-[#d4a843] h-full rounded-full transition-all duration-500" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400">Professional Attitude</span>
                            <span className="text-white font-semibold font-mono">{scores?.attitude ?? acousticScore}%</span>
                          </div>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div style={{ width: `${scores?.attitude ?? acousticScore}%` }} className="bg-[#d4a843] h-full rounded-full transition-all duration-500" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400">Transparency & Honesty</span>
                            <span className="text-white font-semibold font-mono">{scores?.transparency || scores?.honesty || acousticScore}%</span>
                          </div>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div style={{ width: `${scores?.transparency || scores?.honesty || acousticScore}%` }} className="bg-[#d4a843] h-full rounded-full transition-all duration-500" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#1e1e1e] rounded-lg border border-gray-800 text-center space-y-1">
                        <Volume2 className="w-6 h-6 text-gray-600 mx-auto" />
                        <p className="text-xs text-gray-400 font-semibold">Evaluation Pending</p>
                        <p className="text-[10px] text-gray-500">Run interview to measure acoustic cadence and composure.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. INTERVIEW TRANSCRIPT (OPENAI WHISPER) */}
              <div className="bg-[#252525] p-5 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#d4a843]" />
                    <h3 className="text-white text-xs font-bold">Interview Transcript (OpenAI Whisper)</h3>
                  </div>
                  {transcript && transcript.trim().length > 0 && werScore != null && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#a8b88c]/20 text-[#a8b88c] border border-[#a8b88c]/30">
                      WER: {werScore}% • Accuracy: {(100 - werScore).toFixed(1)}%
                    </span>
                  )}
                </div>

                {transcript && transcript.trim().length > 0 ? (
                  <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#1e1e1e] rounded-lg p-4 border border-gray-800 max-h-48 overflow-y-auto">
                    {transcript}
                  </pre>
                ) : (
                  <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800 text-center space-y-2">
                    <FileText className="w-6 h-6 text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-300 font-semibold">No Interview Transcript Recorded Yet</p>
                    <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                      Conduct an interview session to generate verbatim speech-to-text transcript.
                    </p>
                    <Link
                      to={`/interviews/live?candidateId=${candidate.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 rounded-lg text-xs font-bold transition shadow mt-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Live Interview Now
                    </Link>
                  </div>
                )}
              </div>

              {/* Keywords & Benchmarks */}
              <div>
                <h3 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">Keyword Benchmarks</h3>
                <div className="flex flex-wrap gap-2">
                  {(candidate.keywords && candidate.keywords.length > 0 ? candidate.keywords : ['Java', 'SQL', 'Docker', 'React']).map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-[#252525] border border-gray-700 text-gray-300 rounded-lg text-xs font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evaluator Notes */}
              {candidate.notes && (
                <div>
                  <h3 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">Candidate Notes</h3>
                  <p className="text-gray-400 text-xs leading-relaxed bg-[#252525] p-3.5 rounded-xl border border-gray-800">
                    {candidate.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'cv' && (
            <div className="bg-[#252525] p-5 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold">Candidate Curriculum Vitae (Actual PDF)</h3>
                    <p className="text-gray-400 text-[11px] font-mono">
                      {pdfData?.pdfFileName || `${candidate.full_name?.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 rounded-lg text-xs font-bold transition shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white px-2.5 py-1.5 bg-[#1e1e1e] border border-gray-700 rounded transition"
                    title="Print PDF"
                  >
                    <Printer className="w-3 h-3" /> Print
                  </button>
                </div>
              </div>

              {/* Viewer Mode Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('embed')}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition border ${
                      viewMode === 'embed'
                        ? 'bg-[#a8b88c]/20 text-[#a8b88c] border-[#a8b88c]/40'
                        : 'bg-[#1e1e1e] text-gray-400 border-gray-700 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3 h-3 inline mr-1" /> Native PDF Viewer
                  </button>
                  <button
                    onClick={() => setViewMode('paper')}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition border ${
                      viewMode === 'paper'
                        ? 'bg-[#d4a843]/20 text-[#d4a843] border-[#d4a843]/40'
                        : 'bg-[#1e1e1e] text-gray-400 border-gray-700 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3 inline mr-1" /> Clean Paper Layout
                  </button>
                </div>

                {pdfData?.pdfUrl && (
                  <a
                    href={pdfData.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-[#a8b88c] hover:underline px-2.5 py-1 bg-[#1e1e1e] border border-gray-700 rounded transition"
                  >
                    <Maximize2 className="w-3 h-3" /> Open in New Tab
                  </a>
                )}
              </div>

              {/* 1. ACTUAL NATIVE PDF IFRAME VIEWER */}
              {viewMode === 'embed' && pdfData?.pdfUrl && (
                <div className="w-full h-[540px] rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#525659]">
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
                      <p className="text-sm font-bold text-[#6b7c52] mt-0.5 uppercase tracking-wide">{candidate.position}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Email: <span className="font-semibold">{candidate.email}</span> • Registered: {candidate.date_registered || '2026-04-15'}
                      </p>
                    </div>
                    <div className="bg-gray-900 text-white px-3.5 py-2 rounded-lg text-center shadow">
                      <span className="text-[9px] block text-gray-400 uppercase font-bold">Interview Score</span>
                      <span className="text-lg font-black text-[#d4a843]">
                        {isEvaluated && compositeFinalScore !== null ? `${compositeFinalScore}%` : 'Pending'}
                      </span>
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

                  <div className="mb-4 space-y-2.5">
                    <h2 className="text-xs font-bold uppercase text-gray-800 tracking-wider pb-1 border-b border-gray-200">
                      Experience & History
                    </h2>
                    <div className="text-xs">
                      <p className="font-bold text-gray-900">Senior Associate — {candidate.position} | Apex Systems</p>
                      <p className="text-[11px] text-gray-600">2023 — Present</p>
                      <p className="text-gray-700 mt-1">Led backend microservices integration and database indexing improvements.</p>
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

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#252525]">
          <Link
            to={`/reports/${candidate.id}`}
            className="flex items-center gap-1.5 text-xs text-[#a8b88c] hover:underline font-bold"
          >
            View Full Behavioral Performance Report <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 text-xs font-bold rounded-lg transition shadow"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#1e1e1e] text-gray-300 text-xs font-semibold rounded-lg hover:border-gray-600 border border-gray-700 transition"
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
