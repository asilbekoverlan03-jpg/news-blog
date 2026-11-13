export default function Spinner({ size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid #e5e7eb',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        margin: '40px auto',
      }}
      role="status"
      aria-label="Загрузка"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
