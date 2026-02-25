export type CandidateStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';
export type Phase = 'CANDIDATURA' | 'VOTACAO' | 'ENCERRADA';

export interface Candidate {
  id: number;
  name: string;
  gradeYear: string;
  classLetter: 'A' | 'B' | 'C';
  status: CandidateStatus;
}

export interface ResultRow {
  id: number;
  name: string;
  gradeYear: string;
  classLetter: string;
  votes: number;
}
