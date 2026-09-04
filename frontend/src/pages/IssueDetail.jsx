import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

const VALID_TRANSITIONS = {
  open: ['in_progress', 'closed'],
  in_progress: ['resolved', 'open'],
  resolved: ['closed', 'open'],
  closed: [],
}

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentBody, setCommentBody] = useState('')
  const [commentError, setCommentError] = useState('')
  const [transitionError, setTransitionError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([api.getIssue(id), api.getUsers()])
      .then(([issueData, usersData]) => {
        if (cancelled) return
        setIssue(issueData)
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
  }, [id])

  function handleTransition(newStatus) {
    setTransitionError('')
    api.transitionStatus(id, newStatus)
      .then((data) => setIssue(data))
      .catch((err) => setTransitionError(err.message))
  }

  function handleCommentSubmit(e) {
    e.preventDefault()
    if (!commentBody.trim()) {
      setCommentError('Comment cannot be empty.')
      return
    }
    setCommentError('')
    api.createComment(id, { body: commentBody.trim() })
      .then(() => api.getIssue(id))
      .then((data) => {
        setIssue(data)
        setCommentBody('')
      })
      .catch((err) => setCommentError(err.message))
  }

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this issue? This cannot be undone.')) {
      return
    }
    api.deleteIssue(id)
      .then(() => navigate('/'))
      .catch((err) => setError(err.message))
  }

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  if (!issue) return <ErrorMessage message="Issue not found." />

  const assignee = users.find((u) => u.id === issue.assignee_id)
  const availableTransitions = VALID_TRANSITIONS[issue.status] || []

  return (
    <div>
      <div style={styles.header}>
        <h1>{issue.title}</h1>
        <div style={styles.actions}>
          <Link to={`/issues/${id}/edit`} style={styles.secondaryButton}>
            Edit
          </Link>
          <button onClick={handleDelete} style={styles.dangerButton}>
            Delete
          </button>
        </div>
      </div>

      <div style={styles.meta}>
        <div><StatusBadge status={issue.status} /></div>
        <div><PriorityBadge priority={issue.priority} /></div>
        <span style={styles.metaItem}><strong>Severity:</strong> {issue.severity}</span>
        <span style={styles.metaItem}><strong>Reporter:</strong> {issue.reporter}</span>
        <span style={styles.metaItem}><strong>Assignee:</strong> {assignee?.name || 'Unassigned'}</span>
        <span style={styles.metaItem}><strong>Created:</strong> {new Date(issue.created_at).toLocaleString()}</span>
        <span style={styles.metaItem}><strong>Updated:</strong> {new Date(issue.updated_at).toLocaleString()}</span>
      </div>

      {availableTransitions.length > 0 && (
        <div style={styles.transitionBox}>
          <strong>Transition status:</strong>
          <div style={styles.transitionButtons}>
            {availableTransitions.map((s) => (
              <button
                key={s}
                onClick={() => handleTransition(s)}
                style={styles.transitionButton}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {transitionError && <p style={styles.inlineError}>{transitionError}</p>}
        </div>
      )}

      <section style={styles.section}>
        <h2>Description</h2>
        <p style={styles.description}>{issue.description || 'No description provided.'}</p>
      </section>

      <section style={styles.section}>
        <h2>Comments</h2>
        {issue.comments && issue.comments.length > 0 ? (
          <ul style={styles.commentList}>
            {issue.comments.map((comment) => (
              <li key={comment.id} style={styles.comment}>
                <div style={styles.commentMeta}>
                  <strong>{comment.author ? comment.author.name : 'Unknown'}</strong>
                  <span style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p style={styles.commentBody}>{comment.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}

        <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
          <textarea
            rows={3}
            placeholder="Add a comment…"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            style={styles.textarea}
          />
          {commentError && <p style={styles.inlineError}>{commentError}</p>}
          <button type="submit" style={styles.primaryButton}>
            Add Comment
          </button>
        </form>
      </section>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  secondaryButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    color: '#374151',
    cursor: 'pointer',
  },
  dangerButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ef4444',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  metaItem: {
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  transitionBox: {
    padding: '1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
  },
  transitionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  transitionButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '2rem',
  },
  description: {
    whiteSpace: 'pre-wrap',
  },
  commentList: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  comment: {
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    backgroundColor: '#fff',
  },
  commentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  commentDate: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  commentBody: {
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  commentForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    resize: 'vertical',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  inlineError: {
    color: '#b91c1c',
    fontSize: '0.875rem',
    margin: '0.25rem 0 0',
  },
}
