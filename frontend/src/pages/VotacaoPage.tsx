import { useEffect, useState } from 'react';
import { createVote, fetchCandidates, fetchPhase } from '../api/supabase';
import { Toast } from '../components/Toast';
import { Candidate, Phase } from '../types';

export function VotacaoPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState<Phase>('CANDIDATURA');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [phaseRes, candidateRes] = await Promise.all([fetchPhase(), fetchCandidates('APROVADO')]);
      setPhase(phaseRes);
      setCandidates(candidateRes);
    } catch (error: any) {
      setToast({ msg: error?.message ?? 'Falha ao carregar votacao.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
      <button
        onClick={vote}
        disabled={!selected || sending}
        className="mt-6 w-full rounded-xl bg-emerald-600 p-4 text-lg font-bold text-white disabled:opacity-40"
      >
        {sending ? 'Confirmando...' : 'Confirmar voto'}
      </button>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
