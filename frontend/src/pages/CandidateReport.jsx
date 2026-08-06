import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Download, AlertCircle, ThumbsUp, ShieldCheck, Target, User } from 'lucide-react';
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
import { dummyCandidates, dummyBehavioralScores, dummyInterviewSessions } from '../lib/dummyData';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CandidateReport = () => {
  const { id } = useParams();

  const candidate = dummyCandidates.find((c) => c.id === id) || dummyCandidates[0];
  const session = dummyInterviewSessions.find((s) => s.candidate_id === candidate.id) || dummyInterviewSessions[0];
  const scores = dummyBehavioralScores[session.id] || { honesty: 94, attitude: 89, confidence: 88, relevance: 91, overall: 90 };

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
            <h1 className="text-xl font-bold text-white">{candidate.full_name}</h1>
            <p className="text-gray-400 text-xs mt-0.5">{candidate.position}</p>
            <p className="text-gray-500 text-xs mt-1">
              Interview Date: April 22 2026 | {session.position} {session.round}
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

      {/* Evaluation Summary Grid */}
      <h2 className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-4">Evaluation Summary</h2>

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

        <button className="flex items-center gap-2 px-6 py-3 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-bold text-sm rounded-lg transition shadow-lg">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>
    </div>
  );
};

export default CandidateReport;
