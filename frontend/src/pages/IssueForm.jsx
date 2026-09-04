import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import UserSelector from '../components/UserSelector'

const PRIORITIES = ['low', 'medium', 'high', 'critical']
const SEVERITIES = ['minor', 'normal', 'major', 'critical']

const INITIAL = {
  title: '',
  description: '',
  priority: 'medium',
  severity: 'normal',
  reporter: '',
  assignee_id: '',
}

export default function IssueForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [validation, setValidation] = useState({})

  useEffect(() => {
    api.getUsers().then(setUsers).catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    api.getIssue(id)
      .then((data) => {
        setForm({
          title: data.title,
          description: data.description,
          priority: data.priority,
          severity: data.severity,
          reporter: data.reporter,
          assignee_id: data.assignee_id || '',
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setValidation((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate() {
    const errors = {}
    if (!form.title.trim()) {
      errors.title = 'Title is required.'
    }
    if (!form.reporter.trim()) {
      errors.reporter = 'Reporter is required.'
    }
    setValidation(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        assignee_id: form.assignee_id || null,
      }
      if (isEdit) {
        await api.updateIssue(id, payload)
        navigate(`/issues/${id}`)
      } else {
        const issue = await api.createIssue(payload)
        navigate(`/issues/${issue.id}`)
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1>{isEdit ? 'Edit Issue' : 'New Issue'}</h1>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          <span style={styles.labelText}>Title *</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            style={styles.input}
          />
          {validation.title && <span style={styles.error}>{validation.title}</span>}
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Description</span>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            style={styles.input}
          />
        </label>

        <div style={styles.row}>
          <label style={styles.label}>
            <span style={styles.labelText}>Priority</span>
            <select
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              style={styles.input}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label style={styles.label}>
            <span style={styles.labelText}>Severity</span>
            <select
              value={form.severity}
              onChange={(e) => handleChange('severity', e.target.value)}
              style={styles.input}
            >
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <label style={styles.label}>
          <span style={styles.labelText}>Reporter *</span>
          <input
            type="text"
            value={form.reporter}
            onChange={(e) => handleChange('reporter', e.target.value)}
            style={styles.input}
          />
          {validation.reporter && <span style={styles.error}>{validation.reporter}</span>}
        </label>

        <UserSelector
          label="Assignee"
          users={users}
          value={form.assignee_id}
          onChange={(v) => handleChange('assignee_id', v || '')}
          includeEmpty
        />

        <div style={styles.actions}>
          <button type="submit" disabled={saving} style={styles.primaryButton}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Issue'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            style={styles.secondaryButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '700px',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },
  labelText: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
  },
  error: {
    color: '#b91c1c',
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  primaryButton: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
}
