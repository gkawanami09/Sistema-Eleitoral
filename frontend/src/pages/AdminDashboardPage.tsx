import { useEffect, useState } from 'react';
import { api, setAdminToken } from '../api/client';
import { ConfirmModal } from '../components/ConfirmModal';
import { Candidate, Phase, ResultRow } from '../types';

export function AdminDashboardPage() {
  const [pendentes, setPendentes] = useState<Candidate[]>([]);
  const [aprovados, setAprovados] = useState<Candidate[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [phase, setPhase] = useState<Phase>('CANDIDATURA');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scope, setScope] = useState<'VOTOS' | 'TUDO'>('VOTOS');

  async function load() {
    try {
      const [dash, resultRes, phaseRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/results'),
        api.get('/settings/phase')
      ]);
      setPendentes(dash.data.pendentes);
      setAprovados(dash.data.aprovados);
      setResults(resultRes.data);
      setPhase(phaseRes.data.phase);
    } catch {
      setAdminToken(null);
      window.location.href = '/admin';
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateCandidate(id: number, status: 'APROVADO' | 'REJEITADO') {
    await api.patch(`/admin/candidates/${id}`, { status });
    await load();
  }

  async function updatePhase(nextPhase: Phase) {
    await api.post('/admin/settings/phase', { phase: nextPhase });
    setPhase(nextPhase);
  }

  async function reset() {
    await api.post('/admin/reset', { scope });
    setConfirmOpen(false);
    await load();
  }

  function exportCsv(path: string) {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}${path}`, '_blank');
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow">
        <h1 className="text-2xl font-black text-primary">Dashboard Admin</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(['CANDIDATURA', 'VOTACAO', 'ENCERRADA'] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => updatePhase(p)}
              className={`rounded-full px-4 py-2 font-semibold ${
                phase === p ? 'bg-primary text-white' : 'bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-bold">Candidatos Pendentes</h2>
          <div className="mt-3 space-y-2">
            {pendentes.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-slate-600">
                  {c.gradeYear} - Turma {c.classLetter}
                </p>
                <div className="mt-2 flex gap-2">
                  <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => updateCandidate(c.id, 'APROVADO')}>
                    Aprovar
                  </button>
                  <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => updateCandidate(c.id, 'REJEITADO')}>
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
            {!pendentes.length && <p className="text-sm text-slate-500">Sem pendências.</p>}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-bold">Candidatos Aprovados</h2>
          <ul className="mt-2 space-y-2">
            {aprovados.map((c) => (
              <li key={c.id} className="rounded-lg bg-slate-50 p-2">
                {c.name} • {c.gradeYear} • {c.classLetter}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-bold">Resultados (maior para menor)</h2>
        <ul className="mt-2 space-y-2">
          {results.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <span>
                {r.name} ({r.gradeYear} {r.classLetter})
              </span>
              <strong>{r.votes} voto(s)</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={() => exportCsv('/admin/export/candidates.csv')}>
          Exportar inscritos CSV
        </button>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={() => exportCsv('/admin/export/results.csv')}>
          Exportar resultados CSV
        </button>
        <select className="rounded border px-3" value={scope} onChange={(e) => setScope(e.target.value as 'VOTOS' | 'TUDO')}>
          <option value="VOTOS">Resetar apenas votos</option>
          <option value="TUDO">Resetar tudo</option>
        </select>
        <button className="rounded-lg bg-red-600 px-4 py-2 text-white" onClick={() => setConfirmOpen(true)}>
          Resetar eleição
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar reset"
        description="Essa ação é irreversível. Deseja continuar?"
        onConfirm={reset}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
