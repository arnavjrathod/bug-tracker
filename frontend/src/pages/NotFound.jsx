import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" style={{ color: '#2563eb' }}>Back to issues</Link>
    </div>
  )
}
