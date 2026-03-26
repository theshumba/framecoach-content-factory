import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Send,
  Search,
  Download,
  Users,
  MessageCircle,
  CheckCircle2,
  Clock,
  Instagram,
  Mail,
  Phone,
  MessageSquare,
  Linkedin,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Music2,
  Filter,
  X,
} from 'lucide-react';
import {
  loadLeads,
  getLeads,
  updateLeadChannel,
  updateLead,
  getOutreachStats,
  exportLeadsCSV,
} from '../store/outreachStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'All',
  'Camera Gear & Media',
  'Film Education',
  'Film Festival',
  'Filmmaker & Director',
  'Filmmaker & Educator',
  'Indie Film Director',
  'Instagram Creator',
  'Tech Journalist',
  'Wedding Videographer',
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Leads' },
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'follow_up', label: 'Follow-up Needed' },
];

const CHANNELS = [
  { key: 'instagramDm', label: 'Instagram DM', icon: Instagram, color: '#E1306C' },
  { key: 'tiktokDm', label: 'TikTok DM', icon: Music2, color: '#69C9D0' },
  { key: 'email', label: 'Email', icon: Mail, color: '#3B82F6' },
  { key: 'phone', label: 'Phone', icon: Phone, color: '#22C55E' },
  { key: 'text', label: 'Text', icon: MessageSquare, color: '#F59E0B' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
];

const STATUS_CYCLE = {
  not_sent: 'sent',
  sent: 'responded',
  responded: 'follow_up',
  follow_up: 'not_sent',
  not_called: 'called',
  called: 'responded',
};

const STATUS_STYLES = {
  not_sent: { bg: 'bg-[#2A2A2A]', text: 'text-[#8E8E8E]', label: '—' },
  not_called: { bg: 'bg-[#2A2A2A]', text: 'text-[#8E8E8E]', label: '—' },
  sent: { bg: 'bg-[#3B82F6]/20', text: 'text-[#3B82F6]', label: 'Sent' },
  called: { bg: 'bg-[#3B82F6]/20', text: 'text-[#3B82F6]', label: 'Called' },
  responded: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]', label: 'Replied' },
  follow_up: { bg: 'bg-[#F59E0B]/20', text: 'text-[#F59E0B]', label: 'Follow-up' },
};

