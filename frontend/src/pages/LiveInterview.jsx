import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Mic, Pause, Play, CheckCircle2, Server, Volume2 } from 'lucide-react';
import { dummyInterviewSessions, dummyQuestions } from '../lib/dummyData';

const LiveInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isRecording, setIsRecording] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(165); // 02:45
  const [currentNoiseDb, setCurrentNoiseDb] = useState(58);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  useEffect(() => {
    const foundSession = dummyInterviewSessions.find((s) => s.id === id) || dummyInterviewSessions[0];
    setSession(foundSession);
  }, [id]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        // Random noise fluctuate around 55-62 dB
        setCurrentNoiseDb(Math.floor(52 + Math.random() * 12));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) return null;

  const sessionQuestions = dummyQuestions.slice(0, 5);

  return (
    <div>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center text-gray-200 font-bold">
            {session.candidate_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {session.candidate_name}
            </h1>
            <p className="text-gray-400 text-xs">{session.position}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className="p-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg border border-gray-700 hover:border-gray-600 transition"
          >
            {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <button
            onClick={() => navigate(`/reports/${session.candidate_id}`)}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition shadow-lg"
          >
            End Interview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Recording View */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Top Bar inside monitor */}
          <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-semibold">
              <Clock className="w-4 h-4 text-[#a8b88c]" />
              <span>{formatTime(elapsedSeconds)}</span>
              <Mic className={`w-4 h-4 ml-2 ${isRecording ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              <span>Live Recording</span>
            </div>
          </div>

          {/* Voice Wave Visualizer */}
          <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 flex flex-col items-center justify-center min-h-[220px]">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6 text-left w-full">
              Live Voice Waves
            </h3>
            <div className="flex items-center justify-center gap-1.5 h-24 w-full px-8">
              {Array.from({ length: 48 }).map((_, i) => {
                const height = isRecording
                  ? Math.sin(i * 0.4 + elapsedSeconds) * 35 + 45 + Math.random() * 20
                  : 8;
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className="w-1.5 bg-[#a8b88c] rounded-full transition-all duration-150 opacity-80"
                  />
                );
              })}
            </div>
          </div>

          {/* Noise Level Gauge */}
          <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Environment Noise
              </h3>
              <p className="text-gray-500 text-xs">
                {currentNoiseDb > 60
                  ? 'Warning: High background noise detected (>60 dB)'
                  : 'Noise levels within optimal parameters (<60 dB)'}
              </p>
            </div>

            <div className="relative w-36 h-24 flex flex-col items-center justify-center bg-[#1e1e1e] rounded-xl border border-gray-800 p-4">
              <span className="text-3xl font-extrabold text-[#d4a843]">{currentNoiseDb}</span>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">dB Level</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Questions & Hardware Status */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-semibold">Questions for this Session</h3>
              <span className="text-gray-500 text-xs">Total: {sessionQuestions.length}</span>
            </div>

            <div className="space-y-3">
              {sessionQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
                    activeQuestionIdx === idx
                      ? 'bg-[#a8b88c]/10 border-[#a8b88c] text-white font-medium'
                      : 'bg-[#1e1e1e] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <p className="line-clamp-2">
                    {idx + 1}. {q.question_text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic status */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Microphone Detected</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Server className="w-4 h-4 text-green-400" />
              <span>Local Server Connection</span>
            </div>

            <button className="w-full mt-2 py-2.5 bg-[#a8b88c] text-gray-900 font-semibold rounded-lg text-xs hover:bg-[#98a87c] transition">
              Proceed to Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
