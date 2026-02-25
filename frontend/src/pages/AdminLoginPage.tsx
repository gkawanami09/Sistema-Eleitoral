import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAdmin } from '../api/supabase';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      await signInAdmin(email, password);
      navigate('/admin/dashboard');
    } catch {
      setError('Credenciais invalidas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mt-10 max-w-md rounded-xl border bg-white p-6 shadow">
      <h1 className="text-2xl font-black text-primary">Admin</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="email"
          className="w-full rounded-xl border p-3"
          placeholder="Email do admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-xl border p-3"
          placeholder="Senha"
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
