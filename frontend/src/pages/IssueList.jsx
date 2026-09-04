import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import UserSelector from '../components/UserSelector'

const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITIES = ['low', 'medium', 'high', 'critical']

export default function IssueList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [issues, setIssues] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const statusFilter = searchParams.get('status') || ''
  const priorityFilter = searchParams.get('priority') || ''
  const assigneeFilter = searchParams.get('assignee_id') || ''
  const query = searchParams.get('q') || ''

  const filters = useMemo(() => ({
    status: statusFilter,
    priority: priorityFilter,
    assignee_id: assigneeFilter,
    q: query,
  }), [statusFilter, priorityFilter, assigneeFilter, query])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([api.getIssues(filters), api.getUsers()])
      .then(([issuesData, usersData]) => {
        if (cancelled) return
        setIssues(issuesData)
        setUsers(usersData)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [filters])

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const usersById = useMemo(() => {
    const map = {}
    users.forEach((u) => { map[u.id] = u.name })
    return map
  }, [users])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Issues</h1>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by keyword…"
          value={query}
          onChange={(e) => updateFilter('q', e.target.value)}
          style={styles.search}
        />
        <select
          value={statusFilter}
          onChange={(e) => updateFilter('status', e.target.value)}
          style={styles.select}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => updateFilter('priority', e.target.value)}
          style={styles.select}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <div style={styles.assigneeSelect}>
          <UserSelector
            label="Assignee"
            users={users}
            value={assigneeFilter}
            onChange={(v) => updateFilter('assignee_id', v)}
            includeEmpty={false}
          />
          {assigneeFilter && (
            <button onClick={() => updateFilter('assignee_id', '')} style={styles.clear}>
              Clear
            </button>
          )}
        </div>
      </div>

      {issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Severity</th>
              <th>Assignee</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id}>
                <td>
                  <Link to={`/issues/${issue.id}`} style={styles.link}>
                    {issue.title}
                  </Link>
                </td>
                <td><StatusBadge status={issue.status} /></td>
                <td><PriorityBadge priority={issue.priority} /></td>
                <td style={styles.capitalize}>{issue.severity}</td>
                <td>{issue.assignee_id ? usersById[issue.assignee_id] || 'Unknown' : 'Unassigned'}</td>
                <td>{new Date(issue.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const styles = {
  filters: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    alignItems: 'flex-end',
  },
  search: {
    flex: 1,
    minWidth: '220px',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    minWidth: '140px',
  },
  assigneeSelect: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  clear: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
}
