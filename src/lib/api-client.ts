import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('stratum_token');
  const headers = new Headers(init?.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers })
  if (res.status === 401) {
    localStorage.removeItem('stratum_token');
    localStorage.removeItem('stratum_auth');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) throw new Error(json.error || 'Request failed')
  return json.data
}