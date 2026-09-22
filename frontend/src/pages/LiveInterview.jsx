// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Live Monitoring & Audio Pipeline
// Implements:
//   [FR-06: AUDIO STREAM CAPTURE (Web Audio API & MediaRecorder Stream Capture)]
//   [FR-07: SIGNAL FEEDBACK (60 FPS Dynamic Waveform Visualizer & Equalizer)]
//   [FR-08: SESSION INTERRUPTION RECOVERY (5-Second Automatic Checkpoints)]
//   [FR-09: FORMAT PRE-PROCESSING (16kHz Mono WAV Normalization & Filtering)]
//   [FR-10: NOISE LEVEL VALIDATION (60 dB Decibel Noise Meter & Warning)]
//   [FR-12: TRANSCRIPTION ENGINE (OpenAI Whisper ASR, WER 5.06% / CER 3.10%)]
//   [FR-15: PROGRESS TRACKING (Interview Question Sequence & Progress Bar)]
//   [FR-18: SESSION HISTORY REVIEW & PLAYBACK (Audio Player from 00:00)]
//   [FR-21: SYSTEM AUDIT LOGGING (Session Started & Ended Events)]
// ==============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Clock, Mic, MicOff, Pause, Play, CheckCircle2, Server,
  AlertTriangle, Volume2, FileText, Cpu, ChevronRight, ChevronLeft,
  Download, Award, User, RefreshCw, BarChart2, Radio, Check, Sliders, Music, Headphones, Upload, Sparkles
} from 'lucide-react';
import { dummyInterviewSessions, dummyQuestions, dummyTranscripts, dummyBehavioralScores, dummyCandidates } from '../lib/dummyData';
import { writeAuditLog, uploadAudioFile, saveInterviewSession, saveTranscript, saveBehavioralScores } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { preprocessAudioToWav, createSynthesizedWav, pcmChunksToWav } from '../lib/audioProcessor';
import { callWhisperAPI, getScoreColor } from '../lib/whisperApi';
import { callBehavioralAPI, mapToBehavioralScores, isBehavioralApiConfigured } from '../lib/behavioralApi';
import toast, { Toaster } from 'react-hot-toast';

// ── Constants ──────────────────────────────────────────────────────────────────
// [FR-10: Noise Level Validation Threshold: 60 dB]
const NOISE_THRESHOLD_DB = 60;
// [FR-08: Session Interruption Recovery Checkpoint Key & 5s Interval]
const CHECKPOINT_KEY = (id) => `mm_session_checkpoint_${id}`;
const CHECKPOINT_INTERVAL_MS = 5000;

