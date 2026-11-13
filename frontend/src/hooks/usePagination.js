import { useState } from 'react'

/**
 * Управляет страницей пагинации DRF (PageNumberPagination).
 * Возвращает { page, setPage, nextPage, prevPage, count, setCount, totalPages }
 */
export function usePagination(pageSize = 10) {
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)

  const totalPages = Math.ceil(count / pageSize)

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages))
  const prevPage = () => setPage((p) => Math.max(p - 1, 1))

  return { page, setPage, nextPage, prevPage, count, setCount, totalPages }
}
