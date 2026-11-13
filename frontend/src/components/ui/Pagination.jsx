export default function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
      <button onClick={onPrev} disabled={page === 1} className="btn btn-outline">
        ← Назад
      </button>
      <span style={{ lineHeight: '36px', color: '#6b7280' }}>
        {page} / {totalPages}
      </span>
      <button onClick={onNext} disabled={page === totalPages} className="btn btn-outline">
        Вперёд →
      </button>
    </div>
  )
}