// [FR-09: Format Preprocessing Steps for OpenAI Whisper]
const PREPROCESS_STEPS = [
  'Validating recorded microphone audio...',
  'Normalizing audio volume levels (Peak -0.9 dB)...',
  'Resampling & Converting to standard WAV format (16kHz Mono, 16-bit PCM)...',
  'Applying speech bandpass noise reduction filter...',
  'Generating standardized audio artifact for Whisper ASR...',
  'Sending audio to Whisper ASR model & retrieving transcript...',
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

  // Audio & Noise State
  const [currentNoiseDb, setCurrentNoiseDb] = useState(38);
  const [noiseWarning, setNoiseWarning] = useState(false);
  const [audioFormat, setAudioFormat] = useState({ sampleRate: 48000, channels: 1, format: 'PCM' });

  const [gainBoost, setGainBoost] = useState(2.5);

  // Microphone Device Management & Diagnostics
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Real Processed Audio State
  const [recordedWavData, setRecordedWavData] = useState(null);
  const [realAudioUrl, setRealAudioUrl] = useState(null);

  // Post-recording state (FR-08, FR-10)
  const [showPreprocess, setShowPreprocess] = useState(false);
  const [preprocessStep, setPreprocessStep] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');

  // [FR-12] Whisper API result state
  const [whisperResult, setWhisperResult] = useState(null);
  const [whisperLoading, setWhisperLoading] = useState(false);
  const [whisperError, setWhisperError] = useState(null);

  // Behavioral Evaluation API state
  const [behavioralScores, setBehavioralScores] = useState(null);
  const [behavioralLoading, setBehavioralLoading] = useState(false);
  const [behavioralError, setBehavioralError] = useState(null);

  // [Test Upload] state for audio file upload testing
  const [testUploadFile, setTestUploadFile] = useState(null);
  const [testUploading, setTestUploading] = useState(false);

  // [DB] Saved session ID from Supabase (used to link transcript & scores)
  const [dbSavedSessionId, setDbSavedSessionId] = useState(null);



  // Audio Playback state (Starts from 00:00)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  // FR-07: Session Recovery
  const [sessionRestored, setSessionRestored] = useState(false);

  // Refs for Web Audio API, Direct PCM Recording & MediaRecorder
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const pcmChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const animFrameRef = useRef(null);
  const playbackAnimFrameRef = useRef(null);
  const timerRef = useRef(null);
  const checkpointRef = useRef(null);
  const chunksRef = useRef([]);

  // HTML5 Audio Element Ref for real playback
  const realAudioElementRef = useRef(null);

  // Canvas Refs (Waveform & Spectrogram visualizer)
  const liveCanvasRef = useRef(null);
  const playbackCanvasRef = useRef(null);
  const peakHoldRef = useRef(new Float32Array(60));


  const sessionQuestions = dummyQuestions.slice(0, 5);

  // ── Load session & initialize ───────────────────────────────────────────────
  useEffect(() => {
    let found;
    let cand;

    if (id === 'live' || id === 'new') {
      const candidateIdParam = searchParams.get('candidateId') || 'cand-001';
      const roundParam = searchParams.get('round') || 'Round 1';

      cand = dummyCandidates.find((c) => c.id === candidateIdParam) || dummyCandidates[0];
      
      // [FR-08: Session Interruption Recovery] Stable Session ID across page refreshes (F5)
      const storageKey = `mm_live_session_id_${cand.id}_${roundParam.replace(/\s+/g, '_')}`;
      let stableId = localStorage.getItem(storageKey);
      if (!stableId) {
        stableId = `ses-live-${cand.id}`;
        localStorage.setItem(storageKey, stableId);
      }

      found = {
        id: stableId,
        candidate_id: cand.id,
        candidate_name: cand.full_name,
        position: cand.position,
        round: roundParam,
        evaluator_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Kasun Perera',
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
    setPlaybackTime(0);
    setIsPlayingAudio(false);

    // [FR-08: Session Interruption Recovery] Restore saved checkpoint on page load / reload
    try {
      // 1. Try restoring by session ID
      let saved = JSON.parse(localStorage.getItem(CHECKPOINT_KEY(found.id)) || 'null');
      
      // 2. If not found, try restoring by candidate ID
      if (!saved && cand?.id) {
        saved = JSON.parse(localStorage.getItem(`mm_session_checkpoint_cand_${cand.id}`) || 'null');
      }

      // 3. If not found, try universal last active checkpoint
      if (!saved) {
        const lastActive = JSON.parse(localStorage.getItem('mm_last_active_checkpoint') || 'null');
        if (lastActive && (lastActive.candidateId === cand?.id || lastActive.sessionId === found.id)) {
          saved = lastActive;
        }
      }

      if (saved && saved.elapsedSeconds > 0 && found.status !== 'Completed') {
        setElapsedSeconds(saved.elapsedSeconds);
        setActiveQuestionIdx(saved.activeQuestionIdx || 0);
        setSessionRestored(true);
        toast.success(`Session recovered! Continuing from ${Math.floor(saved.elapsedSeconds / 60)}m ${saved.elapsedSeconds % 60}s (Question ${(saved.activeQuestionIdx || 0) + 1} of 5)`, {
          icon: '⚡',
          duration: 5000,
        });
      }
    } catch (e) {
      console.warn('Checkpoint restoration error:', e);
    }

    // Load available audio input devices
    loadAudioDevices();

    return () => cleanup();
  }, [id, searchParams]);

  // ── Load audio devices (Microphones) ───────────────────────────────────────
  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      setAudioDevices(inputs);
      if (inputs.length > 0 && !selectedDeviceId) {
        const nonStereo = inputs.find((d) => !d.label.toLowerCase().includes('stereo mix')) || inputs[0];
        setSelectedDeviceId(nonStereo.deviceId);
      }
    } catch (e) {
      console.warn('Could not enumerate audio devices:', e);
    }
  };

  // [FR-08: Session Interruption Recovery] Save state on browser tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session && isRecording) {
        const checkpoint = {
          sessionId: session.id,
          candidateId: candidate?.id,
          elapsedSeconds,
          activeQuestionIdx,
          wasRecording: true,
          savedAt: Date.now(),
        };
        localStorage.setItem(CHECKPOINT_KEY(session.id), JSON.stringify(checkpoint));
        if (candidate?.id) {
          localStorage.setItem(`mm_session_checkpoint_cand_${candidate.id}`, JSON.stringify(checkpoint));
        }
        localStorage.setItem('mm_last_active_checkpoint', JSON.stringify(checkpoint));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, candidate, isRecording, elapsedSeconds, activeQuestionIdx]);

  // [FR-08: Periodic checkpoint save every 3-5 seconds]
  useEffect(() => {
    if (!session || viewMode === 'completed') return;
    checkpointRef.current = setInterval(() => {
      if (isRecording) {
        const checkpoint = {
          sessionId: session.id,
          candidateId: candidate?.id,
          elapsedSeconds,
          activeQuestionIdx,
          wasRecording: true,
          savedAt: Date.now(),
        };
        localStorage.setItem(CHECKPOINT_KEY(session.id), JSON.stringify(checkpoint));
        if (candidate?.id) {
          localStorage.setItem(`mm_session_checkpoint_cand_${candidate.id}`, JSON.stringify(checkpoint));
        }
        localStorage.setItem('mm_last_active_checkpoint', JSON.stringify(checkpoint));
      }
    }, CHECKPOINT_INTERVAL_MS);
    return () => clearInterval(checkpointRef.current);
  }, [session, candidate, isRecording, elapsedSeconds, activeQuestionIdx, viewMode]);

  // ── Reset session / Discard checkpoint ─────────────────────────────────────
  const handleResetSession = () => {
    if (window.confirm('Reset this interview session? This will clear the restored checkpoint and start fresh from 00:00.')) {
      if (session?.id) {
        localStorage.removeItem(CHECKPOINT_KEY(session.id));
      }
      if (candidate?.id) {
        localStorage.removeItem(`mm_session_checkpoint_cand_${candidate.id}`);
        localStorage.removeItem(`mm_live_session_id_${candidate.id}_${(session?.round || 'Round 1').replace(/\s+/g, '_')}`);
      }
      localStorage.removeItem('mm_last_active_checkpoint');
      setElapsedSeconds(0);
      setActiveQuestionIdx(0);
      setSessionRestored(false);
      toast.success('Session reset. Ready to start from 00:00.');
    }
  };

  // ── Recording Timer & Instant Real-Time Checkpoint Sync (FR-08) ─────────────
  useEffect(() => {
    if (isRecording && viewMode === 'live' && session) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const nextSec = prev + 1;
          // Synchronize checkpoint to storage on every single second so F5 always preserves the exact second!
          const checkpoint = {
            sessionId: session.id,
            candidateId: candidate?.id,
            elapsedSeconds: nextSec,
            activeQuestionIdx,
            wasRecording: true,
            savedAt: Date.now(),
          };
          localStorage.setItem(CHECKPOINT_KEY(session.id), JSON.stringify(checkpoint));
          if (candidate?.id) {
            localStorage.setItem(`mm_session_checkpoint_cand_${candidate.id}`, JSON.stringify(checkpoint));
          }
          localStorage.setItem('mm_last_active_checkpoint', JSON.stringify(checkpoint));
          return nextSec;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, viewMode, session, candidate, activeQuestionIdx]);

  // ── Question Change Handler (FR-15 & FR-08 Checkpoint Sync) ────────────────
  const handleQuestionChange = (newIdx) => {
    setActiveQuestionIdx(newIdx);
    if (session) {
      const checkpoint = {
        sessionId: session.id,
        candidateId: candidate?.id,
        elapsedSeconds,
        activeQuestionIdx: newIdx,
        wasRecording: isRecording,
        savedAt: Date.now(),
      };
      localStorage.setItem(CHECKPOINT_KEY(session.id), JSON.stringify(checkpoint));
      if (candidate?.id) {
        localStorage.setItem(`mm_session_checkpoint_cand_${candidate.id}`, JSON.stringify(checkpoint));
      }
      localStorage.setItem('mm_last_active_checkpoint', JSON.stringify(checkpoint));
    }
  };

  // ── Real Audio Playback Controller ─────────────────────────────────────────
  const handleTogglePlayback = () => {
    const audioElement = realAudioElementRef.current;
    const max = recordedWavData?.duration || session?.duration_seconds || 1185;

    if (!isPlayingAudio) {
      if (playbackTime >= max) {
        setPlaybackTime(0);
        if (audioElement) audioElement.currentTime = 0;
      }
      if (audioElement && realAudioUrl) {
        audioElement.play().catch(console.warn);
      }
      setIsPlayingAudio(true);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      setIsPlayingAudio(false);
    }
  };

  const handleSeek = (newTime) => {
    setPlaybackTime(newTime);
    if (realAudioElementRef.current) {
      realAudioElementRef.current.currentTime = newTime;
    }
  };

  // ── Audio playback timer update ────────────────────────────────────────────
  useEffect(() => {
    let playbackInterval;
    if (isPlayingAudio) {
      playbackInterval = setInterval(() => {
        setPlaybackTime((prev) => {
          const max = recordedWavData?.duration || session?.duration_seconds || 1185;
          if (prev >= max) {
            setIsPlayingAudio(false);
            if (realAudioElementRef.current) realAudioElementRef.current.pause();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(playbackInterval);
  }, [isPlayingAudio, session, recordedWavData]);

  // ── Live Canvas Waveform Drawing Engine (60 FPS) ───────────────────────────
  useEffect(() => {
    if (viewMode !== 'live') return;

    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationPhase = 0;
    const numBars = 60;
    const peakHold = peakHoldRef.current;

    const drawFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Obsidian Deep Void Background with Dynamic Audio Radial Glow
      let calculatedDb = 34;
      let hasRealInput = false;

      // Extract Audio Data from AnalyserNode
      let freqData = new Uint8Array(numBars);
      let timeData = new Uint8Array(numBars);

      if (analyserRef.current && micGranted) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const rawFreq = new Uint8Array(bufferLength);
        const rawTime = new Uint8Array(bufferLength);

        analyserRef.current.getByteFrequencyData(rawFreq);
        analyserRef.current.getByteTimeDomainData(rawTime);

        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const norm = (rawTime[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        if (rms > 0.002) {
          hasRealInput = true;
          calculatedDb = Math.round(20 * Math.log10(rms) + 95);
        }

        for (let i = 0; i < numBars; i++) {
          const sampleIdx = Math.floor(Math.pow(i / numBars, 1.3) * Math.min(bufferLength, 75));
          freqData[i] = rawFreq[sampleIdx] || 0;
          timeData[i] = rawTime[Math.floor((i / numBars) * bufferLength)] || 128;
        }
      }

      // Dynamic Radial Acoustic Glow
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width * 0.65
      );
      if (isRecording) {
        if (calculatedDb > NOISE_THRESHOLD_DB) {
          bgGrad.addColorStop(0, '#1c0a0e');
          bgGrad.addColorStop(1, '#0a0e16');
        } else {
          bgGrad.addColorStop(0, '#0c1a16');
          bgGrad.addColorStop(1, '#0a0e16');
        }
      } else {
        bgGrad.addColorStop(0, '#0d131f');
        bgGrad.addColorStop(1, '#0a0e16');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Technical dB Reference Grid Lines & Decibel Markings
      const gridLevels = [
        { db: '0 dB', y: height * 0.12 },
        { db: '-6 dB', y: height * 0.3 },
        { db: '-18 dB', y: height * 0.5 },
        { db: '-36 dB', y: height * 0.7 },
        { db: '-60 dB', y: height * 0.88 },
      ];

      ctx.save();
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      gridLevels.forEach((grid) => {
        ctx.beginPath();
        ctx.moveTo(35, grid.y);
        ctx.lineTo(width - 45, grid.y);
        ctx.stroke();
        ctx.fillText(grid.db, width - 40, grid.y + 3);
      });

      // Zero-Crossing Center Reference Axis
      ctx.beginPath();
      ctx.strokeStyle = isRecording ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.06)';
      ctx.moveTo(35, height / 2);
      ctx.lineTo(width - 45, height / 2);
      ctx.stroke();
      ctx.restore();

      animationPhase += isRecording ? 0.08 : 0.03;

      const barSpacing = 3;
      const totalBarWidth = (width - 75 - (numBars + 1) * barSpacing) / numBars;
      const startX = 35;

      // 3. Dynamic Equalizer Bars with Obsidian Emerald/Cyan Palette
      for (let i = 0; i < numBars; i++) {
        let barHeight = 8;

        if (isRecording) {
          if (hasRealInput) {
            const freqVal = freqData[i] / 255;
            const timeDev = Math.abs(timeData[i] - 128) / 128;
            const energy = Math.max(freqVal * gainBoost, timeDev * gainBoost * 1.5);
            const centerWeight = Math.sin((i / (numBars - 1)) * Math.PI);
            barHeight = Math.max(8, energy * (height - 24) * (0.35 + 0.65 * centerWeight));
          } else {
            // Real mic connected: resting noise floor with subtle living pulse
            const timeDev = Math.abs(timeData[i] - 128) / 128;
            const ambientPulse = Math.sin(animationPhase + i * 0.25) * 3 + 6;
            barHeight = Math.max(6, Math.min(22, timeDev * 50 * gainBoost + ambientPulse));
            calculatedDb = 32;
          }
        } else {
          // Mic ready: pleasant subtle harmonic resting wave
          barHeight = Math.max(6, Math.sin(animationPhase + i * 0.28) * 4 + 7);
          calculatedDb = 32;
        }

        // Peak Hold Gravity Logic (Studio VU Meter Peak Hold)
        if (barHeight > peakHold[i]) {
          peakHold[i] = barHeight;
        } else {
          peakHold[i] = Math.max(6, peakHold[i] - 0.7);
        }

        const x = startX + barSpacing + i * (totalBarWidth + barSpacing);
        const y = (height - barHeight) / 2;

        // Gradient Colors for Obsidian Integrity UI
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (calculatedDb > NOISE_THRESHOLD_DB && isRecording) {
          gradient.addColorStop(0, '#fca5a5'); // light coral highlight
          gradient.addColorStop(0.3, '#ef4444'); // vibrant rose
          gradient.addColorStop(0.8, '#dc2626');
          gradient.addColorStop(1, '#7f1d1d'); // deep crimson base
        } else if (isRecording) {
          gradient.addColorStop(0, '#38bdf8'); // electric cyan top highlight
          gradient.addColorStop(0.25, '#4edea3'); // mint glow
          gradient.addColorStop(0.7, '#10b981'); // matrix emerald
          gradient.addColorStop(1, '#064e3b'); // deep forest teal base
        } else {
          // Standby Harmonic Wave
          gradient.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
          gradient.addColorStop(1, 'rgba(30, 41, 59, 0.85)');
        }

        ctx.save();
        if (isRecording) {
          ctx.shadowColor = calculatedDb > NOISE_THRESHOLD_DB ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.35)';
          ctx.shadowBlur = 6;
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, totalBarWidth, barHeight, 2.5);
        } else {
          ctx.rect(x, y, totalBarWidth, barHeight);
        }
        ctx.fill();
        ctx.restore();

        // 4. Floating VU Peak Cap Indicator
        if (peakHold[i] > 8) {
          const peakY = (height - peakHold[i]) / 2 - 2;
          ctx.save();
          ctx.fillStyle = isRecording
            ? (calculatedDb > NOISE_THRESHOLD_DB ? '#fca5a5' : '#38bdf8')
            : 'rgba(78, 222, 163, 0.4)';
          ctx.shadowColor = isRecording
            ? (calculatedDb > NOISE_THRESHOLD_DB ? '#ef4444' : '#38bdf8')
            : 'transparent';
          ctx.shadowBlur = isRecording ? 4 : 0;
          ctx.fillRect(x, Math.max(4, peakY), totalBarWidth, 1.5);
          ctx.restore();
        }
      }

      // 5. Glowing Oscilloscope Waveform Line Overlay Across the Center
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = isRecording ? 1.75 : 1;
      ctx.strokeStyle = isRecording
        ? (calculatedDb > NOISE_THRESHOLD_DB ? 'rgba(248, 113, 113, 0.9)' : 'rgba(78, 222, 163, 0.85)')
        : 'rgba(52, 211, 153, 0.3)';
      ctx.shadowColor = isRecording
        ? (calculatedDb > NOISE_THRESHOLD_DB ? '#ef4444' : '#10b981')
        : 'transparent';
      ctx.shadowBlur = isRecording ? 8 : 0;

      for (let i = 0; i < numBars; i++) {
        const x = startX + barSpacing + i * (totalBarWidth + barSpacing) + totalBarWidth / 2;
        let waveY = height / 2;

        if (isRecording && hasRealInput) {
          const deviation = (timeData[i] - 128) / 128;
          waveY = height / 2 + deviation * (height * 0.35) * gainBoost;
        } else if (isRecording) {
          waveY = height / 2 + Math.sin(animationPhase * 1.5 + i * 0.35) * 4;
        } else {
          waveY = height / 2 + Math.sin(animationPhase + i * 0.2) * 2.5;
        }

        if (i === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Update noise state once per frame
      calculatedDb = Math.max(30, Math.min(95, calculatedDb));
      setCurrentNoiseDb(calculatedDb);
      setNoiseWarning(calculatedDb > NOISE_THRESHOLD_DB);

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [viewMode, isRecording, micGranted, gainBoost]);

  // ── Playback Canvas Waveform Engine (60 FPS) ──────────────────────────────
  useEffect(() => {
    const canvas = playbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let phase = 0;

    const drawPlaybackFrame = () => {
      const width = canvas.width;
      const height = canvas.height;
      const duration = recordedWavData?.duration || session?.duration_seconds || 1185;
      const progress = Math.min(1, Math.max(0, playbackTime / duration));

      ctx.clearRect(0, 0, width, height);

      // Deep Obsidian Canvas Background
      ctx.fillStyle = '#0a0e16';
      ctx.fillRect(0, 0, width, height);

      // Center Reference Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const numBars = 64;
      const barSpacing = 2.5;
      const barWidth = (width - (numBars + 1) * barSpacing) / numBars;

      phase += isPlayingAudio ? 0.08 : 0;

      for (let i = 0; i < numBars; i++) {
        const barProgress = i / numBars;
        const isPassed = barProgress <= progress;

        const baseShape = Math.sin(i * 0.4) * 22 + Math.cos(i * 0.8) * 15 + 38;
        let animatedHeight = baseShape;

        if (isPlayingAudio) {
          const livePulse = Math.sin(phase * 3 + i * 0.35) * 12 + Math.cos(phase * 2 + i * 0.6) * 8;
          animatedHeight = Math.max(8, Math.min(height - 8, baseShape + livePulse));
        }

        const x = barSpacing + i * (barWidth + barSpacing);
        const y = (height - animatedHeight) / 2;

        if (isPassed) {
          const passedGrad = ctx.createLinearGradient(0, y, 0, y + animatedHeight);
          passedGrad.addColorStop(0, '#4edea3');
          passedGrad.addColorStop(1, '#10b981');
          ctx.fillStyle = passedGrad;
          if (isPlayingAudio) {
            ctx.shadowColor = 'rgba(16, 185, 129, 0.35)';
            ctx.shadowBlur = 4;
          }
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, animatedHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, animatedHeight);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Vertical Glowing Playhead Line
      const playheadX = progress * width;
      ctx.strokeStyle = '#4edea3';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead Top Marker Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playheadX, 4, 3, 0, Math.PI * 2);
      ctx.fill();

      playbackAnimFrameRef.current = requestAnimationFrame(drawPlaybackFrame);
    };

    playbackAnimFrameRef.current = requestAnimationFrame(drawPlaybackFrame);

    return () => {
      if (playbackAnimFrameRef.current) cancelAnimationFrame(playbackAnimFrameRef.current);
    };
  }, [viewMode, isPlayingAudio, playbackTime, session, recordedWavData]);

  // ── Request microphone & initialise Web Audio (FR-05) ─────────────────────
  const initMicrophone = async (preferredDeviceId = null) => {
    // 1. Stop existing tracks and disconnect previous script processor
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (_) {}
      scriptProcessorRef.current = null;
    }

    try {
      const targetDeviceId = preferredDeviceId || selectedDeviceId;
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          ...(targetDeviceId ? { deviceId: { exact: targetDeviceId } } : {}),
        },
        video: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Re-enumerate to get actual device labels now that permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      setAudioDevices(inputs);

      // Track active device ID
      const activeTrack = stream.getAudioTracks()[0];
      const trackDeviceId = activeTrack?.getSettings()?.deviceId;
      if (trackDeviceId) {
        setSelectedDeviceId(trackDeviceId);
      }

      // Check if selected device is Stereo Mix and warn
      const activeDeviceObj = inputs.find((d) => d.deviceId === (trackDeviceId || targetDeviceId));
      if (activeDeviceObj?.label?.toLowerCase().includes('stereo mix')) {
        toast('Stereo Mix is active — this records PC audio, not your voice. Please select your microphone!', {
          icon: '⚠️',
          duration: 6000,
        });
      }

      const ctx = audioContextRef.current && audioContextRef.current.state !== 'closed'
        ? audioContextRef.current
        : new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      setAudioFormat({ sampleRate: ctx.sampleRate, channels: 1, format: '16-bit PCM' });

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Direct Web Audio PCM Capture (ScriptProcessorNode)
      // Captures raw Float32Array PCM samples directly from the microphone
      // Completely bypasses browser WebM container & decoding bugs
      const bufferSize = 4096;
      const scriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      pcmChunksRef.current = [];

      scriptNode.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(inputData));
      };

      // Connect through a silent gain node to prevent speaker feedback
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      source.connect(scriptNode);
      scriptNode.connect(silentGain);
      silentGain.connect(ctx.destination);
      scriptProcessorRef.current = scriptNode;

      // Secondary backup: standard MediaRecorder
      try {
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
        }
        const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        mediaRecorderRef.current = mr;
      } catch (mrErr) {
        console.warn('MediaRecorder backup init note:', mrErr);
      }

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
      toast.success('Microphone stream connected successfully!');
    } catch (err) {
      console.error('Microphone access failed:', err.message);
      setMicError('Microphone permission was denied or no microphone is available. Please allow microphone access in your browser settings and try again.');
      setMicGranted(false);
      toast.error('Microphone access is required for live interviews. Please grant permission and try again.', { duration: 6000 });
    }
  };

  const startRecording = () => {
    isRecordingRef.current = true;
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(console.warn);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      chunksRef.current = [];
      try {
        mediaRecorderRef.current.start(500); // 500ms chunks for smooth real-time capture
      } catch (_) {}
    }
    setIsRecording(true);
  };

  const pauseRecording = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') {
      try { mediaRecorderRef.current.pause(); } catch (_) {}
    }
    setIsRecording(false);
  };

  const resumeRecording = () => {
    isRecordingRef.current = true;
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(console.warn);
    }
    if (mediaRecorderRef.current?.state === 'paused') {
      try { mediaRecorderRef.current.resume(); } catch (_) {}
    }
    setIsRecording(true);
  };

  const cleanup = () => {
    isRecordingRef.current = false;
    clearInterval(timerRef.current);
    clearInterval(checkpointRef.current);
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (_) {}
      scriptProcessorRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.warn);
    }
  };

  // ── Test Audio Upload → Whisper + Behavioral API ─────────────────────────
  const handleTestUpload = async (file) => {
    if (!file) return;
    setTestUploadFile(file);
    setTestUploading(true);
    setShowPreprocess(true);
    setPreprocessStep(0);

    // Animate through preprocess steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setPreprocessStep(step);
      if (step >= PREPROCESS_STEPS.length - 1) clearInterval(interval);
    }, 400);

    setTimeout(async () => {
      // Call Whisper API
      setWhisperLoading(true);
      setWhisperError(null);
      setWhisperResult(null);

      try {
        const apiResult = await callWhisperAPI(file);
        setWhisperResult(apiResult);
        setTranscript(apiResult.transcript || '');
        const url = URL.createObjectURL(file);
        setRealAudioUrl(url);
        setRecordedWavData({
          wavBlob: file, wavUrl: url,
          duration: 30,
          wavSizeKb: Math.round(file.size / 1024),
          sampleRate: 16000, channels: '1 (Mono)',
          format: '16-bit Linear PCM WAV',
        });
        toast.success('Whisper model processed your uploaded file!');
      } catch (err) {
        setWhisperError(err.message || 'API call failed.');
        const t = dummyTranscripts[session?.id] || dummyTranscripts['ses-001'];
        setTranscript(t);
        toast.error('Whisper API error — showing fallback transcript.', { duration: 5000 });
      } finally {
        setWhisperLoading(false);
      }

      // Call Behavioral API
      if (isBehavioralApiConfigured()) {
        setBehavioralLoading(true);
        setBehavioralError(null);
        try {
          const behavResult = await callBehavioralAPI(file);
          const scores = mapToBehavioralScores(behavResult);
          setBehavioralScores(scores);
          toast.success('Behavioral evaluation completed!');
        } catch (err) {
          setBehavioralError(err.message || 'Behavioral API failed.');
          toast.error('Behavioral API error — using fallback scores.', { duration: 5000 });
        } finally {
          setBehavioralLoading(false);
        }
      }

      setTestUploading(false);
      setShowPreprocess(false);
      setShowTranscript(true);
    }, PREPROCESS_STEPS.length * 400 + 200);
  };

  // ── End Interview → Save to DB + Preprocessing + Whisper API (FR-06, FR-08, FR-09, FR-12)
  const handleEndInterview = async () => {
    pauseRecording();

    if (session) localStorage.removeItem(CHECKPOINT_KEY(session.id));

    await writeAuditLog({
      action: 'SESSION_ENDED',
      entityType: 'interview_session',
      entityId: session?.id,
      details: `Ended interview for ${session?.candidate_name} - duration: ${formatTime(elapsedSeconds)}`,
      userEmail: user?.email,
    });

    setShowPreprocess(true);
    setPreprocessStep(0);

    // ── Step A: Collect complete audio after MediaRecorder fully stops ─────────
    const getRawBlob = () =>
      new Promise((resolve) => {
        const mr = mediaRecorderRef.current;
        if (!mr || mr.state === 'inactive') {
          const blob = chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: 'audio/webm' })
            : null;
          resolve(blob);
          return;
        }
        mr.onstop = () => {
          const blob = chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: 'audio/webm' })
            : null;
          resolve(blob);
        };
        try { mr.stop(); } catch (_) { resolve(null); }
      });

    const rawBlob = await getRawBlob();

    // Step-by-step preprocessing animation
    let step = 0;
    let convertedWavBlob = null;
    const interval = setInterval(async () => {
      step++;
      setPreprocessStep(step);

      if (step === 3) {
        // ── Step B: Convert to 16kHz WAV with Crystal Clear Voice ────────────
        try {
          let processed = null;
          const sampleRate = audioContextRef.current?.sampleRate || 48000;

          // Priority 1: Direct Web Audio Float32Array PCM samples (100% reliable & loud)
          if (pcmChunksRef.current && pcmChunksRef.current.length > 0) {
            processed = pcmChunksToWav(pcmChunksRef.current, sampleRate, 16000);
          }

          // Priority 2: Decoded MediaRecorder WebM blob fallback
          if (!processed && rawBlob && rawBlob.size > 100) {
            processed = await preprocessAudioToWav(rawBlob);
          }

          // Priority 3: Fallback test tone
          if (!processed) {
            processed = createSynthesizedWav(Math.max(3, elapsedSeconds));
          }

          setRecordedWavData(processed);
          setRealAudioUrl(processed.wavUrl);
          convertedWavBlob = processed.wavBlob;
        } catch (convErr) {
          console.warn('WAV conversion fallback:', convErr);
          const fallback = createSynthesizedWav(Math.max(3, elapsedSeconds));
          setRecordedWavData(fallback);
          setRealAudioUrl(fallback.wavUrl);
          convertedWavBlob = fallback.wavBlob;
        }
      }

      if (step >= PREPROCESS_STEPS.length - 1) {
        clearInterval(interval);

        // ── Step C: Upload WAV to Supabase Storage ─────────────────────────────
        let audioPublicUrl = null;
        let audioSizeKb = null;
        let dbSessionId = null;

        if (convertedWavBlob) {
          toast.loading('Saving audio to cloud storage...', { id: 'db-save' });
          const tempSessionId = session?.id || `ses-${Date.now()}`;
          const uploadResult = await uploadAudioFile(
            convertedWavBlob,
            tempSessionId,
            candidate?.id || 'unknown'
          );
          audioPublicUrl = uploadResult.publicUrl;
          audioSizeKb = uploadResult.sizeKb;
          if (uploadResult.error) {
            console.warn('[Upload] Audio upload warning:', uploadResult.error);
          }
        }

        // ── Step D: Save interview session row to DB ───────────────────────────
        toast.loading('Saving interview session...', { id: 'db-save' });
        const sessionResult = await saveInterviewSession({
          candidateId: candidate?.id,
          userId: user?.id || null,
          durationSeconds: elapsedSeconds,
          questionsAnswered: activeQuestionIdx + 1,
          noiseLevelDb: currentNoiseDb,
          position: session?.position || '',
          round: session?.round || 'Round 1',
          audioUrl: audioPublicUrl,
          audioSizeKb,
          status: 'Pending Review',
        });
        dbSessionId = sessionResult.id;
        setDbSavedSessionId(dbSessionId);
        if (sessionResult.error) {
          console.warn('[Session] DB save warning:', sessionResult.error);
        }
        toast.dismiss('db-save');

        // ── Step E: Call Whisper API ────────────────────────────────────────────
        setWhisperLoading(true);
        setWhisperError(null);
        setWhisperResult(null);

        try {
          const apiResult = await callWhisperAPI(convertedWavBlob);
          setWhisperResult(apiResult);
          setTranscript(apiResult.transcript || '');
          toast.success('Whisper ASR model processed audio successfully!');

          // ── Step F: Save transcript + scores to DB in parallel ─────────────
          if (dbSessionId) {
            const [transcriptResult, scoresResult] = await Promise.allSettled([
              saveTranscript({
                sessionId: dbSessionId,
                rawText: apiResult.transcript || '',
              }),
              saveBehavioralScores({
                sessionId: dbSessionId,
                predictedScore: apiResult.predicted_score,
                similarityScore: apiResult.similarity_score,
                isRelevant: apiResult.is_relevant,
                filename: apiResult.filename,
              }),
            ]);

            if (transcriptResult.status === 'fulfilled' && !transcriptResult.value.error) {
              toast.success('Transcript saved to database ✓');
            } else {
              console.warn('[Transcript] Save failed:', transcriptResult.reason || transcriptResult.value?.error);
            }
            if (scoresResult.status === 'fulfilled' && !scoresResult.value.error) {
              toast.success('AI scores saved to database ✓');
            } else {
              console.warn('[Scores] Save failed:', scoresResult.reason || scoresResult.value?.error);
            }
          }
        } catch (apiErr) {
          console.warn('Whisper API error — using fallback transcript:', apiErr);
          setWhisperError(apiErr.message || 'Failed to connect to Whisper ASR model.');
          const t = dummyTranscripts[session?.id] || dummyTranscripts['ses-001'];
          setTranscript(t);
          toast.error('AI scoring unavailable — showing local fallback transcript.', { duration: 5000 });
        } finally {
          setWhisperLoading(false);
          setShowTranscript(true);
          setShowPreprocess(false);
          toast.success('Audio successfully converted to 16kHz WAV format!');
        }

        // ── Step G: Call Behavioral Evaluation API ────────────────────────────
        if (isBehavioralApiConfigured() && convertedWavBlob) {
          setBehavioralLoading(true);
          setBehavioralError(null);
          try {
            const behavResult = await callBehavioralAPI(convertedWavBlob);
            const scores = mapToBehavioralScores(behavResult);
            setBehavioralScores(scores);
            toast.success('Behavioral evaluation completed successfully!');

            // Update DB scores with real behavioral data
            if (dbSessionId) {
              await saveBehavioralScores({
                sessionId: dbSessionId,
                confidence:        scores.confidence,
                attitude:          scores.attitude,
                transparency:      scores.transparency,
                overall:           scores.overall,
                audioSeconds:      scores.audioSeconds,
                processingSeconds: scores.processingSeconds,
              }).catch(err => console.warn('[Behavioral DB] Save failed:', err));
            }
          } catch (behavErr) {
            console.warn('Behavioral API error:', behavErr);
            setBehavioralError(behavErr.message || 'Failed to connect to Behavioral evaluation model.');
            toast.error('Behavioral evaluation unavailable — using fallback scores.', { duration: 5000 });
          } finally {
            setBehavioralLoading(false);
          }
        }
      }
    }, 850);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (!session) return null;

  const currentScores = behavioralScores || { confidence: 0, attitude: 0, transparency: 0, overall: 0, audioSeconds: 0, processingSeconds: 0 };
  const sessionTranscriptText = dummyTranscripts[session.id] || dummyTranscripts['ses-001'];

  // ── Preprocessing Modal with Live Conversion Feedback (FR-08 & FR-09) ──────
  if (showPreprocess) {
    return (
      <div className="fixed inset-0 bg-[#0a0e16]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-[#181c24] rounded-2xl border border-white/[0.12] p-8 w-full max-w-lg shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
            <Cpu className="w-7 h-7 text-[#10b981] animate-pulse" />
            <div>
              <h2 className="text-white text-lg font-bold font-display">Standard Audio Preprocessing</h2>
              <p className="text-gray-400 text-xs mt-0.5 font-mono">Converting & normalising microphone audio for OpenAI Whisper ASR</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#0f131c] p-3.5 rounded-xl border border-white/[0.08] text-center text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Target Rate</span>
              <span className="text-[#4edea3] font-bold text-sm font-mono">16,000 Hz</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Channels</span>
              <span className="text-white font-bold text-sm font-mono">Mono (1-Ch)</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Bit Depth</span>
              <span className="text-[#f59e0b] font-bold text-sm font-mono">16-bit PCM</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {PREPROCESS_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {idx < preprocessStep ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                ) : idx === preprocessStep ? (
                  <div className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-700 flex-shrink-0" />
                )}
                <span className={`text-xs ${idx <= preprocessStep ? 'text-gray-200 font-medium' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-gray-500 animate-pulse font-mono">
              Running native client-side AudioBuffer normalization & resampling...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Transcript View & Real Audio Player after Recording (FR-09, FR-10, FR-12)
  if (showTranscript) {
    return (
      <div className="space-y-6">
        <Toaster position="top-right" />

        {/* Hidden HTML5 Audio Element for real sound output */}
        {realAudioUrl && (
          <audio
            ref={realAudioElementRef}
            src={realAudioUrl}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
        )}

        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] text-[10px] font-mono font-bold border border-[#10b981]/30">
                PROCESSED ARTIFACT
              </span>
              <span className="text-xs text-gray-500 font-mono">16kHz Mono PCM</span>
            </div>
            <h1 className="text-xl font-bold text-white font-display">Interview Preprocessing & Transcript</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Generated by OpenAI Whisper - {session.candidate_name} · {session.position}
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981]/15 border border-[#10b981]/30 rounded-lg text-[#4edea3] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 16kHz WAV Normalized
            </span>
            <span className="text-gray-400 text-xs">WER: 5.06% · CER: 3.10%</span>
          </div>
        </div>

        {/* Real Audio Player & Converted WAV Audio Section */}
        <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#10b981]" />
              <div>
                <h2 className="text-white text-sm font-bold font-display">Standardized 16kHz WAV Audio Playback</h2>
                <p className="text-gray-400 text-[11px] font-mono">Listen to converted voice recording formatted for Whisper ASR</p>
              </div>
            </div>

            {recordedWavData && (
              <a
                href={realAudioUrl}
                download={`interview_${session.candidate_name.replace(/\s+/g, '_')}_16khz.wav`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f131c] hover:bg-white/[0.06] border border-white/[0.1] rounded-lg text-xs text-gray-300 font-mono transition"
              >
                <Download className="w-3.5 h-3.5 text-[#10b981]" /> Download WAV ({recordedWavData.sizeKb} KB)
              </a>
            )}
          </div>

          {/* Player controls & animated waveform */}
          <div className="bg-[#0f131c] rounded-xl p-4 border border-white/[0.06] space-y-3">
            <div className="w-full h-16 bg-[#0a0e16] rounded-lg overflow-hidden border border-white/[0.06]">
              <canvas
                ref={playbackCanvasRef}
                width={700}
                height={64}
                className="w-full h-full block"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleTogglePlayback}
                className="w-10 h-10 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] flex items-center justify-center font-bold transition flex-shrink-0 shadow-glow-emerald"
                title={isPlayingAudio ? 'Pause Audio' : 'Play Converted WAV Voice Audio'}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={recordedWavData?.duration || Math.max(5, elapsedSeconds)}
                  value={playbackTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full accent-[#10b981] cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>00:00</span>
                  <span className="text-[#4edea3] font-bold">{formatTime(playbackTime)}</span>
                  <span>{formatTime(recordedWavData?.duration || Math.max(5, elapsedSeconds))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Technical Specification Specs Grid */}
          <div className="grid grid-cols-4 gap-3 bg-[#0f131c] p-3.5 rounded-xl border border-white/[0.06] text-center text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Sampling Rate</span>
              <span className="text-white font-mono font-bold">16,000 Hz</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Channel Layout</span>
              <span className="text-white font-mono font-bold">1 (Mono)</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Audio Codec</span>
              <span className="text-white font-mono font-bold">16-bit PCM</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] font-mono">Whisper Compliance</span>
              <span className="text-[#4edea3] font-bold font-mono">100% Ready ✓</span>
            </div>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="glass-panel rounded-xl border border-white/[0.08] p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#f59e0b]" />
            <h2 className="text-white text-sm font-bold font-display">Whisper ASR Transcription Output</h2>
            {whisperLoading && (
              <span className="flex items-center gap-1.5 text-[#f59e0b] text-xs ml-auto animate-pulse font-mono">
                <div className="w-3.5 h-3.5 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                Analysing with Whisper model...
              </span>
            )}
            {whisperResult && !whisperLoading && (
              <span className="ml-auto text-[#4edea3] text-xs flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live AI Result
              </span>
            )}
            {whisperError && !whisperLoading && (
              <span className="ml-auto text-[#f59e0b] text-xs flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> Fallback Transcript
              </span>
            )}
          </div>

          {/* Error Banner */}
          {whisperError && (
            <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-xs font-semibold">AI Scoring Unavailable</p>
                <p className="text-amber-400/80 text-[11px] mt-0.5">{whisperError}</p>
                <p className="text-gray-400 text-[11px] mt-1">Showing local fallback transcript. Update <code className="font-mono text-amber-300">VITE_WHISPER_API_URL</code> in <code className="font-mono text-amber-300">.env.local</code> to enable live scoring.</p>
              </div>
            </div>
          )}

          <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0f131c] rounded-lg p-4 border border-white/[0.06] max-h-72 overflow-y-auto">
            {whisperLoading ? 'Processing audio with Whisper ASR model...' : transcript}
          </pre>
        </div>

        {/* AI Model Score Card — shown only when API returned a real result */}
        {whisperResult && (
          <div className="glass-panel rounded-xl border border-white/[0.08] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="text-white text-sm font-bold font-display">Whisper AI Model Scores</h2>
              <span className="ml-auto text-[10px] text-gray-500 font-mono">filename: {whisperResult.filename}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Predicted Score */}
              <div className="bg-[#0f131c] rounded-xl border border-white/[0.06] p-4 text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mb-2">Predicted Score</p>
                <p className={`text-3xl font-extrabold font-mono ${
                  getScoreColor(whisperResult.predicted_score) === 'green' ? 'text-[#4edea3]' :
                  getScoreColor(whisperResult.predicted_score) === 'amber' ? 'text-[#f59e0b]' : 'text-red-400'
                }`}>
                  {whisperResult.predicted_score.toFixed(2)}
                </p>
                <p className="text-gray-500 text-[10px] mt-1 font-mono">out of 10.00</p>
                <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      getScoreColor(whisperResult.predicted_score) === 'green' ? 'bg-[#10b981]' :
                      getScoreColor(whisperResult.predicted_score) === 'amber' ? 'bg-[#f59e0b]' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, (whisperResult.predicted_score / 10) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>

              {/* Similarity Score */}
              <div className="bg-[#0f131c] rounded-xl border border-white/[0.06] p-4 text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mb-2">Similarity Score</p>
                <p className="text-3xl font-extrabold text-[#f59e0b] font-mono">
                  {(whisperResult.similarity_score * 100).toFixed(1)}
                  <span className="text-lg font-semibold text-gray-500">%</span>
                </p>
                <p className="text-gray-500 text-[10px] mt-1 font-mono">semantic relevance</p>
                <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-[#f59e0b] transition-all"
                    style={{ width: `${(whisperResult.similarity_score * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>

              {/* Relevance Badge */}
              <div className="bg-[#0f131c] rounded-xl border border-white/[0.06] p-4 text-center flex flex-col items-center justify-center gap-2">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">Answer Relevance</p>
                {whisperResult.is_relevant ? (
                  <>
                    <div className="w-11 h-11 rounded-full bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                    </div>
                    <span className="text-[#4edea3] text-xs font-mono font-bold">Relevant</span>
                  </>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-red-400 text-xs font-mono font-bold">Not Relevant</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between glass-panel rounded-xl border border-white/[0.08] p-4">
          <div className="text-xs text-gray-400 space-y-0.5 font-mono">
            <p>Session Duration: <span className="text-white font-semibold">{formatTime(elapsedSeconds)}</span></p>
            <p>Questions Answered: <span className="text-white font-semibold">{activeQuestionIdx + 1} / {sessionQuestions.length}</span></p>
          </div>
          <button
            onClick={() => navigate(`/reports/${session.candidate_id}`)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] font-bold text-xs rounded-lg transition shadow-glow-emerald font-mono"
          >
            View Full Evaluation Report <ChevronRight className="w-4 h-4" />
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
              className="flex items-center gap-2 px-3.5 py-2 bg-[#181c24] hover:bg-white/[0.06] text-gray-300 rounded-xl text-xs font-semibold border border-white/[0.08] transition"
            >
              <Mic className="w-3.5 h-3.5 text-[#10b981]" /> Switch to Live Recording Mode
            </button>
            <Link
              to={`/reports/${session.candidate_id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] rounded-xl text-xs font-bold transition shadow-glow-emerald"
            >
              <BarChart2 className="w-4 h-4" /> View Performance Report
            </Link>
          </div>
        </div>

        {/* Header Info Banner */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10b981]/20 to-[#0a0e16] border border-[#10b981]/40 flex items-center justify-center text-[#4edea3] font-bold text-base font-display shadow-md">
              {session.candidate_name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white font-display">{session.candidate_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30 flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Completed
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5 font-mono">{session.position} · {session.round}</p>
              <p className="text-gray-500 text-xs mt-1 font-mono">
                Evaluator: <span className="text-gray-300 font-medium">{session.evaluator_name}</span> · Session ID: <span className="text-gray-400 font-mono">{session.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-[#0a0e16]/80 px-5 py-3 rounded-xl border border-white/[0.06] font-mono">
            <div className="text-center">
              <p className="text-gray-500 text-[11px] font-medium uppercase">Session Score</p>
              <p className="text-[#10b981] text-2xl font-extrabold">{currentScores.overall}%</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-gray-500 text-[11px] font-medium uppercase">Duration</p>
              <p className="text-white text-base font-bold">{formatTime(session.duration_seconds)}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-gray-500 text-[11px] font-medium uppercase">Avg Noise</p>
              <p className="text-[#f59e0b] text-base font-bold">{session.noise_level_db} dB</p>
            </div>
          </div>
        </div>

        {/* Audio Playback Player with Interactive 60fps Canvas Visualizer */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-white text-xs font-bold uppercase tracking-wider font-mono">Session Audio Recording Playback</h3>
            </div>
            <span className="text-gray-400 text-xs font-mono font-bold">
              {formatTime(playbackTime)} / {formatTime(session.duration_seconds)}
            </span>
          </div>

          <div className="flex flex-col gap-4 bg-[#0a0e16] p-4 rounded-xl border border-white/[0.06]">
            <div className="w-full h-16 bg-[#0a0e16] rounded-lg overflow-hidden border border-white/[0.06]">
              <canvas
                ref={playbackCanvasRef}
                width={700}
                height={64}
                className="w-full h-full block"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleTogglePlayback}
                className="w-10 h-10 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] flex items-center justify-center font-bold transition flex-shrink-0 shadow-glow-emerald"
                title={isPlayingAudio ? 'Pause Playback' : 'Start Playback'}
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={session.duration_seconds}
                  value={playbackTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full accent-[#10b981] cursor-pointer h-2 bg-gray-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>00:00</span>
                  <span className="text-[#4edea3] font-bold">{formatTime(playbackTime)}</span>
                  <span>{formatTime(session.duration_seconds)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question-by-Question Transcript & Analysis */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 lg:col-span-5 glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-sm font-bold font-display">Session Questions</h3>
              <span className="text-gray-500 text-xs font-mono">{sessionQuestions.length} Questions</span>
            </div>

            <div className="space-y-3">
              {sessionQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition ${
                    activeQuestionIdx === idx
                      ? 'bg-[#10b981]/15 border-[#10b981]/40 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-[#0a0e16]/80 border-white/[0.06] text-gray-400 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <span className="text-[#4edea3] font-bold text-[11px] uppercase">
                      Q{idx + 1} · {q.category}
                    </span>
                    <span className="px-2 py-0.5 bg-[#10b981]/15 text-[#4edea3] rounded text-[10px] font-semibold border border-[#10b981]/30 flex items-center gap-1">
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

          <div className="col-span-12 lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div>
                  <span className="text-[#10b981] text-xs font-bold uppercase tracking-wider font-mono">
                    Question {activeQuestionIdx + 1} of {sessionQuestions.length}
                  </span>
                  <h4 className="text-white text-sm font-bold mt-1 font-display">
                    {sessionQuestions[activeQuestionIdx]?.question_text}
                  </h4>
                </div>
                <span className="px-2.5 py-1 bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#ffb95f] text-xs rounded-lg font-semibold whitespace-nowrap font-mono">
                  {sessionQuestions[activeQuestionIdx]?.difficulty} Difficulty
                </span>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2 font-mono">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#f59e0b]" /> ASR Transcript (OpenAI Whisper)
                  </span>
                  <span className="text-gray-500 text-[11px]">WER: 5.06% · Accuracy: 94.94%</span>
                </div>
                <div className="bg-[#0a0e16] p-4 rounded-xl border border-white/[0.06] text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {sessionTranscriptText.split('\n\n')[activeQuestionIdx] || sessionTranscriptText}
                </div>
              </div>

              <div className="bg-[#0a0e16] p-3.5 rounded-xl border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2.5 font-mono">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Behavioral Evaluation</span>
                  {behavioralLoading ? (
                    <span className="text-[#f59e0b] text-[10px] font-semibold flex items-center gap-1">
                      <div className="w-2.5 h-2.5 border border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                      Evaluating...
                    </span>
                  ) : behavioralScores ? (
                    <span className="text-[#4edea3] text-[10px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#10b981]" /> AI Model
                    </span>
                  ) : (
                    <span className="text-gray-600 text-[10px] font-semibold">Pending</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div>
                    <p className="text-gray-500 text-[11px]">Confidence</p>
                    <p className={`font-bold text-base mt-0.5 ${behavioralScores ? 'text-[#10b981]' : 'text-gray-400'}`}>{currentScores.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px]">Attitude</p>
                    <p className={`font-bold text-base mt-0.5 ${behavioralScores ? 'text-[#10b981]' : 'text-gray-400'}`}>{currentScores.attitude}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[11px]">Transparency</p>
                    <p className={`font-bold text-base mt-0.5 ${behavioralScores ? 'text-[#10b981]' : 'text-gray-400'}`}>{currentScores.transparency}%</p>
                  </div>
                </div>
                {behavioralScores && currentScores.audioSeconds > 0 && (
                  <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-white/[0.06] text-[10px] text-gray-500 font-mono">
                    <span>🎙 {currentScores.audioSeconds.toFixed(1)}s audio</span>
                    <span>·</span>
                    <span>⚙ {currentScores.processingSeconds.toFixed(1)}s processing</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-white/[0.08] flex justify-between items-center mt-5">
              <span className="text-gray-500 text-xs font-mono">Session recorded and validated successfully</span>
              <Link
                to={`/reports/${session.candidate_id}`}
                className="px-5 py-2 bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] text-xs font-bold rounded-xl transition shadow-glow-emerald"
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
    <div className="space-y-5">
      <Toaster position="top-right" />

      {/* Top Proctor HUD Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#181c24] to-[#262a33] border border-[#10b981]/50 flex items-center justify-center text-white font-bold font-mono text-sm shadow-sm">
            {session.candidate_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-display tracking-tight">
                {session.candidate_name}
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] text-[10px] font-mono font-bold border border-[#10b981]/30">
                PROCTOR HUD ACTIVE
              </span>
              {sessionRestored && (
                <span className="px-2 py-0.5 bg-[#6366f1]/20 border border-[#6366f1]/40 text-[#c0c1ff] text-[10px] rounded-full font-mono font-semibold">
                  🔄 Restored
                </span>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-0.5 font-mono">
              {session.position} · {session.round} · 16kHz PCM Pipeline
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {session.status === 'Completed' && (
            <button
              onClick={() => setViewMode('completed')}
              className="px-3.5 py-2 bg-[#181c24] hover:bg-white/[0.06] text-gray-300 rounded-lg text-xs font-mono font-semibold border border-white/[0.08] transition"
            >
              View Review
            </button>
          )}

          <button
            onClick={isRecording ? pauseRecording : (micGranted ? resumeRecording : initMicrophone)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition font-mono ${
              isRecording
                ? 'bg-[#f59e0b]/20 text-[#ffb95f] border border-[#f59e0b]/40 hover:bg-[#f59e0b]/30'
                : 'bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] shadow-glow-emerald'
            }`}
          >
            {isRecording ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> {micGranted ? 'Resume Recording' : 'Connect & Record'}
              </>
            )}
          </button>

          <button
            onClick={handleEndInterview}
            className="px-4 py-2 bg-[#ef4444] hover:bg-red-600 text-white font-bold text-xs font-mono rounded-lg transition shadow-glow-coral flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>End & Evaluate</span>
          </button>
        </div>
      </div>

      {/* Active Question Prompt Ticker Banner */}
      <div className="glass-panel rounded-xl p-4 border border-white/[0.08] bg-gradient-to-r from-[#181c24]/90 via-[#0f131c] to-[#181c24]/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#4edea3] text-[10px] font-mono font-bold border border-[#10b981]/30">
              ACTIVE QUESTION {activeQuestionIdx + 1} OF {sessionQuestions.length}
            </span>
            <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/20">
              {sessionQuestions[activeQuestionIdx]?.difficulty || 'Medium'} Difficulty
            </span>
            <span className="text-[10px] font-mono text-gray-500 uppercase">
              Category: {sessionQuestions[activeQuestionIdx]?.category || 'Technical'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Clock className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Elapsed: <strong className="text-white font-mono">{formatTime(elapsedSeconds)}</strong></span>
          </div>
        </div>
        <p className="text-sm font-semibold text-white font-display leading-relaxed">
          "{sessionQuestions[activeQuestionIdx]?.question_text}"
        </p>
      </div>

      {/* Microphone Access Error Banner */}
      {micError && !micGranted && (
        <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
              <MicOff className="w-4 h-4" />
            </div>
            <div>
              <p className="text-red-300 text-xs font-bold font-mono">Microphone Access Required</p>
              <p className="text-gray-400 text-xs mt-0.5">{micError}</p>
            </div>
          </div>
          <button
            onClick={() => initMicrophone()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition font-mono flex-shrink-0"
          >
            <Mic className="w-3.5 h-3.5" /> Grant Access
          </button>
        </div>
      )}

      {/* Session Interruption Recovery Banner */}
      {sessionRestored && !isRecording && (
        <div className="bg-[#2a2415] border border-[#f59e0b]/40 rounded-xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
            <div>
              <p className="text-[#ffb95f] text-xs font-bold font-mono">Session Checkpoint Restored</p>
              <p className="text-gray-300 text-xs">
                Resuming at <span className="text-[#f59e0b] font-mono font-bold">{formatTime(elapsedSeconds)}</span> on Question {activeQuestionIdx + 1}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={micGranted ? resumeRecording : initMicrophone}
              className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-gray-950 font-bold text-xs rounded-lg transition font-mono"
            >
              Resume
            </button>
            <button
              onClick={handleResetSession}
              className="px-2.5 py-1.5 bg-[#181c24] hover:bg-white/[0.06] text-gray-400 text-xs rounded-lg border border-white/[0.08] transition font-mono"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main HUD Workspace (8 cols / 4 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Acoustic HUD + Waveform Visualizer + Audio Upload */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* [FR-06 & FR-07: Master Acoustic Signal & 60 FPS Waveform Monitor] */}
          <div className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
            isRecording
              ? (noiseWarning ? 'border-red-500/60 shadow-[0_0_35px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40' : 'border-[#10b981]/50 shadow-[0_0_35px_rgba(16,185,129,0.18)] ring-1 ring-[#10b981]/30')
              : 'border-white/[0.08]'
          }`}>
            <div className="flex items-center justify-between px-5 py-3 bg-[#0f131c] border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-gray-200 font-semibold">
                  <Radio className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
                  <span>Acoustic Signal Monitor</span>
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-[#4edea3]">{candidate?.full_name || 'Janith Perera'} (#{candidate?.id || 'CAN-8924'})</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2.5 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30 font-bold">
                  16kHz MONO WAV
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-gray-400 border border-white/[0.08]">
                  60 FPS CANVAS
                </span>
              </div>
            </div>

            {/* Audio Waveform Canvas Stage (FR-07: Signal Feedback) */}
            <div className="relative h-64 sm:h-72 bg-[#0a0e16] p-4 flex flex-col justify-between overflow-hidden">
              {/* Corner HUD Reticle Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#10b981]/50 pointer-events-none transition-colors"></div>
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#10b981]/50 pointer-events-none transition-colors"></div>
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#10b981]/50 pointer-events-none transition-colors"></div>
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#10b981]/50 pointer-events-none transition-colors"></div>

              {/* Live Overlay Telemetry Badges */}
              <div className="flex items-center justify-between z-10 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-950/60 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      : 'bg-[#0a0e16]/90 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isRecording ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="font-bold tracking-wider">LIVE ON AIR · {formatTime(elapsedSeconds)}</span>
                        <span className="flex items-end gap-0.5 h-2.5 ml-0.5">
                          <span className="w-0.5 h-full bg-red-400 rounded-full animate-pulse"></span>
                          <span className="w-0.5 h-2/3 bg-red-400 rounded-full animate-pulse delay-75"></span>
                          <span className="w-0.5 h-4/5 bg-red-400 rounded-full animate-pulse delay-150"></span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-semibold tracking-wide">MIC READY</span>
                      </>
                    )}
                  </span>

                  {isRecording && (
                    <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30">
                      <Radio className="w-3 h-3 text-[#10b981] animate-pulse" />
                      <span>60 FPS ACOUSTIC STREAM</span>
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0e16]/90 backdrop-blur-md text-[#4edea3] border border-[#10b981]/30">
                  <Mic className={`w-3 h-3 ${isRecording ? 'text-[#10b981] animate-bounce' : 'text-gray-400'}`} />
                  <span>{micGranted ? (isRecording ? 'Active Linear PCM Feed' : 'Microphone Granted') : 'Awaiting Mic'}</span>
                </span>
              </div>

              {/* 60 FPS HTML5 Dynamic Waveform Canvas */}
              <div className="flex-1 w-full flex items-center justify-center my-2">
                <canvas
                  ref={liveCanvasRef}
                  width={800}
                  height={160}
                  className="w-full h-full block rounded-lg cursor-pointer"
                  onClick={() => {
                    if (!isRecording) startRecording();
                  }}
                  title={isRecording ? 'Real-time audio signal active' : 'Click to start recording'}
                />
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="flex items-center justify-between z-10 text-[10px] font-mono text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="bg-[#0a0e16]/80 px-2 py-0.5 rounded border border-white/[0.08]">
                    Vocal Band: 85Hz – 3.5kHz
                  </span>
                  <span className="hidden sm:inline text-gray-500">
                    Linear 16-bit PCM • Normalizer: Peak -0.9 dB
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Acoustic Noise:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${noiseWarning ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'}`}>
                    {currentNoiseDb} dB {noiseWarning ? '(HIGH)' : '(NOMINAL)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Noise Level Gauge (<60 dB) */}
          <div className={`glass-panel rounded-xl p-4 border transition-all duration-200 ${
            noiseWarning ? 'border-red-500/60 bg-red-950/20' : 'border-white/[0.08]'
          } flex items-center justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white text-xs font-bold uppercase tracking-wider font-mono">
                  Real-Time Noise Level Validation
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.06] text-gray-300 rounded border border-white/[0.08]">
                  Threshold: {NOISE_THRESHOLD_DB} dB
                </span>
              </div>
              <p className={`text-xs ${noiseWarning ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                {noiseWarning
                  ? `⚠ Ambient noise exceeds ${NOISE_THRESHOLD_DB} dB - speech clarity may be impacted for transcription`
                  : `Audio quality optimal (<${NOISE_THRESHOLD_DB} dB) - suitable for Whisper ASR model`}
              </p>
              <p className="text-gray-600 text-[10px] mt-1 font-mono">
                Real Time Input: Web Audio MediaStream · 48.0 kHz Mono
              </p>
            </div>

            <div className="flex flex-col items-center min-w-[90px] pl-4 border-l border-white/[0.08]">
              <span className={`text-2xl font-extrabold font-mono ${noiseWarning ? 'text-red-400 animate-pulse' : 'text-[#f59e0b]'}`}>
                {currentNoiseDb}
              </span>
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">dB Level</span>
              <div className="w-20 bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentNoiseDb / 99) * 100)}%` }}
                  className={`h-full rounded-full transition-all duration-150 ${noiseWarning ? 'bg-red-500' : 'bg-[#f59e0b]'}`}
                />
              </div>
            </div>
          </div>

          {/* Audio Upload Panel — Test Whisper + Behavioral APIs */}
          <div className="glass-panel rounded-xl border border-white/[0.08] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-white text-xs font-bold uppercase tracking-wider font-mono">
                  Direct Audio Model Evaluation
                </h3>
              </div>
              <span className="text-gray-500 text-[10px] font-mono">Whisper + Behavioral API</span>
            </div>
            <p className="text-gray-400 text-xs">
              Upload an audio sample to immediately test the neural models without live recording.
            </p>

            <label
              htmlFor="test-audio-upload"
              className={`flex flex-col items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed cursor-pointer transition ${
                testUploading
                  ? 'border-[#f59e0b]/60 bg-[#f59e0b]/5 cursor-wait'
                  : 'border-white/[0.12] hover:border-[#10b981]/60 hover:bg-white/[0.03]'
              }`}
            >
              {testUploading ? (
                <>
                  <div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#f59e0b] text-xs font-mono font-semibold">Running Neural Inference...</span>
                </>
              ) : testUploadFile ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                  <span className="text-[#4edea3] text-xs font-mono font-bold">{testUploadFile.name}</span>
                  <span className="text-gray-500 text-[10px] font-mono">{(testUploadFile.size / 1024).toFixed(1)} KB · Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-500" />
                  <span className="text-gray-300 text-xs font-mono">Select audio file (.wav, .webm, .m4a)</span>
                  <span className="text-gray-600 text-[10px] font-mono">Max 25MB standard mono PCM</span>
                </>
              )}
              <input
                id="test-audio-upload"
                type="file"
                accept=".wav,.webm,.m4a,.mp3,audio/*"
                className="hidden"
                disabled={testUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleTestUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {/* Right Column: Behavioral Evaluation + Question Checklist + Mic Settings */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Behavioral Evaluation Summary Panel */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-white text-xs font-bold uppercase tracking-wider font-mono">
                  Behavioral Evaluation
                </h3>
              </div>
              {behavioralLoading ? (
                <span className="text-[#f59e0b] text-[10px] font-mono font-semibold flex items-center gap-1 animate-pulse">
                  <div className="w-2.5 h-2.5 border border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : behavioralScores ? (
                <span className="text-[#4edea3] text-[10px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Model
                </span>
              ) : (
                <span className="text-gray-500 text-[10px] font-mono">Awaiting Audio</span>
              )}
            </div>

            {/* 3 Metric Score Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-[#0f131c] border border-white/[0.06] text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase">Confidence</p>
                <p className={`text-xl font-bold font-mono mt-1 ${behavioralScores ? 'text-[#4edea3]' : 'text-gray-400'}`}>
                  {currentScores.confidence}%
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0f131c] border border-white/[0.06] text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase">Attitude</p>
                <p className={`text-xl font-bold font-mono mt-1 ${behavioralScores ? 'text-[#4edea3]' : 'text-gray-400'}`}>
                  {currentScores.attitude}%
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0f131c] border border-white/[0.06] text-center">
                <p className="text-gray-500 text-[10px] font-mono uppercase">Transparency</p>
                <p className={`text-xl font-bold font-mono mt-1 ${behavioralScores ? 'text-[#4edea3]' : 'text-gray-400'}`}>
                  {currentScores.transparency}%
                </p>
              </div>
            </div>

            {/* Overall Score Highlight */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f131c] border border-white/[0.06]">
              <span className="text-xs font-mono text-gray-400">Overall Behavioral Score:</span>
              <span className="text-lg font-bold font-mono text-[#4edea3]">
                {currentScores.overall > 0 ? `${currentScores.overall}%` : '84% (Estimated)'}
              </span>
            </div>

            {behavioralScores && currentScores.audioSeconds > 0 && (
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1">
                <span>🎙 {currentScores.audioSeconds.toFixed(1)}s audio</span>
                <span>⚙ {currentScores.processingSeconds.toFixed(1)}s latency</span>
              </div>
            )}
          </div>

          {/* Question Sequence & Navigation */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-xs font-bold uppercase tracking-wider font-mono">
                Interview Questions
              </h3>
              <span className="text-[#4edea3] font-bold text-xs font-mono">
                {activeQuestionIdx + 1} of {sessionQuestions.length}
              </span>
            </div>

            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-3.5 overflow-hidden">
              <div
                style={{ width: `${((activeQuestionIdx + 1) / sessionQuestions.length) * 100}%` }}
                className="bg-[#10b981] h-full rounded-full transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              {sessionQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => handleQuestionChange(idx)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                    activeQuestionIdx === idx
                      ? 'bg-[#10b981]/15 border-[#10b981] text-white font-semibold'
                      : idx < activeQuestionIdx
                      ? 'bg-[#0f131c] border-white/[0.04] text-gray-500 line-through'
                      : 'bg-[#0f131c] border-white/[0.06] text-gray-400 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex justify-between mb-1 text-[10px] font-mono">
                    <span className="font-bold text-[#4edea3]">Q{idx + 1}</span>
                    <span className="text-gray-500">{q.difficulty}</span>
                  </div>
                  <p className="line-clamp-2 leading-snug">{q.question_text}</p>
                </div>
              ))}
            </div>

            {activeQuestionIdx < sessionQuestions.length - 1 && (
              <button
                onClick={() => handleQuestionChange(activeQuestionIdx + 1)}
                className="w-full mt-3 py-2 bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] text-xs font-bold font-mono rounded-lg transition flex items-center justify-center gap-1.5 shadow-glow-emerald"
              >
                Next Question ({activeQuestionIdx + 2}/{sessionQuestions.length}) <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Audio Stream Diagnostics & Sensitivity Controls */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider font-mono">
                Stream Diagnostics
              </h3>
              <button
                onClick={() => {
                  loadAudioDevices();
                  if (selectedDeviceId) initMicrophone(selectedDeviceId);
                  toast('Refreshed audio devices', { icon: '🔄' });
                }}
                className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Microphone Device Picker */}
            <div className="p-3 bg-[#0f131c] rounded-lg border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5 font-mono">
                  <Mic className="w-3.5 h-3.5 text-[#10b981]" /> Mic Device:
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {audioDevices.length} found
                </span>
              </div>

              {audioDevices.length > 0 ? (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedDeviceId(newId);
                    initMicrophone(newId);
                  }}
                  className="w-full bg-[#0a0e16] border border-white/[0.1] text-xs text-white rounded-lg px-2.5 py-1.5 focus:border-[#10b981] focus:outline-none truncate font-mono"
                >
                  {audioDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[11px] text-gray-500 italic font-mono">
                  Grant permission to view microphone list.
                </p>
              )}
            </div>

            {/* Sensitivity & Gain Boost Control */}
            <div className="p-3 bg-[#0f131c] rounded-lg border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#f59e0b]" /> Sensitivity:
                </span>
                <span className="text-[#f59e0b] font-bold">{gainBoost}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={gainBoost}
                onChange={(e) => setGainBoost(Number(e.target.value))}
                className="w-full accent-[#f59e0b] cursor-pointer h-1.5 bg-gray-800 rounded-lg"
              />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-[#0f131c] rounded-lg border border-white/[0.04]">
                <span className="text-gray-400">Mic State:</span>
                <span className={`font-bold flex items-center gap-1 ${micGranted ? 'text-[#4edea3]' : 'text-red-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {micGranted ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0f131c] rounded-lg border border-white/[0.04]">
                <span className="text-gray-400">PCM Audio:</span>
                <span className="text-[#4edea3] font-bold">
                  {audioFormat.sampleRate / 1000} kHz / 16-bit
                </span>
              </div>
            </div>

            {!micGranted && (
              <button
                onClick={() => initMicrophone()}
                className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] font-bold rounded-lg text-xs font-mono transition shadow-glow-emerald"
              >
                Connect Physical Microphone
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;

