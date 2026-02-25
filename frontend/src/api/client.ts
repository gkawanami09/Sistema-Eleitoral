import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export function setAdminToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('admin_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('admin_token');
  }
}

const existing = localStorage.getItem('admin_token');
if (existing) {
  setAdminToken(existing);
}
