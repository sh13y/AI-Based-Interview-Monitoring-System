import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Video,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Clock,
  Eye,
  CheckCircle2,
  Cpu,
  Radio,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  dummyDashboardStats,
  dummyWeeklyActivity,
  dummyCandidates,
} from '../lib/dummyData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Top performers
  const topPerformers = dummyCandidates
    .filter((c) => c.status === 'Evaluated')
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // Chart data with Obsidian Integrity emerald and amber accents
  const chartData = {
    labels: dummyWeeklyActivity.labels,
    datasets: [
      {
        label: 'Sessions Completed',
        data: dummyWeeklyActivity.data,
        backgroundColor: dummyWeeklyActivity.data.map((val, idx) =>
          idx === 4 ? '#10b981' : 'rgba(16, 185, 129, 0.45)'
        ),
        hoverBackgroundColor: '#4edea3',
        borderRadius: 6,
        barThickness: 22,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#181c24',
        titleColor: '#dfe2ee',
        bodyColor: '#10b981',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#86948a', font: { family: 'JetBrains Mono', size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#86948a', font: { family: 'JetBrains Mono', size: 10 } },
        border: { display: false },
      },
    },
  };

  // Live in-progress proctor sessions
  const liveSessions = [
    {
      id: 'sess-001',
      candidateName: 'Janith Perera',
      role: 'Senior Full-Stack Engineer',
      gaze: 'Centered (99%)',
      noise: '-42 dB Nominal',
      status: 'VERIFIED NOMINAL',
      time: '14:32',
      integrity: 98,
    },
    {
      id: 'sess-002',
      candidateName: 'Marcus Vance',
      role: 'Lead Cloud Architect',
      gaze: 'Gaze Shift (88%)',
      noise: '-36 dB Optimal',
      status: 'ATTENTION CHECK',
      time: '28:10',
      integrity: 84,
    },
  ];

  // Real-time telemetry alert logs
  const violationAlerts = [
    {
      id: 'alt-1',
      candidate: 'Marcus Vance (#CAN-8924)',
      type: 'Micro-gaze diversion (> 2.4s)',
      severity: 'warning',
      time: '02m ago',
    },
    {
      id: 'alt-2',
      candidate: 'Kavinda Silva (#CAN-7120)',
      type: 'Single person presence re-verified',
      severity: 'nominal',
      time: '07m ago',
    },
    {
      id: 'alt-3',
      candidate: 'Anuki Bandara (#CAN-6031)',
      type: 'Session integrity sealed (Hash #e8f9)',
      severity: 'nominal',
      time: '19m ago',
    },
    {
      id: 'alt-4',
      candidate: 'Dilshan Silva (#CAN-5192)',
      type: 'Background acoustic whisper flagged',
      severity: 'critical',
      time: '45m ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] text-[10px] font-mono font-semibold border border-[#10b981]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-beacon"></span>
              COMMAND CENTER ACTIVE
            </span>
            <span className="text-xs text-gray-500 font-mono">NEURAL CLUSTER: V4.2 PRO</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">
            AI Proctoring & Behavioral Telemetry
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time biometric monitoring, acoustic NLP transcripts, and behavioral trust scoring.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#181c24] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
            {['24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md transition-all ${
                  timeRange === r
                    ? 'bg-[#10b981] text-[#0a0e16] font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <Link
            to="/interviews/sess-001"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-[#0a0e16] font-semibold text-xs transition-all duration-150 shadow-glow-emerald"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Launch Live HUD</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Candidates */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Registered Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono tracking-tight">14,820</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-mono text-[#4edea3] bg-[#10b981]/15 px-1.5 py-0.5 rounded border border-[#10b981]/30">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Across 42 active engineering requisitions</p>
        </div>

        {/* Card 2: Active Interviews */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Active In-Session
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1]">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white font-mono tracking-tight">342</span>
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-beacon"></span>
            </div>
            <span className="text-[11px] font-mono text-gray-400">318 Nominal / 24 Review</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Global concurrent neural telemetry</p>
        </div>

        {/* Card 3: Avg Behavioral Trust Score */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Avg Behavioral Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#4edea3] font-mono tracking-tight">84%</span>
            <span className="text-[10px] font-mono text-gray-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
              CALIBRATED
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Confidence 82% • Attitude 89% • Transp 71%</p>
        </div>

        {/* Card 4: Flagged Violations */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Flagged Anomalies
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#f59e0b] font-mono tracking-tight">19</span>
            <span className="text-[11px] font-mono text-[#ffb95f] bg-[#f59e0b]/15 px-1.5 py-0.5 rounded border border-[#f59e0b]/30">
              -4 vs Yday
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">11 Gaze • 5 Screen • 3 Noise</p>
        </div>
      </div>

      {/* Main Content Grid (65% / 35%) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Chart & Active Live Proctor Matrix */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Weekly Throughput & Integrity Chart */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Weekly Session Volume & Integrity</h3>
                <p className="text-[11px] text-gray-400 font-mono">
                  Daily interview evaluations vs verified behavioral thresholds
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]"></span> Nominal Volume
                </span>
                <span className="text-gray-500">Peak: 38 Completed</span>
              </div>
            </div>
            <div className="h-48 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Active Proctor Matrix (Live HUD Feed Simulation) */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-beacon"></span>
                <h3 className="text-sm font-bold text-white font-display">Live Proctor HUD Matrix</h3>
              </div>
              <Link
                to="/interviews"
                className="text-xs font-mono text-[#10b981] hover:underline flex items-center gap-1"
              >
                View All In-Progress Sessions <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg bg-[#0f131c] border border-white/[0.08] p-3.5 space-y-3 hover:border-white/[0.18] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white font-display">{session.candidateName}</p>
                      <p className="text-[10px] text-gray-400">{session.role}</p>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        session.status === 'VERIFIED NOMINAL'
                          ? 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                          : 'bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {/* Simulated Camera Window with Telemetry Overlay */}
                  <div className="relative h-28 rounded-md bg-[#181c24] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e16]/80 via-transparent to-transparent z-10"></div>
                    
                    {/* Corner Reticle brackets */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#10b981]/70"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#10b981]/70"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#10b981]/70"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#10b981]/70"></div>

                    {/* Candidate Silhouette representation */}
                    <div className="w-12 h-12 rounded-full bg-[#262a33] border border-[#10b981]/40 flex items-center justify-center text-gray-400">
                      <Users className="w-6 h-6 text-[#10b981]" />
                    </div>

                    {/* Overlay telemetry tags */}
                    <div className="absolute top-2 left-3 z-20 flex items-center gap-1.5 text-[9px] font-mono text-[#4edea3]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span>REC {session.time}</span>
                    </div>

                    <div className="absolute bottom-2 left-3 z-20 text-[9px] font-mono text-gray-300">
                      <span>{session.gaze}</span>
                    </div>
                    <div className="absolute bottom-2 right-3 z-20 text-[9px] font-mono text-gray-400">
                      <span>{session.noise}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-gray-400">
                      Integrity Index: <strong className="text-[#4edea3]">{session.integrity}%</strong>
                    </span>
                    <Link
                      to={`/interviews/${session.id}`}
                      className="px-2.5 py-1 rounded bg-[#181c24] hover:bg-[#262a33] text-[11px] font-mono text-gray-200 border border-white/[0.1] hover:border-[#10b981] transition flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#10b981]" /> Proctor Stream
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts Stream & High-Integrity Leaderboard */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Alerts Queue */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" /> Telemetry Alerts
              </h3>
              <span className="text-[10px] font-mono text-gray-500">Live Stream</span>
            </div>

            <div className="space-y-2.5">
              {violationAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-[#0f131c] border border-white/[0.06] hover:border-white/[0.12] transition space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-200 truncate">{alert.candidate}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{alert.time}</span>
                  </div>
                  <p
                    className={`text-[11px] font-mono ${
                      alert.severity === 'critical'
                        ? 'text-red-400'
                        : alert.severity === 'warning'
                        ? 'text-[#ffb95f]'
                        : 'text-[#4edea3]'
                    }`}
                  >
                    {alert.type}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Candidate Leaderboard */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10b981]" /> Top Integrity Leaders
              </h3>
              <Link to="/candidates" className="text-[11px] font-mono text-[#10b981] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {topPerformers.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f131c] border border-white/[0.05] hover:border-[#10b981]/30 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-white/[0.06] text-[10px] font-mono font-bold text-gray-400 flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate font-display">{c.full_name}</p>
                      <p className="text-[10px] text-gray-500 truncate font-mono">{c.position}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold font-mono text-[#4edea3]">{c.score}%</span>
                    <Link
                      to={`/reports/${c.id}`}
                      className="p-1 rounded hover:bg-white/[0.08] text-gray-400 hover:text-white"
                      title="Inspect Candidate Evaluation Report"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

