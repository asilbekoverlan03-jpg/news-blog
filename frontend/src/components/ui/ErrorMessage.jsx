export default function ErrorMessage({ error }) {
  if (!error) return null

  // DRF может вернуть объект с ключами или строку
  const text =
    typeof error === 'string'
      ? error
      : Object.values(error).flat().join(' ')

  return (
    <div
      role="alert"
      style={{
        background: '#fee2e2',
        color: '#b91c1c',
        padding: '10px 14px',
        borderRadius: 6,
        marginBottom: 12,
        fontSize: 14,
      }}
    >
      {text}
    </div>
  )
}
