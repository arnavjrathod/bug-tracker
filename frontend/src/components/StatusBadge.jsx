const STATUS_COLORS = {
  open: '#f59e0b',
  in_progress: '#3b82f6',
  resolved: '#10b981',
  closed: '#6b7280',
}

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6b7280'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.625rem',
        borderRadius: '9999px',
        backgroundColor: color,
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
