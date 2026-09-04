export default function UserSelector({ users, value, onChange, label, includeEmpty = false, emptyLabel = 'Unassigned' }) {
  return (
    <label style={styles.label}>
      <span style={styles.labelText}>{label}</span>
      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)} style={styles.select}>
        {includeEmpty && <option value="">{emptyLabel}</option>}
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  )
}

const styles = {
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  labelText: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
  },
}
