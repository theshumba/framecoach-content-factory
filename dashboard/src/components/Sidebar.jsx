import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Images,
  ClipboardList,
  BarChart3,
  Settings,
  Clapperboard,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/tracker', label: 'Posting Tracker', icon: ClipboardList },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-[#E32326]/15 text-[#E32326] border border-[#E32326]/20'
        : 'text-[#8E8E8E] hover:text-[#f7f7f7] hover:bg-[#1C1C1C]'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#E32326] shadow-lg shadow-red-900/30">
          <Clapperboard size={18} className="text-white" />
        </div>
        <div>
          <div className="text-[#f7f7f7] font-bold text-sm tracking-wide">FrameCoach</div>
          <div className="text-[#8E8E8E] text-xs">Content Factory</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[#8E8E8E] text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Main Menu
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#8E8E8E] text-xs">System Active</span>
        </div>
        <div className="text-[#2A2A2A] text-xs mt-1 font-mono">v1.0.0</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#f7f7f7]"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#141414] border-r border-[#2A2A2A] z-40 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#141414] border-r border-[#2A2A2A] fixed top-0 left-0 h-full z-20">
        <SidebarContent />
      </aside>
    </>
  );
}
