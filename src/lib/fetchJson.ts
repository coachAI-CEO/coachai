// src/lib/fetchJson.ts
// ----------------------------------------------------
// Generic JSON fetch helper with error handling
// Used for calling /api routes inside CoachAI
// ----------------------------------------------------

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`❌ Fetch failed: ${res.status} ${res.statusText} - ${errorText}`)
  }

  return res.json() as Promise<T>
}
