const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getNotes: (search = '', tag = '') =>
    req(`/api/notes?search=${encodeURIComponent(search)}&tag=${encodeURIComponent(tag)}`),
  getNote: (id) => req(`/api/notes/${id}`),
  createNote: (data) => req('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, data) => req(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id) => req(`/api/notes/${id}`, { method: 'DELETE' }),
  getTags: () => req('/api/tags'),
};
