const STATUS_STYLES = {
  Posted: 'bg-green-500/15 text-green-400 border-green-500/20',
  Analyzed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Scheduled: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Pending: 'bg-[#2A2A2A] text-[#8E8E8E] border-[#3A3A3A]',
};

const STATUS_DOT = {
  Posted: 'bg-green-400',
  Analyzed: 'bg-blue-400',
  Scheduled: 'bg-yellow-400',
  Pending: 'bg-[#8E8E8E]',
};

export default function StatusBadge({ status, showDot = true }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const dot = STATUS_DOT[status] || STATUS_DOT.Pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
      {status}
    </span>
  );
}
