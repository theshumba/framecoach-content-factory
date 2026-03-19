import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Film, CheckCircle, Clock, Zap, TrendingUp, Plus, Send, BarChart3,
  Flame, ExternalLink,
} from 'lucide-react';
import { getStats, getContent, getRecentActivity, getAnalytics } from '../store/contentStore';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PlatformIcon, { PLATFORM_COLORS } from '../components/PlatformIcon';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#141414',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  color: '#f7f7f7',
  fontSize: 12,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = useMemo(() => getStats(), []);
  const activity = useMemo(() => getRecentActivity(), []);
  const analytics = useMemo(() => getAnalytics(), []);
  const allContent = useMemo(() => getContent(), []);

  // Posting streak — consecutive days with posts
  const streak = useMemo(() => {
    const postedDates = new Set(
      allContent
        .filter(i => i.datePosted)
        .map(i => i.datePosted.split('T')[0])
    );
    let count = 0;
    let day = new Date();
    while (true) {
      const key = day.toISOString().split('T')[0];
      if (!postedDates.has(key)) break;
      count++;
      day.setDate(day.getDate() - 1);
    }
    return count;
  }, [allContent]);

  // Last 7 days heatmap
  const heatmapDays = useMemo(() => {
    const postedDates = {};
    allContent
      .filter(i => i.datePosted)
      .forEach(i => {
        const key = i.datePosted.split('T')[0];
        postedDates[key] = (postedDates[key] || 0) + 1;
      });

    return Array.from({ length: 14 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - i));
      const key = day.toISOString().split('T')[0];
      return {
        date: key,
        count: postedDates[key] || 0,
        label: day.toLocaleDateString('en', { weekday: 'short' }),
      };
    });
  }, [allContent]);

  const getHeatColor = (count) => {
    if (count === 0) return '#1C1C1C';
    if (count === 1) return '#7f1213';
    if (count === 2) return '#b31b1d';
    return '#E32326';
  };

  const progressPct = Math.round((stats.posted / Math.max(stats.total, 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#f7f7f7] text-2xl font-bold">Dashboard</h1>
          <p className="text-[#8E8E8E] text-sm mt-0.5">FrameCoach Content Overview</p>
        </div>
        <button
          onClick={() => navigate('/gallery')}
          className="flex items-center gap-2 px-4 py-2 bg-[#E32326] hover:bg-[#B91C1F] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Batch
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Content"
          value={stats.total}
          sub="All generated pieces"
          icon={Film}
          accent="#E32326"
        />
        <StatCard
          label="Posted"
          value={stats.posted}
          sub={`${progressPct}% of total`}
          icon={CheckCircle}
          accent="#22C55E"
        />
        <StatCard
          label="Pending"
          value={stats.pending + stats.scheduled}
          sub={`${stats.scheduled} scheduled`}
          icon={Clock}
          accent="#F59E0B"
        />
        <StatCard
          label="Performance Score"
          value={`${stats.performanceScore}/100`}
          sub={`${stats.avgEngagement}% avg engagement`}
          icon={Zap}
          accent="#E32326"
        />
      </div>

      {/* Progress bar */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#f7f7f7] text-sm font-medium">Posting Progress</span>
          <span className="text-[#8E8E8E] text-sm">{stats.posted} of {stats.total} posted</span>
        </div>
        <div className="h-2 bg-[#1C1C1C] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E32326] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[#8E8E8E] text-xs">{progressPct}% complete</span>
          <span className="text-[#8E8E8E] text-xs">{stats.total - stats.posted} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#f7f7f7] text-sm font-semibold">Recent Activity</h2>
            <button
              onClick={() => navigate('/tracker')}
              className="text-[#E32326] text-xs hover:underline flex items-center gap-1"
            >
              View all <ExternalLink size={11} />
            </button>
          </div>
          <div className="space-y-3">
            {activity.slice(0, 7).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <PlatformIcon platform={item.platform} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#f7f7f7] text-sm truncate">{item.text}</div>
                  <div className="text-[#8E8E8E] text-xs mt-0.5">{timeAgo(item.time)}</div>
                </div>
                <StatusBadge status={item.status} showDot={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Streak */}
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={16} className="text-[#E32326]" />
              <span className="text-[#f7f7f7] text-sm font-semibold">Posting Streak</span>
            </div>
            <div className="text-5xl font-black text-[#E32326] mb-1">{streak}</div>
            <div className="text-[#8E8E8E] text-xs mb-4">consecutive days</div>
            <div className="flex gap-1 flex-wrap">
              {heatmapDays.map((d) => (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <div
                    className="w-5 h-5 rounded-sm"
                    style={{ backgroundColor: getHeatColor(d.count) }}
                    title={`${d.date}: ${d.count} post(s)`}
                  />
                  <span className="text-[#2A2A2A] text-[9px]">{d.label[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
            <h2 className="text-[#f7f7f7] text-sm font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/gallery')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#E32326]/10 hover:bg-[#E32326]/20 border border-[#E32326]/20 text-[#E32326] text-sm font-medium transition-colors"
              >
                <Plus size={15} /> Generate New Batch
              </button>
              <button
                onClick={() => navigate('/tracker')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1C1C1C] hover:bg-[#242424] border border-[#2A2A2A] text-[#f7f7f7] text-sm transition-colors"
              >
                <Send size={15} className="text-[#8E8E8E]" /> Post Next Content
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1C1C1C] hover:bg-[#242424] border border-[#2A2A2A] text-[#f7f7f7] text-sm transition-colors"
              >
                <BarChart3 size={15} className="text-[#8E8E8E]" /> View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#E32326]" />
            <h2 className="text-[#f7f7f7] text-sm font-semibold">Platform Breakdown</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analytics.platformData.map(p => ({ ...p, value: p.count }))}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {analytics.platformData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PLATFORM_COLORS[entry.name] || '#8E8E8E'}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: '#8E8E8E', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly posting activity */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#E32326]" />
            <h2 className="text-[#f7f7f7] text-sm font-semibold">Weekly Posting Activity</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.weeklyData} barSize={20}>
              <XAxis
                dataKey="week"
                tick={{ fill: '#8E8E8E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8E8E8E', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} cursor={{ fill: '#1C1C1C' }} />
              <Bar dataKey="posted" fill="#E32326" radius={[4, 4, 0, 0]} name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
