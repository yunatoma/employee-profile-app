import { getIdToken, signOut } from './authService';
import { ApiError } from './apiErrors';
export { ApiError } from './apiErrors';

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();

  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    await signOut();
    window.location.href = '/login';
  }

  return res;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.error?.message ?? `リクエストが失敗しました (${res.status})`;
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const res = await apiFetch(path);
    return parseResponse<T>(res);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
    return parseResponse<T>(res);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
    return parseResponse<T>(res);
  },

  async patch<T>(path: string, body: unknown = {}): Promise<T> {
    const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
    return parseResponse<T>(res);
  },

  async delete(path: string): Promise<void> {
    const res = await apiFetch(path, { method: 'DELETE' });
    await parseResponse<void>(res);
  },
};
