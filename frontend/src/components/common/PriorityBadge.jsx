import {
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';

const priorityConfig = {
  critical: {
    label: 'Critical',
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-600/20',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  high: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-600/20',
    icon: ArrowUp,
    iconColor: 'text-orange-500',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    ring: 'ring-yellow-600/20',
    icon: Minus,
    iconColor: 'text-yellow-500',
  },
  low: {
    label: 'Low',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-600/20',
    icon: ArrowDown,
    iconColor: 'text-green-500',
  },
};

export default function PriorityBadge({ priority, className = '' }) {
  const normalizedPriority = priority?.toLowerCase().trim();
  const config = priorityConfig[normalizedPriority] || {
    label: priority || 'Unknown',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    ring: 'ring-gray-500/20',
    icon: Minus,
    iconColor: 'text-gray-400',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring} ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      {config.label}
    </span>
  );
}
