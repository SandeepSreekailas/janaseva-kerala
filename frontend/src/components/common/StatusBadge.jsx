const statusConfig = {
  pending: {
    label: 'Pending',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    ring: 'ring-yellow-600/20',
    dot: 'bg-yellow-500',
  },
  submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-600/20',
    dot: 'bg-blue-500',
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    ring: 'ring-indigo-600/20',
    dot: 'bg-indigo-500',
  },
  assigned: {
    label: 'Assigned',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-600/20',
    dot: 'bg-purple-500',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    ring: 'ring-sky-600/20',
    dot: 'bg-sky-500',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-600/20',
    dot: 'bg-green-500',
  },
  closed: {
    label: 'Closed',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    ring: 'ring-gray-600/20',
    dot: 'bg-gray-500',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-600/20',
    dot: 'bg-red-500',
  },
  escalated: {
    label: 'Escalated',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-600/20',
    dot: 'bg-orange-500',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const normalizedStatus = status?.toLowerCase().replace(/[\s-]+/g, '_');
  const config = statusConfig[normalizedStatus] || {
    label: status || 'Unknown',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    ring: 'ring-gray-500/20',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
