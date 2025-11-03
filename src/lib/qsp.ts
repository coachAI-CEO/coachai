export function toQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim().length) q.set(k, v.trim())
  })
  return q.toString()
}
