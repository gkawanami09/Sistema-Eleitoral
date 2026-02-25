import { CandidateStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';

const publicRouter = Router();

const candidateSchema = z.object({
  name: z.string().trim().min(3, 'Nome obrigatório').max(120),
  gradeYear: z.string().min(1, 'Ano obrigatório'),
  classLetter: z.enum(['A', 'B', 'C'])
});

publicRouter.post('/candidates', async (req, res) => {
  const phase = await prisma.setting.findUnique({ where: { key: 'phase' } });
  if (phase?.value !== 'CANDIDATURA') {
    return res.status(400).json({ message: 'Candidaturas estão fechadas no momento.' });
  }

  const parsed = candidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Dados inválidos.' });
  }

  const candidate = await prisma.candidate.create({
    data: { ...parsed.data, status: CandidateStatus.PENDENTE }
  });

  return res.status(201).json(candidate);
});

publicRouter.get('/candidates', async (req, res) => {
  const statusParam = req.query.status;
  const status =
    statusParam && Object.values(CandidateStatus).includes(statusParam as CandidateStatus)
      ? (statusParam as CandidateStatus)
      : CandidateStatus.APROVADO;

  const candidates = await prisma.candidate.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(candidates);
});

publicRouter.post('/votes', async (req, res) => {
  const schema = z.object({ candidateId: z.number().int().positive() });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Candidato inválido.' });
  }

  const phase = await prisma.setting.findUnique({ where: { key: 'phase' } });
  if (phase?.value !== 'VOTACAO') {
    return res.status(400).json({ message: 'A votação não está aberta.' });
  }

  const candidate = await prisma.candidate.findUnique({ where: { id: parsed.data.candidateId } });
  if (!candidate || candidate.status !== CandidateStatus.APROVADO) {
    return res.status(404).json({ message: 'Candidato não disponível para votação.' });
  }

  // FEATURE OPCIONAL:
  // incluir field electorCode e bloquear voto duplicado por código
  await prisma.vote.create({ data: { candidateId: candidate.id } });

  return res.status(201).json({ message: 'Voto registrado com sucesso!' });
});

publicRouter.get('/settings/phase', async (_req, res) => {
  const phase = await prisma.setting.findUnique({ where: { key: 'phase' } });
  return res.json({ phase: phase?.value ?? 'CANDIDATURA' });
});

export default publicRouter;
