const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f97316',
  critical: '#ef4444',
}

export default function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || '#6b7280'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.625rem',
        borderRadius: '0.25rem',
        border: `1px solid ${color}`,
        color: color,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {priority}
    </span>
  )
}
