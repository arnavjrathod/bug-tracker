import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        Bug Tracker Lite
      </Link>
      <Link to="/issues/new" style={styles.button}>
        New Issue
      </Link>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1f2937',
    color: '#fff',
  },
  brand: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    textDecoration: 'none',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    fontWeight: 500,
  },
}