const DEFAULT_STATUSES = ['not_sent', 'not_called'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isContacted(lead) {
  return Object.values(lead.channels).some(s => !DEFAULT_STATUSES.includes(s));
}

function hasResponded(lead) {
  return Object.values(lead.channels).some(s => s === 'responded');
}

function needsFollowUp(lead) {
  return Object.values(lead.channels).some(s => s === 'follow_up');
}

function matchesStatusFilter(lead, filter) {
  if (filter === 'all') return true;
  if (filter === 'not_contacted') return !isContacted(lead);
  if (filter === 'contacted') return isContacted(lead);
  if (filter === 'responded') return hasResponded(lead);
  if (filter === 'follow_up') return needsFollowUp(lead);
  return true;
}

// ---------------------------------------------------------------------------
// Channel Badge
// ---------------------------------------------------------------------------

function ChannelBadge({ channel, status, onCycle }) {
  const Icon = channel.icon;
  const style = STATUS_STYLES[status] || STATUS_STYLES.not_sent;

  return (
    <button
      onClick={onCycle}
      title={`${channel.label}: ${style.label}\nClick to change`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 hover:scale-105 ${style.bg} ${style.text}`}
    >
      <Icon size={12} style={!DEFAULT_STATUSES.includes(status) ? { color: channel.color } : undefined} />
      <span className="hidden sm:inline">{style.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Lead Row
// ---------------------------------------------------------------------------

function LeadRow({ lead, onChannelCycle, onNotesChange }) {
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(lead.notes || '');
  const notesTimer = useRef(null);

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setLocalNotes(val);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => onNotesChange(lead.id, val), 500);
  };

  return (
    <>
      <tr className="border-b border-[#2A2A2A] hover:bg-[#1C1C1C] transition-colors">
        {/* Expand toggle + Name */}
        <td className="px-3 py-3 max-w-[200px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#8E8E8E] hover:text-[#f7f7f7] transition-colors shrink-0"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className="min-w-0">
              <div className="text-[#f7f7f7] text-sm font-medium truncate">{lead.fullName}</div>
              <div className="text-[#8E8E8E] text-xs truncate">{lead.company}</div>
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="px-3 py-3 hidden md:table-cell">
          <span className="text-[#8E8E8E] text-xs bg-[#1C1C1C] px-2 py-1 rounded-md whitespace-nowrap">
            {lead.category}
          </span>
        </td>

        {/* Email */}
        <td className="px-3 py-3 hidden lg:table-cell max-w-[180px]">
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="text-[#3B82F6] text-xs hover:underline truncate block"
            >
              {lead.email}
            </a>
          ) : (
            <span className="text-[#2A2A2A] text-xs">—</span>
          )}
        </td>

        {/* Channel toggles */}
        <td className="px-3 py-3">
          <div className="flex flex-wrap gap-1">
            {CHANNELS.map(ch => (
              <ChannelBadge
                key={ch.key}
                channel={ch}
                status={lead.channels[ch.key]}
                onCycle={() => onChannelCycle(lead.id, ch.key, lead.channels[ch.key])}
              />
            ))}
          </div>
        </td>

        {/* Notes */}
        <td className="px-3 py-3 hidden xl:table-cell min-w-[150px]">
          <input
            type="text"
            value={localNotes}
            onChange={handleNotesChange}
            placeholder="Add note..."
            className="w-full bg-transparent border-b border-transparent focus:border-[#2A2A2A] text-[#f7f7f7] text-xs placeholder-[#2A2A2A] outline-none py-1 transition-colors"
          />
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
          <td colSpan={5} className="px-3 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-7 text-xs">
              {lead.jobTitle && (
                <div>
                  <span className="text-[#8E8E8E]">Title: </span>
                  <span className="text-[#f7f7f7]">{lead.jobTitle}</span>
                </div>
              )}
              {lead.location && (
                <div>
                  <span className="text-[#8E8E8E]">Location: </span>
                  <span className="text-[#f7f7f7]">{lead.location}</span>
                </div>
              )}
              {lead.email && (
                <div>
                  <span className="text-[#8E8E8E]">Email: </span>
                  <a href={`mailto:${lead.email}`} className="text-[#3B82F6] hover:underline">{lead.email}</a>
                </div>
              )}
              {lead.phone && (
                <div>
                  <span className="text-[#8E8E8E]">Phone: </span>
                  <a href={`tel:${lead.phone}`} className="text-[#22C55E] hover:underline">{lead.phone}</a>
                </div>
              )}
              {lead.instagram && (
                <div>
                  <span className="text-[#8E8E8E]">Instagram: </span>
                  <a
                    href={`https://instagram.com/${lead.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E1306C] hover:underline"
                  >
                    {lead.instagram}
                  </a>
                </div>
              )}
              {lead.linkedin && (
                <div>
                  <span className="text-[#8E8E8E]">LinkedIn: </span>
                  <a
                    href={lead.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:underline inline-flex items-center gap-1"
                  >
                    Profile <ExternalLink size={10} />
                  </a>
                </div>
              )}
              {lead.followers && (
                <div>
                  <span className="text-[#8E8E8E]">Followers: </span>
                  <span className="text-[#f7f7f7]">{lead.followers}</span>
                </div>
              )}
              {lead.engagementRate && (
                <div>
                  <span className="text-[#8E8E8E]">Engagement: </span>
                  <span className="text-[#f7f7f7]">{lead.engagementRate}%</span>
                </div>
              )}
              {lead.headline && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-[#8E8E8E]">Headline: </span>
                  <span className="text-[#f7f7f7]">{lead.headline}</span>
                </div>
              )}
              {/* Notes on mobile (hidden on xl where it shows in table) */}
              <div className="sm:col-span-2 lg:col-span-3 xl:hidden">
                <span className="text-[#8E8E8E] block mb-1">Notes:</span>
                <input
                  type="text"
                  value={localNotes}
                  onChange={handleNotesChange}
                  placeholder="Add note..."
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-md text-[#f7f7f7] text-xs placeholder-[#2A2A2A] outline-none px-2 py-1.5 focus:border-[#E32326]/40"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function OutreachPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Load leads
  useEffect(() => {
    loadLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Filter leads
  const filtered = useMemo(() => {
    let result = leads;

    if (category !== 'All') {
      result = result.filter(l => l.category === category);
    }

    if (statusFilter !== 'all') {
      result = result.filter(l => matchesStatusFilter(l, statusFilter));
    }

    if (debouncedSearch.length >= 2) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(l =>
        (l.fullName || '').toLowerCase().includes(q) ||
        (l.company || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.instagram || '').toLowerCase().includes(q) ||
        (l.jobTitle || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [leads, category, statusFilter, debouncedSearch]);

  // Stats
  const stats = useMemo(() => getOutreachStats(leads), [leads]);

  // Handlers
  const handleChannelCycle = useCallback((id, channel, currentStatus) => {
    const next = STATUS_CYCLE[currentStatus] || 'not_sent';
    const updated = updateLeadChannel(id, channel, next);
    setLeads([...updated]);
  }, []);

  const handleNotesChange = useCallback((id, notes) => {
    const updated = updateLead(id, { notes });
    setLeads([...updated]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#8E8E8E] text-sm">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#f7f7f7] text-2xl font-bold">Outreach</h1>
          <p className="text-[#8E8E8E] text-sm mt-0.5">Track outreach across all channels</p>
        </div>
        <button
          onClick={() => exportLeadsCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1C] border border-[#2A2A2A] hover:bg-[#242424] text-[#f7f7f7] rounded-lg text-sm transition-colors"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatBox label="Total Leads" value={stats.total} icon={Users} color="#3B82F6" />
        <StatBox label="Contacted" value={stats.contacted} icon={Send} color="#8B5CF6" />
        <StatBox label="Responded" value={stats.responded} icon={CheckCircle2} color="#22C55E" />
        <StatBox label="Follow-up" value={stats.followUp} icon={Clock} color="#F59E0B" />
        <StatBox label="Remaining" value={stats.remaining} icon={MessageCircle} color="#8E8E8E" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, company, email..."
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg pl-9 pr-8 py-2 text-[#f7f7f7] text-sm placeholder-[#8E8E8E] outline-none focus:border-[#E32326]/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E8E] hover:text-[#f7f7f7]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E] pointer-events-none" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="appearance-none bg-[#141414] border border-[#2A2A2A] rounded-lg pl-9 pr-8 py-2 text-[#f7f7f7] text-sm outline-none focus:border-[#E32326]/40 transition-colors cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(sf => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === sf.value
                  ? 'bg-[#E32326]/15 text-[#E32326] border border-[#E32326]/20'
                  : 'bg-[#141414] border border-[#2A2A2A] text-[#8E8E8E] hover:text-[#f7f7f7] hover:bg-[#1C1C1C]'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-[#8E8E8E] text-xs">
        Showing {filtered.length} of {leads.length} leads
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
                <th className="text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider px-3 py-3">
                  Name
                </th>
                <th className="text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider px-3 py-3 hidden md:table-cell">
                  Category
                </th>
                <th className="text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider px-3 py-3 hidden lg:table-cell">
                  Email
                </th>
                <th className="text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider px-3 py-3">
                  Channels
                </th>
                <th className="text-left text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider px-3 py-3 hidden xl:table-cell">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onChannelCycle={handleChannelCycle}
                  onNotesChange={handleNotesChange}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center">
                    <div className="text-[#8E8E8E] text-sm">No leads match your filters</div>
                    <button
                      onClick={() => { setSearch(''); setCategory('All'); setStatusFilter('all'); }}
                      className="text-[#E32326] text-xs mt-2 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Box (inline — matches dashboard style)
// ---------------------------------------------------------------------------

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <div className="text-[#f7f7f7] text-lg font-bold">{value}</div>
          <div className="text-[#8E8E8E] text-xs">{label}</div>
        </div>
      </div>
    </div>
  );
}
