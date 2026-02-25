import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CandidaturaPage } from './pages/CandidaturaPage';
import { VotacaoPage } from './pages/VotacaoPage';

function AdminRoute() {
  const hasToken = !!localStorage.getItem('admin_token');
  return hasToken ? <AdminDashboardPage /> : <Navigate to="/admin" replace />;
}

export default function App() {
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
