import React from 'react';
import {
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  dummyDashboardStats,
  dummyWeeklyActivity,
  dummyCandidates,
  dummyBehavioralScores,
  dummyInterviewSessions,
} from '../lib/dummyData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const StatCard = ({ icon: Icon, label, value, color, iconBg }) => (
  <div className="bg-[#252525] rounded-xl p-4 flex items-center gap-4 border border-gray-800/50 hover:border-gray-700 transition-all duration-300 hover:translate-y-[-2px]">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-gray-500 text-xs font-medium">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{value}</p>
    </div>
  </div>
);

const TopPerformer = ({ name, score, rank }) => (
  <div className="bg-[#252525] rounded-xl p-5 text-center border border-gray-800/50 hover:border-[#a8b88c]/30 transition-all duration-300 hover:translate-y-[-2px] flex-1">
    <div className="w-12 h-12 rounded-full bg-[#3a3a3a] border-2 border-gray-600 mx-auto mb-3 flex items-center justify-center">
      <Users className="w-5 h-5 text-gray-400" />
    </div>
    <p className="text-gray-300 text-sm font-medium">{name}</p>
    <p className="text-[#a8b88c] text-2xl font-bold mt-2">{score}%</p>
  </div>
);

const RecentCandidate = ({ name, role, time }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-800/50 last:border-0">
    <div className="w-9 h-9 rounded-full bg-[#3a3a3a] border border-gray-700 flex items-center justify-center flex-shrink-0">
      <Users className="w-4 h-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-200 text-sm font-medium truncate">{name}</p>
      <p className="text-gray-500 text-xs">{role}</p>
    </div>
    <span className="text-gray-500 text-xs whitespace-nowrap">{time}</span>
  </div>
);

const Dashboard = () => {
  const stats = dummyDashboardStats;
  const topPerformers = dummyCandidates
    .filter(c => c.status === 'Evaluated')
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const chartData = {
    labels: dummyWeeklyActivity.labels,
    datasets: [
      {
        data: dummyWeeklyActivity.data,
        backgroundColor: dummyWeeklyActivity.data.map((_, i) => {
          const colors = ['#a8b88c', '#8a9a6e', '#d4a843', '#a8b88c', '#8a9a6e', '#d4a843', '#a8b88c', '#8a9a6e', '#d4a843', '#a8b88c'];
          return colors[i % colors.length];
        }),
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 10 } },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Summary Statistics */}
        <div className="col-span-12 lg:col-span-7">
          <h2 className="text-gray-400 text-sm font-semibold mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <StatCard icon={Users} label="Registered Candidates" value={stats.registeredCandidates} color="text-[#a8b88c]" iconBg="bg-[#a8b88c]/10" />
            <StatCard icon={Clock} label="Pending Evaluations" value={stats.pendingEvaluations} color="text-[#d4a843]" iconBg="bg-[#d4a843]/10" />
            <StatCard icon={CalendarDays} label="Interviews This Week" value={stats.interviewsThisWeek} color="text-blue-400" iconBg="bg-blue-400/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={TrendingUp} label="Average Performance Score" value={`${stats.averagePerformanceScore}%`} color="text-[#a8b88c]" iconBg="bg-[#a8b88c]/10" />
            <StatCard icon={CheckCircle2} label="Completed Sessions" value={stats.completedSessions} color="text-[#a8b88c]" iconBg="bg-[#a8b88c]/10" />
          </div>
        </div>

        {/* Right: Active Interviews */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-gray-400 text-sm font-semibold mb-4">Active Interviews</h2>
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800/50">
            <div className="flex items-center gap-6 mb-5">
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs mb-1">Upcoming Interviews</p>
                <p className="text-white text-2xl font-bold">{stats.upcomingInterviews}</p>
              </div>
              <div className="w-px h-10 bg-gray-700"></div>
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs mb-1">Recent Sessions</p>
                <p className="text-white text-2xl font-bold">{stats.recentSessions}</p>
              </div>
            </div>
            <div className="h-32">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Left: Top Performers */}
        <div className="col-span-12 lg:col-span-7">
          <h2 className="text-gray-400 text-sm font-semibold mb-4">Top Performers</h2>
          <div className="flex gap-4">
            {topPerformers.map((c, i) => (
              <TopPerformer key={c.id} name={c.full_name} score={c.score} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Bottom Right: Recent Candidates */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-gray-400 text-sm font-semibold mb-4">Recent Candidates</h2>
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800/50">
            <RecentCandidate name="Allison Martinez" role="AI Specialist" time="Evaluated Today" />
            <RecentCandidate name="Raj Patel" role="HR Coordinator" time="Evaluated 3h ago" />
            <RecentCandidate name="James Wong" role="Data Analyst" time="Evaluated Yesterday" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
