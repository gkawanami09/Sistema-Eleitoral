import { FormEvent, useEffect, useState } from 'react';
import { createCandidate, fetchPhase } from '../api/supabase';
import { Toast } from '../components/Toast';
import { Phase } from '../types';

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

export function CandidaturaPage() {
  const [name, setName] = useState('');
  const [gradeYear, setGradeYear] = useState('');
  const [classLetter, setClassLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [phase, setPhase] = useState<Phase>('CANDIDATURA');

  useEffect(() => {
    fetchPhase()
      .then((value) => setPhase(value))
      .catch(() => setPhase('CANDIDATURA'));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name || !gradeYear || !classLetter) {
      setToast({ msg: 'Preencha nome, ano e turma.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      await createCandidate({ name, gradeYear, classLetter: classLetter as 'A' | 'B' | 'C' });
      setToast({ msg: 'Candidatura feita com sucesso!', type: 'success' });
      setName('');
      setGradeYear('');
      setClassLetter('');
    } catch (error: any) {
      setToast({ msg: error?.message ?? 'Erro ao cadastrar candidatura.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-lg">
      <h1 className="text-3xl font-black text-primary">Cadastro de Candidatura</h1>
      <p className="mt-1 text-slate-600">Preencha rapido e passe para a proxima pessoa da fila.</p>
      {phase !== 'CANDIDATURA' && (
        <p className="mt-3 rounded-lg bg-amber-100 p-3 font-semibold text-amber-800">
          A fase atual e {phase}. Candidaturas podem estar bloqueadas.
        </p>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-xl border p-4 text-lg"
        />
        <div className="grid gap-4 sm:grid-cols-2">
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
        <button
          disabled={loading || phase !== 'CANDIDATURA'}
          className="w-full rounded-xl bg-primary p-4 text-lg font-bold text-white disabled:opacity-40"
        >
          {loading ? 'Enviando...' : 'Confirmar candidatura'}
        </button>
      </form>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
