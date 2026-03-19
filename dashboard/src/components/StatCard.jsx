export default function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 flex items-start gap-4">
      {Icon && (
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
          style={{ backgroundColor: accent ? `${accent}18` : '#1C1C1C', color: accent || '#8E8E8E' }}
        >
          <Icon size={18} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[#8E8E8E] text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
        <div className="text-[#f7f7f7] text-2xl font-bold leading-tight">{value}</div>
        {sub && <div className="text-[#8E8E8E] text-xs mt-1">{sub}</div>}
      </div>
    </div>
  );
}
