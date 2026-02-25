import { useEffect, useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { Candidate, Phase, ResultRow } from '../types';
import {
  fetchCandidates,
  fetchPhase,
  fetchResults,
  isAdminUser,
  resetElection,
  setPhase,
  signOutAdmin,
  updateCandidateStatus
} from '../api/supabase';
import { downloadCsv, toCsv } from '../utils/csv';

const grades = [
  '3o Ano EF',
  '4o Ano EF',
  '5o Ano EF',
  '6o Ano EF',
  '7o Ano EF',
  '8o Ano EF',
  '9o Ano EF',
  '1o Ano EM',
  '2o Ano EM',
  '3o Ano EM'
];

const gradeOrder = new Map(grades.map((grade, index) => [grade, index]));

function compareResults(a: ResultRow, b: ResultRow) {
  const orderA = gradeOrder.get(a.gradeYear) ?? Number.MAX_SAFE_INTEGER;
  const orderB = gradeOrder.get(b.gradeYear) ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  if (a.classLetter !== b.classLetter) return a.classLetter.localeCompare(b.classLetter);
  return b.votes - a.votes;
}

export function AdminDashboardPage() {
  const [pendentes, setPendentes] = useState<Candidate[]>([]);
  const [aprovados, setAprovados] = useState<Candidate[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [phase, setPhaseState] = useState<Phase>('CANDIDATURA');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scope, setScope] = useState<'VOTOS' | 'TUDO'>('VOTOS');
  const [loading, setLoading] = useState(true);
  const [resultGradeYear, setResultGradeYear] = useState('');
  const [resultClassLetter, setResultClassLetter] = useState('');

  function getResultFilters() {
    if (!resultGradeYear || !resultClassLetter) return undefined;
    return { gradeYear: resultGradeYear, classLetter: resultClassLetter as 'A' | 'B' | 'C' };
  }

  async function loadResults() {
    const filtered = await fetchResults(getResultFilters());
    setResults(filtered);
  }

  async function load() {
    const [pendingRes, approvedRes, phaseRes] = await Promise.all([
      fetchCandidates('PENDENTE'),
      fetchCandidates('APROVADO'),
      fetchPhase()
    ]);
    setPendentes(pendingRes);
    setAprovados(approvedRes);
    setPhaseState(phaseRes);
    await loadResults();
  }

  useEffect(() => {
    async function init() {
      try {
        const isAdmin = await isAdminUser();
        if (!isAdmin) {
          await signOutAdmin();
          window.location.href = '/admin';
          return;
        }
        await load();
        setLoading(false);
      } catch {
        await signOutAdmin();
        window.location.href = '/admin';
      }
    }

    void init();
  }, []);

  useEffect(() => {
    if (!loading) {
      void loadResults();
    }
  }, [resultGradeYear, resultClassLetter, loading]);

  async function updateCandidate(id: number, status: 'APROVADO' | 'REJEITADO') {
    await updateCandidateStatus(id, status);
    await load();
  }

  async function updatePhase(nextPhase: Phase) {
    await setPhase(nextPhase);
    setPhaseState(nextPhase);
  }

  async function reset() {
    await resetElection(scope);
    setConfirmOpen(false);
    await load();
  }

  async function exportCandidatesCsv() {
    const allCandidates = await fetchCandidates();
    const csv = toCsv(
      ['id', 'name', 'gradeYear', 'classLetter', 'status', 'createdAt'],
      allCandidates.map((c) => [c.id, c.name, c.gradeYear, c.classLetter, c.status, c.createdAt ?? ''])
    );
    downloadCsv('inscritos.csv', csv);
  }

  async function exportResultsCsv() {
    const latest = await fetchResults(getResultFilters());
    const sorted = [...latest].sort(compareResults);
    const csv = toCsv(
      ['ano', 'turma', 'candidato', 'votos'],
      sorted.map((r) => [r.gradeYear, r.classLetter, r.name, r.votes])
    );
    downloadCsv('resultados.csv', csv);
  }

  async function signOut() {
    await signOutAdmin();
    window.location.href = '/admin';
  }

  if (loading) return <p className="p-6 text-center font-semibold">Carregando...</p>;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-black text-primary">Dashboard Admin</h1>
          <button className="rounded-lg border px-3 py-1 text-sm font-semibold" onClick={signOut}>
            Sair
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(['CANDIDATURA', 'VOTACAO', 'ENCERRADA'] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => updatePhase(p)}
              className={`rounded-full px-4 py-2 font-semibold ${phase === p ? 'bg-primary text-white' : 'bg-slate-100'}`}
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
            {!pendentes.length && <p className="text-sm text-slate-500">Sem pendencias.</p>}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-bold">Candidatos Aprovados</h2>
          <ul className="mt-2 space-y-2">
            {aprovados.map((c) => (
              <li key={c.id} className="rounded-lg bg-slate-50 p-2">
                {c.name} - {c.gradeYear} - {c.classLetter}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-bold">Resultados (maior para menor)</h2>
        <p className="mt-1 text-sm text-slate-500">Filtro opcional por ano e turma.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <select value={resultGradeYear} onChange={(e) => setResultGradeYear(e.target.value)} className="rounded-xl border p-3">
            <option value="">Todos os anos</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <select value={resultClassLetter} onChange={(e) => setResultClassLetter(e.target.value)} className="rounded-xl border p-3">
            <option value="">Todas as turmas</option>
            {['A', 'B', 'C'].map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <span>
                {r.name} ({r.gradeYear} {r.classLetter})
              </span>
              <strong>{r.votes} voto(s)</strong>
            </li>
          ))}
        </ul>
        {!results.length && (
          <p className="mt-4 rounded-lg bg-amber-100 p-3 text-center font-semibold">
            Nenhum resultado para este filtro.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={exportCandidatesCsv}>
          Exportar inscritos CSV
        </button>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={exportResultsCsv}>
          Exportar resultados CSV
        </button>
        <select className="rounded border px-3" value={scope} onChange={(e) => setScope(e.target.value as 'VOTOS' | 'TUDO')}>
          <option value="VOTOS">Resetar apenas votos</option>
          <option value="TUDO">Resetar tudo</option>
        </select>
        <button className="rounded-lg bg-red-600 px-4 py-2 text-white" onClick={() => setConfirmOpen(true)}>
          Resetar eleicao
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar reset"
        description="Essa acao e irreversivel. Deseja continuar?"
        onConfirm={reset}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
