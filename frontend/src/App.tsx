import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isAdminUser, supabaseConfigError } from './api/supabase';
import { Layout } from './components/Layout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CandidaturaPage } from './pages/CandidaturaPage';
import { VotacaoPage } from './pages/VotacaoPage';

function AdminRoute() {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    async function check() {
      const allowed = await isAdminUser();
      setStatus(allowed ? 'allowed' : 'denied');
    }

    void check();
  }, []);

  if (status === 'loading') return <p className="p-6 text-center font-semibold">Carregando...</p>;
  return status === 'allowed' ? <AdminDashboardPage /> : <Navigate to="/admin" replace />;
}

export default function App() {
  if (supabaseConfigError) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow">
          <h1 className="text-2xl font-black text-primary">Configuracao pendente</h1>
          <p className="mt-2 text-slate-700">{supabaseConfigError}</p>
          <p className="mt-2 text-sm text-slate-500">
            Copie `frontend/.env.example` para `frontend/.env` e reinicie o `npm run dev -w frontend`.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CandidaturaPage />} />
        <Route path="/votacao" element={<VotacaoPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminRoute />} />
      </Routes>
    </Layout>
  );
}
