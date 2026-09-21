import { supabase } from '../lib/supabase'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function authHeader() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseError(response: Response) {
  const problem = await response.json().catch(() => null) as { detail?: string; message?: string; title?: string } | null
  return problem?.detail || problem?.message || problem?.title || `Request failed (${response.status})`
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const isForm = options.body instanceof FormData
  if (!isForm && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const auth = await authHeader()
  if (auth.Authorization) headers.set('Authorization', auth.Authorization)
  const response = await fetch(path, { ...options, headers })
  if (response.status === 204) return undefined as T
  if (!response.ok) throw new ApiError(await parseError(response), response.status)
  return response.json() as Promise<T>
}
