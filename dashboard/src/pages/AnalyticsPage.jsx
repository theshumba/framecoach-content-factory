import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import {
  Eye, Heart, MessageCircle, Share2, TrendingUp, Award, BarChart3, Clock,
} from 'lucide-react';
import { getStats, getAnalytics } from '../store/contentStore';
import StatCard from '../components/StatCard';
import PlatformIcon, { PLATFORM_COLORS } from '../components/PlatformIcon';

const CHART_STYLE = {
  backgroundColor: '#141414',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  color: '#f7f7f7',
  fontSize: 12,
  padding: '8px 12px',
};

const AXIS_STYLE = { fill: '#8E8E8E', fontSize: 11 };

const BEST_TIMES = [
  { time: '6am', score: 42 },
  { time: '8am', score: 78 },
  { time: '10am', score: 61 },
  { time: '12pm', score: 85 },
  { time: '2pm', score: 70 },
  { time: '4pm', score: 73 },
  { time: '6pm', score: 91 },
  { time: '8pm', score: 88 },
  { time: '10pm', score: 55 },
];

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E32326]/15 text-[#E32326] shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <h2 className="text-[#f7f7f7] text-base font-semibold">{title}</h2>
        {sub && <p className="text-[#8E8E8E] text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const stats = useMemo(() => getStats(), []);
  const analytics = useMemo(() => getAnalytics(), []);

  const topFive = analytics.topContent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#f7f7f7] text-2xl font-bold">Analytics</h1>
        <p className="text-[#8E8E8E] text-sm mt-0.5">Performance insights across all platforms</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          sub="Across all platforms"
          icon={Eye}
          accent="#3B82F6"
        />
        <StatCard
          label="Total Likes"
          value={stats.totalLikes.toLocaleString()}
          sub="Combined engagement"
          icon={Heart}
          accent="#E32326"
        />
        <StatCard
          label="Avg Engagement"
          value={`${stats.avgEngagement}%`}
          sub="Like/view ratio"
          icon={TrendingUp}
          accent="#22C55E"
        />
        <StatCard
          label="Content Posted"
          value={stats.posted}
          sub={`of ${stats.total} total`}
          icon={BarChart3}
          accent="#F59E0B"
        />
      </div>

      {/* Weekly trend */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <div className="mb-4">
          <SectionHeader
            icon={TrendingUp}
            title="Weekly Posting Trend"
            sub="Posts published per week over the last 8 weeks"
          />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={analytics.weeklyData}>
            <CartesianGrid stroke="#2A2A2A" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="week" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={25} />
            <Tooltip contentStyle={CHART_STYLE} cursor={{ stroke: '#2A2A2A', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="posted"
              stroke="#E32326"
              strokeWidth={2.5}
              dot={{ fill: '#E32326', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Posts"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Platform comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="mb-4">
            <SectionHeader
              icon={BarChart3}
              title="Platform Comparison"
              sub="Views and likes by platform"
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.platformData} barGap={6}>
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={40}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              />
              <Tooltip contentStyle={CHART_STYLE} cursor={{ fill: '#1C1C1C' }} />
              <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]} barSize={28}>
                {analytics.platformData.map(entry => (
                  <Cell key={entry.name} fill={PLATFORM_COLORS[entry.name] || '#8E8E8E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Format performance */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="mb-4">
            <SectionHeader
              icon={Award}
              title="Format Performance"
              sub="Average views per format type"
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.formatData} barSize={28}>
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={40}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              />
              <Tooltip contentStyle={CHART_STYLE} cursor={{ fill: '#1C1C1C' }} />
              <Bar dataKey="avgViews" name="Avg Views" fill="#E32326" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 content */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <div className="mb-4">
          <SectionHeader
            icon={Award}
            title="Top Performing Content"
            sub="Ranked by total views"
          />
        </div>
        <div className="space-y-3">
          {topFive.map((item, idx) => {
            const maxViews = topFive[0]?.engagement?.views || 1;
            const pct = Math.round(((item.engagement?.views || 0) / maxViews) * 100);
            return (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1C1C1C] text-[#8E8E8E] text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#f7f7f7] text-sm font-medium truncate mr-4">{item.headline}</span>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-[#8E8E8E]">
                      <span className="flex items-center gap-1">
                        <Eye size={11} className="text-[#3B82F6]" />
                        {item.engagement?.views?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={11} className="text-[#E32326]" />
                        {item.engagement?.likes?.toLocaleString()}
                      </span>
                      <PlatformIcon platform={item.platform} size={12} />
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, #E32326, ${PLATFORM_COLORS[item.platform] || '#E32326'})`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best times + template performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best times (placeholder) */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="mb-4">
            <SectionHeader
              icon={Clock}
              title="Best Times to Post"
              sub="Engagement score by hour (placeholder data)"
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BEST_TIMES} barSize={18}>
              <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={25} domain={[0, 100]} />
              <Tooltip contentStyle={CHART_STYLE} cursor={{ fill: '#1C1C1C' }} />
              <Bar dataKey="score" name="Engagement Score" radius={[4, 4, 0, 0]}>
                {BEST_TIMES.map((entry) => (
                  <Cell
                    key={entry.time}
                    fill={entry.score >= 85 ? '#E32326' : entry.score >= 70 ? '#F59E0B' : '#2A2A2A'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#E32326]" />
              <span className="text-[#8E8E8E] text-xs">Peak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[#8E8E8E] text-xs">Good</span>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
          <div className="mb-4">
            <SectionHeader
              icon={BarChart3}
              title="Category Breakdown"
              sub="Posted content by category"
            />
          </div>
          <div className="space-y-2.5">
            {analytics.categoryData
              .filter(c => c.count > 0)
              .sort((a, b) => b.views - a.views)
              .map((cat, idx) => {
                const maxViews = Math.max(...analytics.categoryData.map(c => c.views), 1);
                const pct = Math.round((cat.views / maxViews) * 100);
                const colors = ['#E32326', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'];
                const color = colors[idx % colors.length];
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#f7f7f7] text-xs">{cat.name}</span>
                      <span className="text-[#8E8E8E] text-xs">{cat.count} posts · {cat.views.toLocaleString()} views</span>
                    </div>
                    <div className="h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
