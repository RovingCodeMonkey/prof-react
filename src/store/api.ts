const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
if (!BASE_URL) throw new Error('VITE_API_BASE_URL is not defined')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    if (res.status === 409) {
      const body = await res.text().catch(() => '')
      throw new Error(body || 'Conflict')
    }
    throw new Error(`An unexpected error occurred (${res.status})`)
  }

  // 204 No Content (DELETE / PUT) — return empty
  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    request<void>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}
