const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('accessiboard_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    error.fieldErrors = data.errors;
    throw error;
  }
  return data;
}

export const api = {
  getJobs: (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) return;
      if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
      else search.append(key, value);
    });
    return fetch(`${BASE}/jobs?${search.toString()}`).then(handle);
  },
  getCategories: () => fetch(`${BASE}/jobs/categories`).then(handle),
  getJob: (id) => fetch(`${BASE}/jobs/${id}`).then(handle),
  getAdminJobs: (sortBy, sortDir) =>
    fetch(`${BASE}/jobs/admin?sortBy=${sortBy}&sortDir=${sortDir}`, {
      headers: authHeaders(),
    }).then(handle),
  createJob: (job) =>
    fetch(`${BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(job),
    }).then(handle),
  updateJob: (id, job) =>
    fetch(`${BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(job),
    }).then(handle),
  deleteJob: (id) =>
    fetch(`${BASE}/jobs/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
  submitApplication: (formData) =>
    fetch(`${BASE}/applications`, { method: 'POST', body: formData }).then(handle),
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handle),
};
