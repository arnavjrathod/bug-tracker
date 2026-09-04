const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050'

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  const response = await fetch(url, { ...options, headers })
  if (response.status === 204) {
    return null
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.detail || `Request failed: ${response.status}`
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return data
}

export const api = {
  getUsers: () => request('/users'),

  getIssues: (params = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.priority) query.set('priority', params.priority)
    if (params.assignee_id) query.set('assignee_id', params.assignee_id)
    if (params.q) query.set('q', params.q)
    const qs = query.toString()
    return request(`/issues${qs ? `?${qs}` : ''}`)
  },

  getIssue: (id) => request(`/issues/${id}`),

  createIssue: (payload) => request('/issues', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  updateIssue: (id, payload) => request(`/issues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  deleteIssue: (id) => request(`/issues/${id}`, {
    method: 'DELETE',
  }),

  transitionStatus: (id, status) => request(`/issues/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  }),

  getComments: (issueId) => request(`/issues/${issueId}/comments`),

  createComment: (issueId, payload) => request(`/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}
