import { createClient } from '@supabase/supabase-js';
import type { Candidate, CandidateStatus, Phase, ResultRow } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient<any>> | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient<any>(supabaseUrl, supabaseAnonKey);
}

export const supabaseConfigError = supabaseClient
  ? null
  : 'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em frontend/.env.';

function getSupabase() {
  if (!supabaseClient) {
    throw new Error(supabaseConfigError ?? 'Supabase nao configurado.');
  }
  return supabaseClient;
}

function mapCandidate(row: any): Candidate {
  return {
    id: row.id,
    name: row.name,
    gradeYear: row.grade_year,
    classLetter: row.class_letter,
    status: row.status,
    createdAt: row.created_at
  };
}

export async function isAdminUser() {
  const client = getSupabase();
  const { data: userRes } = await client.auth.getUser();
  if (!userRes?.user) return false;
  const { data, error } = await client.from('profiles').select('is_admin').eq('id', userRes.user.id).maybeSingle();
  if (error) return false;
  return !!data?.is_admin;
}

export async function signInAdmin(email: string, password: string) {
  const client = getSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutAdmin() {
  const client = getSupabase();
  await client.auth.signOut();
}

export async function fetchPhase(): Promise<Phase> {
  const { data, error } = await getSupabase().from('settings').select('value').eq('key', 'phase').maybeSingle();
  if (error) throw error;
  return (data?.value as Phase) ?? 'CANDIDATURA';
}

export async function setPhase(phase: Phase) {
  const { error } = await getSupabase().from('settings').upsert({ key: 'phase', value: phase });
  if (error) throw error;
}

export async function createCandidate(payload: {
  name: string;
  gradeYear: string;
  classLetter: 'A' | 'B' | 'C';
}) {
  const { error } = await getSupabase().from('candidates').insert({
    name: payload.name,
    grade_year: payload.gradeYear,
    class_letter: payload.classLetter,
    status: 'PENDENTE'
  });
  if (error) throw error;
}

export async function fetchCandidates(
  status?: CandidateStatus,
  filters?: { gradeYear?: string; classLetter?: 'A' | 'B' | 'C' }
): Promise<Candidate[]> {
  let query = getSupabase()
    .from('candidates')
    .select('id, name, grade_year, class_letter, status, created_at')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (filters?.gradeYear) {
    query = query.eq('grade_year', filters.gradeYear);
  }
  if (filters?.classLetter) {
    query = query.eq('class_letter', filters.classLetter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapCandidate);
}

export async function updateCandidateStatus(id: number, status: 'APROVADO' | 'REJEITADO') {
  const { error } = await getSupabase().from('candidates').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function createVote(candidateId: number) {
  const { error } = await getSupabase().from('votes').insert({ candidate_id: candidateId });
  if (error) throw error;
}

export async function fetchResults(): Promise<ResultRow[]> {
  const { data, error } = await getSupabase()
    .from('candidates')
    .select('id, name, grade_year, class_letter, votes(count)')
    .eq('status', 'APROVADO');

  if (error) throw error;

  const mapped =
    data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      gradeYear: row.grade_year,
      classLetter: row.class_letter,
      votes: row.votes?.[0]?.count ?? 0
    })) ?? [];

  return mapped.sort((a, b) => b.votes - a.votes);
}

export async function resetElection(scope: 'VOTOS' | 'TUDO') {
  const { error: voteError } = await getSupabase().from('votes').delete().gte('id', 0);
  if (voteError) throw voteError;

  if (scope === 'TUDO') {
    const { error: candidateError } = await getSupabase().from('candidates').delete().gte('id', 0);
    if (candidateError) throw candidateError;
    await setPhase('CANDIDATURA');
  }
}
