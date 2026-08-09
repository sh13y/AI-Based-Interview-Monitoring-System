import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Clock, Mic, MicOff, Pause, Play, CheckCircle2, Server,
  AlertTriangle, Volume2, FileText, Cpu, ChevronRight, ChevronLeft,
  Download, Award, User, RefreshCw, BarChart2, Radio, Check,
} from 'lucide-react';
import { dummyInterviewSessions, dummyQuestions, dummyTranscripts, dummyBehavioralScores, dummyCandidates } from '../lib/dummyData';
import { writeAuditLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// ── Constants ──────────────────────────────────────────────────────────────────
const NOISE_THRESHOLD_DB = 60;
const CHECKPOINT_KEY = (id) => `mm_session_checkpoint_${id}`;
const CHECKPOINT_INTERVAL_MS = 5000;

// Preprocessing steps shown after recording ends (FR-08)
const PREPROCESS_STEPS = [
  'Validating recorded audio...',
  'Normalizing audio volume levels...',
  'Converting to WAV format (16kHz mono)...',
  'Applying noise reduction filter...',
  'Preparing for transcription engine (Whisper)...',
  'Audio preprocessing complete ✓',
];

// ── Component ──────────────────────────────────────────────────────────────────
const LiveInterview = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mode state: 'completed' (review mode) or 'live' (microphone recording mode)
  const [viewMode, setViewMode] = useState('live');

  // Session & UI state
  const [session, setSession] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [micError, setMicError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Real audio state (FR-05, FR-06, FR-09)
  const [currentNoiseDb, setCurrentNoiseDb] = useState(0);
  const [noiseWarning, setNoiseWarning] = useState(false);
  const [waveformBars, setWaveformBars] = useState(Array(48).fill(3));
  const [audioFormat, setAudioFormat] = useState(null);

  // Post-recording state (FR-08, FR-10)
  const [showPreprocess, setShowPreprocess] = useState(false);
  const [preprocessStep, setPreprocessStep] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Completed Session Audio Playback simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(204); // 03:24

  // FR-07: Session Recovery
  const [sessionRestored, setSessionRestored] = useState(false);

  // Refs for Web Audio API
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const checkpointRef = useRef(null);
  const chunksRef = useRef([]);

  const sessionQuestions = dummyQuestions.slice(0, 5);

  // ── Load session & check status ─────────────────────────────────────────────
  useEffect(() => {
    let found;
    let cand;

    if (id === 'live' || id === 'new') {
      const candidateIdParam = searchParams.get('candidateId');
      const roundParam = searchParams.get('round');

      cand = dummyCandidates.find((c) => c.id === candidateIdParam) || dummyCandidates[1]; // default to Mark Chen if not specified
      found = {
        id: `ses-live-${Date.now()}`,
        candidate_id: cand.id,
        candidate_name: cand.full_name,
        position: cand.position,
        round: roundParam || 'Round 1',
        evaluator_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Jessica Smith',
        status: 'In Progress',
        duration_seconds: 0,
        questions_answered: 0,
        questions_total: 5,
        noise_level_db: 45,
        session_date: new Date().toISOString(),
      };
      setViewMode('live');
    } else {
      found = dummyInterviewSessions.find((s) => s.id === id) || dummyInterviewSessions[0];
      cand = dummyCandidates.find((c) => c.id === found.candidate_id) || dummyCandidates[0];
      setViewMode(found.status === 'Completed' ? 'completed' : 'live');
    }

    setSession(found);
    setCandidate(cand);

    // Try to restore a saved checkpoint for live sessions
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKPOINT_KEY(found.id)) || 'null');
      if (saved && saved.elapsedSeconds > 0 && found.status !== 'Completed') {
        setElapsedSeconds(saved.elapsedSeconds);
        setActiveQuestionIdx(saved.activeQuestionIdx || 0);
        setSessionRestored(true);
        toast('Session restored from last checkpoint.', { icon: '🔄', duration: 4000 });
      }
    } catch (_) {}

    return () => cleanup();
  }, [id, searchParams]);

  // ── Auto-connect Microphone on Live Mode (FR-05 Auto Request) ───────────────
  useEffect(() => {
    if (viewMode === 'live' && !micGranted && session) {
      initMicrophone();
    }
  }, [viewMode, session]);

  // Simulated audio playback timer for completed review
  useEffect(() => {
    let playbackInterval;
    if (isPlayingAudio) {
      playbackInterval = setInterval(() => {
        setPlaybackTime((prev) => (prev >= (session?.duration_seconds || 1185) ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(playbackInterval);
  }, [isPlayingAudio, session]);

  // ── Periodic checkpoint save (FR-07) ───────────────────────────────────────
  useEffect(() => {
    if (!session || viewMode === 'completed') return;
    checkpointRef.current = setInterval(() => {
      if (isRecording) {
        const checkpoint = { elapsedSeconds, activeQuestionIdx, savedAt: Date.now() };
        localStorage.setItem(CHECKPOINT_KEY(session.id), JSON.stringify(checkpoint));
      }
    }, CHECKPOINT_INTERVAL_MS);
    return () => clearInterval(checkpointRef.current);
  }, [session, isRecording, elapsedSeconds, activeQuestionIdx, viewMode]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRecording && viewMode === 'live') {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, viewMode]);

  // ── Real-time audio analyser loop (FR-06, FR-09) ───────────────────────────
  const startAnalyser = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS → approximate dB
      const rms = Math.sqrt(dataArray.reduce((acc, v) => acc + v * v, 0) / bufferLength);
      const db = rms > 0 ? Math.round(20 * Math.log10(rms / 255) + 90) : 0;
      setCurrentNoiseDb(Math.max(0, Math.min(99, db)));
      setNoiseWarning(db > NOISE_THRESHOLD_DB);

      // Build waveform bars from frequency data
      const bars = Array.from({ length: 48 }, (_, i) => {
        const idx = Math.floor((i / 48) * bufferLength);
        return Math.max(3, (dataArray[idx] / 255) * 100);
      });
      setWaveformBars(bars);

      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const stopAnalyser = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setWaveformBars(Array(48).fill(3));
    setCurrentNoiseDb(0);
  }, []);

  // ── Request microphone & initialise Web Audio (FR-05) ─────────────────────
  const initMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // Set up Web Audio API
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      // Capture sample rate for preprocessing display (FR-08)
      setAudioFormat({ sampleRate: ctx.sampleRate, channels: 1, format: 'PCM' });

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder (FR-05)
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = mr;

      setMicGranted(true);
      setMicError(null);
      startRecording();

      await writeAuditLog({
        action: 'SESSION_STARTED',
        entityType: 'interview_session',
        entityId: session?.id,
        details: `Started live interview session for ${session?.candidate_name}`,
        userEmail: user?.email,
      });
    } catch (err) {
      setMicError(
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone permission and try again.'
          : `Microphone error: ${err.message}`
      );
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      chunksRef.current = [];
      mediaRecorderRef.current.start(1000);
    }
    startAnalyser();
    setIsRecording(true);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    stopAnalyser();
    setIsRecording(false);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    startAnalyser();
    setIsRecording(true);
  };

  const cleanup = () => {
    stopAnalyser();
    clearInterval(timerRef.current);
    clearInterval(checkpointRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  // ── End Interview → Preprocessing Flow (FR-08) ────────────────────────────
  const handleEndInterview = async () => {
    pauseRecording();
    cleanup();

    if (session) localStorage.removeItem(CHECKPOINT_KEY(session.id));

    await writeAuditLog({
      action: 'SESSION_ENDED',
      entityType: 'interview_session',
      entityId: session?.id,
      details: `Ended interview for ${session?.candidate_name} - duration: ${formatTime(elapsedSeconds)}`,
      userEmail: user?.email,
    });

    setShowPreprocess(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setPreprocessStep(step);
      if (step >= PREPROCESS_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          const t = dummyTranscripts[session?.id] || dummyTranscripts['ses-001'];
          setTranscript(t);
          setShowTranscript(true);
          setShowPreprocess(false);
        }, 800);
      }
    }, 900);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (!session) return null;

  const currentScores = dummyBehavioralScores[session.id] || { honesty: 94, attitude: 89, confidence: 88, relevance: 91, overall: 90 };
  const sessionTranscriptText = dummyTranscripts[session.id] || dummyTranscripts['ses-001'];

  // ── Preprocessing Modal (FR-08) ────────────────────────────────────────────
  if (showPreprocess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-6 h-6 text-[#d4a843] animate-pulse" />
            <h2 className="text-white text-lg font-bold">Processing Audio</h2>
          </div>
          <p className="text-gray-400 text-xs mb-6">
            Preparing audio for the transcription engine (OpenAI Whisper)
          </p>
          {audioFormat && (
            <div className="bg-[#252525] rounded-lg p-3 mb-5 text-xs text-gray-400 border border-gray-800 flex justify-between">
              <span>Detected: PCM / {audioFormat.sampleRate / 1000}kHz</span>
              <span>Target: WAV / 16kHz</span>
            </div>
          )}
          <div className="space-y-3">
            {PREPROCESS_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {idx < preprocessStep ? (
                  <CheckCircle2 className="w-4 h-4 text-[#a8b88c] flex-shrink-0" />
                ) : idx === preprocessStep ? (
                  <div className="w-4 h-4 border-2 border-[#d4a843] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-700 flex-shrink-0" />
                )}
                <span className={`text-xs ${idx <= preprocessStep ? 'text-gray-200' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Transcript View after Live Recording (FR-10) ──────────────────────────
  if (showTranscript) {
    return (
      <div>
        <Toaster position="top-right" />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Interview Transcript</h1>
            <p className="text-gray-400 text-xs mt-1">
              Generated by OpenAI Whisper - {session.candidate_name} · {session.position}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a8b88c]/10 border border-[#a8b88c]/30 rounded-lg text-[#a8b88c] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Transcription Complete
            </span>
            <span className="text-gray-400 text-xs">WER: 5.06% · CER: 3.10%</span>
          </div>
        </div>

        <div className="bg-[#252525] rounded-xl border border-gray-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#d4a843]" />
            <h2 className="text-white text-sm font-bold">Whisper Transcription Output</h2>
          </div>
          <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#1e1e1e] rounded-lg p-4 border border-gray-800 max-h-80 overflow-y-auto">
            {transcript}
          </pre>
        </div>

        <div className="flex items-center justify-between bg-[#252525] rounded-xl border border-gray-800 p-4">
          <div className="text-xs text-gray-400 space-y-1">
            <p>Session Duration: <span className="text-white font-semibold">{formatTime(elapsedSeconds)}</span></p>
            <p>Questions Answered: <span className="text-white font-semibold">{activeQuestionIdx + 1} / {sessionQuestions.length}</span></p>
          </div>
          <button
            onClick={() => navigate(`/reports/${session.candidate_id}`)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#a8b88c] text-gray-900 font-bold text-sm rounded-lg hover:bg-[#98a87c] transition"
          >
            View Full Report <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // MODE 1: COMPLETED SESSION REVIEW VIEW (FR-18 Session History)
  // ===========================================================================
  if (viewMode === 'completed') {
    return (
      <div>
        <Toaster position="top-right" />

        {/* Back Link */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/interviews" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-xs font-medium transition">
            <ChevronLeft className="w-4 h-4" /> Back to Interview Sessions
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode('live');
                toast('Switched to Live Recording Mode', { icon: '🎙️' });
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg text-xs font-semibold border border-gray-700 hover:border-gray-600 transition"
            >
              <Mic className="w-3.5 h-3.5 text-[#a8b88c]" /> Switch to Live Recording Mode
            </button>
            <Link
              to={`/reports/${session.candidate_id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#a8b88c] text-gray-900 rounded-lg text-xs font-bold hover:bg-[#98a87c] transition shadow"
            >
              <BarChart2 className="w-4 h-4" /> View Performance Report
            </Link>
          </div>
        </div>

        {/* Header Info Banner */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800/80 flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center text-white font-bold text-base">
              {session.candidate_name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white">{session.candidate_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a8b88c]/20 text-[#a8b88c] border border-[#a8b88c]/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{session.position} · {session.round}</p>
              <p className="text-gray-500 text-xs mt-1">
                Evaluator: <span className="text-gray-300 font-medium">{session.evaluator_name}</span> · Session ID: <span className="text-gray-400 font-mono">{session.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-[#1e1e1e] px-5 py-3 rounded-xl border border-gray-800">
            <div className="text-center">
              <p className="text-gray-500 text-[11px] font-medium">Session Score</p>
              <p className="text-[#a8b88c] text-2xl font-extrabold">{currentScores.overall}%</p>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <p className="text-gray-500 text-[11px] font-medium">Duration</p>
              <p className="text-white text-base font-bold">{formatTime(session.duration_seconds)}</p>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <p className="text-gray-500 text-[11px] font-medium">Avg Noise</p>
              <p className="text-[#d4a843] text-base font-bold">{session.noise_level_db} dB</p>
            </div>
          </div>
        </div>

        {/* Audio Playback Player (FR-05 Review) */}
        <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#a8b88c]" />
              <h3 className="text-white text-xs font-bold uppercase tracking-wider">Session Audio Recording Playback</h3>
            </div>
            <span className="text-gray-400 text-xs font-mono">
              {formatTime(playbackTime)} / {formatTime(session.duration_seconds)}
            </span>
          </div>

          <div className="flex items-center gap-4 bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 rounded-full bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 flex items-center justify-center font-bold transition flex-shrink-0 shadow"
            >
              {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Waveform Timeline */}
            <div className="flex-1 space-y-2">
              <div className="flex items-end gap-1 h-10 w-full overflow-hidden">
                {Array.from({ length: 64 }).map((_, i) => {
                  const barProgress = (i / 64) * session.duration_seconds;
                  const isPlayed = barProgress <= playbackTime;
                  const height = Math.sin(i * 0.5) * 30 + 45 + ((i % 5) * 6);
                  return (
                    <div
                      key={i}
                      onClick={() => setPlaybackTime(Math.floor(barProgress))}
                      style={{ height: `${height}%` }}
                      className={`flex-1 rounded-full cursor-pointer transition-all ${
                        isPlayed ? 'bg-[#a8b88c]' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    />
                  );
                })}
              </div>

              <input
                type="range"
                min="0"
                max={session.duration_seconds}
                value={playbackTime}
                onChange={(e) => setPlaybackTime(Number(e.target.value))}
                className="w-full accent-[#a8b88c] cursor-pointer h-1 bg-gray-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Question-by-Question Transcript & AI Evaluation (FR-10 & FR-18) */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Question List Column */}
          <div className="col-span-12 lg:col-span-5 bg-[#252525] rounded-xl p-5 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-sm font-bold">Session Questions</h3>
              <span className="text-gray-500 text-xs">{sessionQuestions.length} Questions</span>
            </div>

            <div className="space-y-3">
              {sessionQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition ${
                    activeQuestionIdx === idx
                      ? 'bg-[#a8b88c]/10 border-[#a8b88c] text-white font-medium'
                      : 'bg-[#1e1e1e] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#a8b88c] font-bold text-[11px] uppercase">
                      Q{idx + 1} · {q.category}
                    </span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] font-semibold border border-green-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Answered
                    </span>
                  </div>
                  <p className="text-gray-200 text-xs leading-snug line-clamp-2">
                    {q.question_text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Question Transcript & Analysis */}
          <div className="col-span-12 lg:col-span-7 bg-[#252525] rounded-xl p-6 border border-gray-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                <div>
                  <span className="text-[#a8b88c] text-xs font-bold uppercase tracking-wider">
                    Question {activeQuestionIdx + 1} of {sessionQuestions.length}
                  </span>
                  <h4 className="text-white text-sm font-bold mt-1">
                    {sessionQuestions[activeQuestionIdx]?.question_text}
                  </h4>
                </div>
                <span className="px-2.5 py-1 bg-[#d4a843]/10 border border-[#d4a843]/30 text-[#d4a843] text-xs rounded-lg font-semibold whitespace-nowrap">
                  {sessionQuestions[activeQuestionIdx]?.difficulty} Difficulty
                </span>
              </div>

              {/* Speech-to-Text Transcript Box (FR-10) */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#d4a843]" /> ASR Transcript (OpenAI Whisper)
                  </span>
                  <span className="text-gray-500 text-[11px]">WER: 5.06% · Accuracy: 94.94%</span>
                </div>
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {sessionTranscriptText.split('\n\n')[activeQuestionIdx] || sessionTranscriptText}
                </div>
              </div>

              {/* Behavioral Metrics Grid for this Question */}
              <div className="grid grid-cols-4 gap-3 bg-[#1e1e1e] p-3.5 rounded-xl border border-gray-800 text-center">
                <div>
                  <p className="text-gray-500 text-[11px]">Honesty</p>
                  <p className="text-[#a8b88c] font-bold text-base mt-0.5">{currentScores.honesty}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Attitude</p>
                  <p className="text-[#a8b88c] font-bold text-base mt-0.5">{currentScores.attitude}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Confidence</p>
                  <p className="text-[#a8b88c] font-bold text-base mt-0.5">{currentScores.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Relevance</p>
                  <p className="text-[#a8b88c] font-bold text-base mt-0.5">{currentScores.relevance}%</p>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-800 flex justify-between items-center mt-5">
              <span className="text-gray-500 text-xs">Session recorded and validated successfully</span>
              <Link
                to={`/reports/${session.candidate_id}`}
                className="px-5 py-2 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 text-xs font-bold rounded-lg transition"
              >
                View Radar Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // MODE 2: LIVE INTERVIEW RECORDING VIEW (FR-05, FR-06, FR-09)
  // ===========================================================================
  return (
    <div>
      <Toaster position="top-right" />

      {/* Mode Switch Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center text-gray-200 font-bold">
            {session.candidate_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{session.candidate_name}</h1>
            <p className="text-gray-400 text-xs">{session.position} · {session.round}</p>
          </div>
          {sessionRestored && (
            <span className="ml-2 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded-full font-medium">
              🔄 Session Restored
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session.status === 'Completed' && (
            <button
              onClick={() => setViewMode('completed')}
              className="px-3.5 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg text-xs font-semibold border border-gray-700 hover:border-gray-600 transition"
            >
              View Completed Review
            </button>
          )}
          {micGranted && (
            <button
              onClick={isRecording ? pauseRecording : resumeRecording}
              className="p-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg border border-gray-700 hover:border-gray-600 transition"
              title={isRecording ? 'Pause Recording' : 'Resume Recording'}
            >
              {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          )}
          <button
            onClick={handleEndInterview}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition shadow-lg"
          >
            End Interview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Mic Permission Gate */}
          {!micGranted && (
            <div className="bg-[#252525] rounded-xl p-8 border border-gray-800 flex flex-col items-center justify-center text-center gap-5 min-h-[220px]">
              {micError ? (
                <>
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                  <div>
                    <p className="text-red-400 font-semibold text-sm mb-1">Microphone Access Failed</p>
                    <p className="text-gray-500 text-xs max-w-xs">{micError}</p>
                  </div>
                  <button onClick={initMicrophone} className="px-5 py-2.5 bg-[#d4a843] text-gray-900 font-semibold text-sm rounded-lg hover:bg-[#c39732] transition">
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full border-3 border-[#a8b88c] border-t-transparent animate-spin flex items-center justify-center">
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Connecting to Microphone...</p>
                    <p className="text-gray-500 text-xs max-w-xs">
                      Initializing Web Audio stream. If prompted, please allow microphone access.
                    </p>
                  </div>
                  <button onClick={initMicrophone} className="px-5 py-2 bg-[#2a2a2a] text-gray-300 text-xs font-semibold rounded-lg border border-gray-700 hover:border-gray-600 transition">
                    Grant Manually
                  </button>
                </>
              )}
            </div>
          )}

          {/* Recording Header Bar */}
          {micGranted && (
            <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-[#a8b88c]" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${isRecording ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-gray-700/30 border border-gray-700 text-gray-500'}`}>
                  <Mic className={`w-3.5 h-3.5 ${isRecording ? 'animate-pulse' : ''}`} />
                  {isRecording ? 'Recording' : 'Paused'}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500 animate-ping' : 'bg-gray-600'}`} />
                {isRecording ? 'Live Audio Capture Active' : 'Recording Paused'}
              </div>
            </div>
          )}

          {/* Live Waveform (FR-05/06) */}
          {micGranted && (
            <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 flex flex-col items-center justify-center min-h-[200px]">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5 text-left w-full">
                Live Voice Waveform - Real Microphone Input
              </h3>
              <div className="flex items-end justify-center gap-1 h-24 w-full px-4">
                {waveformBars.map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`flex-1 rounded-full transition-all duration-75 ${isRecording ? 'bg-[#a8b88c]' : 'bg-gray-700'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Noise Level Gauge (FR-09) */}
          {micGranted && (
            <div className={`bg-[#252525] rounded-xl p-5 border transition ${noiseWarning ? 'border-red-500/50 bg-red-900/5' : 'border-gray-800'} flex items-center justify-between`}>
              <div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Real-Time Noise Level Validation
                </h3>
                <p className={`text-xs ${noiseWarning ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                  {noiseWarning
                    ? `⚠ Warning: Noise exceeds acceptable threshold (>${NOISE_THRESHOLD_DB} dB) - audio quality may affect transcription`
                    : `Audio within optimal range (<${NOISE_THRESHOLD_DB} dB) - suitable for transcription`}
                </p>
                {audioFormat && (
                  <p className="text-gray-600 text-xs mt-1">
                    Audio format: PCM · {audioFormat.sampleRate / 1000}kHz · Mono
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center min-w-[90px]">
                <span className={`text-3xl font-extrabold ${noiseWarning ? 'text-red-400' : 'text-[#d4a843]'}`}>
                  {currentNoiseDb}
                </span>
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">dB Level</span>
                <div className="w-20 bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (currentNoiseDb / 99) * 100)}%` }}
                    className={`h-full rounded-full transition-all duration-150 ${noiseWarning ? 'bg-red-500' : 'bg-[#d4a843]'}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Questions Progress */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-semibold">Session Questions</h3>
              <span className="text-gray-500 text-xs">{activeQuestionIdx + 1} / {sessionQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-4 overflow-hidden">
              <div
                style={{ width: `${((activeQuestionIdx + 1) / sessionQuestions.length) * 100}%` }}
                className="bg-[#a8b88c] h-full rounded-full transition-all duration-300"
              />
            </div>
            <div className="space-y-2.5">
              {sessionQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    activeQuestionIdx === idx
                      ? 'bg-[#a8b88c]/10 border-[#a8b88c] text-white font-medium'
                      : idx < activeQuestionIdx
                      ? 'bg-[#1e1e1e] border-gray-800 text-gray-600 line-through'
                      : 'bg-[#1e1e1e] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {idx + 1}. {q.question_text.length > 70 ? q.question_text.slice(0, 70) + '…' : q.question_text}
                </div>
              ))}
            </div>
            {activeQuestionIdx < sessionQuestions.length - 1 && (
              <button
                onClick={() => setActiveQuestionIdx((i) => i + 1)}
                className="w-full mt-3 py-2 bg-[#2a2a2a] border border-gray-700 text-gray-300 text-xs font-semibold rounded-lg hover:border-gray-600 transition flex items-center justify-center gap-1.5"
              >
                Next Question <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hardware Status */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 space-y-3">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Diagnostics</h3>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {micGranted
                ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
              <span>{micGranted ? 'Microphone Active' : 'Microphone Not Connected'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Web Audio API: Ready</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Server className="w-4 h-4 text-green-400" />
              <span>MediaRecorder: {mediaRecorderRef.current ? mediaRecorderRef.current.state : 'Standby'}</span>
            </div>

            {!micGranted && !micError && (
              <button
                onClick={initMicrophone}
                className="w-full mt-1 py-2.5 bg-[#a8b88c] text-gray-900 font-semibold rounded-lg text-xs hover:bg-[#98a87c] transition"
              >
                Start Live Recording
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
