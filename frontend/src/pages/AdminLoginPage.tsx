import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAdminToken } from '../api/client';

export function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/admin/login', { password });
      setAdminToken(res.data.token);
      navigate('/admin/dashboard');
    } catch {
      setError('Senha inválida.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mt-10 max-w-md rounded-xl border bg-white p-6 shadow">
      <h1 className="text-2xl font-black text-primary">Admin</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="password"
          className="w-full rounded-xl border p-3"
          placeholder="Digite a senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
