import { useEffect, useState } from 'react';
import { createVote, fetchCandidates, fetchPhase } from '../api/supabase';
import { Toast } from '../components/Toast';
import { Candidate, Phase } from '../types';

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

export function VotacaoPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState<Phase>('CANDIDATURA');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [gradeYear, setGradeYear] = useState('');
  const [classLetter, setClassLetter] = useState('');

  async function load() {
    setLoading(true);
    try {
      const phaseRes = await fetchPhase();
      setPhase(phaseRes);
    } catch (error: any) {
      setToast({ msg: error?.message ?? 'Falha ao carregar votacao.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    async function loadCandidates() {
      if (!gradeYear || !classLetter || phase !== 'VOTACAO') {
        setCandidates([]);
        setSelected(null);
        return;
      }

      try {
        const candidateRes = await fetchCandidates('APROVADO', {
          gradeYear,
          classLetter: classLetter as 'A' | 'B' | 'C'
        });
        setCandidates(candidateRes);
        setSelected(null);
      } catch (error: any) {
        setToast({ msg: error?.message ?? 'Falha ao carregar candidatos.', type: 'error' });
      }
    }

    void loadCandidates();
  }, [gradeYear, classLetter, phase]);

  async function vote() {
    if (!selected) return;
    try {
      setSending(true);
      await createVote(selected);
      setToast({ msg: 'Voto registrado com sucesso!', type: 'success' });
      setSelected(null);
    } catch (error: any) {
      setToast({ msg: error?.message ?? 'Falha ao registrar voto.', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="p-6 text-center font-semibold">Carregando votacao...</p>;
  if (phase === 'CANDIDATURA') {
    return <p className="rounded-xl bg-amber-100 p-6 text-center font-bold">A votacao ainda nao comecou.</p>;
  }
  if (phase === 'ENCERRADA') {
    return <p className="rounded-xl bg-slate-200 p-6 text-center font-bold">Votacao encerrada.</p>;
  }

  return (
    <section>
      <h1 className="mb-4 text-3xl font-black text-primary">Votacao</h1>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <select value={gradeYear} onChange={(e) => setGradeYear(e.target.value)} className="rounded-xl border p-4">
          <option value="">Selecione o Ano/Serie</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        <select value={classLetter} onChange={(e) => setClassLetter(e.target.value)} className="rounded-xl border p-4">
          <option value="">Selecione a Turma</option>
          {['A', 'B', 'C'].map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
      </div>

      {!gradeYear || !classLetter ? (
        <p className="rounded-xl bg-slate-100 p-4 text-center font-semibold">
          Selecione o ano e a turma para ver os candidatos.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => setSelected(candidate.id)}
                className={`rounded-xl border p-4 text-left shadow ${selected === candidate.id ? 'border-primary bg-blue-50' : 'bg-white'}`}
              >
                <p className="text-xl font-bold">{candidate.name}</p>
                <p className="text-slate-600">
                  {candidate.gradeYear} - Turma {candidate.classLetter}
                </p>
              </button>
            ))}
          </div>
          {!candidates.length && (
            <p className="mt-4 rounded-xl bg-amber-100 p-4 text-center font-semibold">
              Nenhum candidato aprovado para este ano/turma.
            </p>
          )}
          <button
            onClick={vote}
            disabled={!selected || sending}
            className="mt-6 w-full rounded-xl bg-emerald-600 p-4 text-lg font-bold text-white disabled:opacity-40"
          >
            {sending ? 'Confirmando...' : 'Confirmar voto'}
          </button>
        </>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
