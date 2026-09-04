export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={styles.container}>
      <p style={styles.text}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={styles.button}>
          Retry
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '2rem',
    color: '#b91c1c',
  },
  text: {
    marginBottom: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#b91c1c',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
}
