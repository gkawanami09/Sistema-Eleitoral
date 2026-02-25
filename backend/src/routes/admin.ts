import { CandidateStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { generateAdminToken, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import { toCsv } from '../utils/csv.js';

const adminRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

adminRouter.post('/admin/login', (req, res) => {
  const password = z.string().min(1).safeParse(req.body?.password);
  if (!password.success || password.data !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Senha inválida.' });
  }

  return res.json({ token: generateAdminToken() });
});

adminRouter.use('/admin', requireAdmin);

adminRouter.get('/admin/dashboard', async (_req, res) => {
  const [pendentes, aprovados] = await Promise.all([
    prisma.candidate.findMany({ where: { status: CandidateStatus.PENDENTE }, orderBy: { createdAt: 'asc' } }),
    prisma.candidate.findMany({ where: { status: CandidateStatus.APROVADO }, orderBy: { createdAt: 'desc' } })
  ]);

  return res.json({ pendentes, aprovados });
});

adminRouter.patch('/admin/candidates/:id', async (req, res) => {
  const id = Number(req.params.id);
  const body = z.object({ status: z.enum(['APROVADO', 'REJEITADO']) }).safeParse(req.body);

  if (!Number.isInteger(id) || !body.success) {
    return res.status(400).json({ message: 'Dados inválidos.' });
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: { status: body.data.status }
  });

  return res.json(updated);
});

adminRouter.get('/admin/results', async (_req, res) => {
  const candidates = await prisma.candidate.findMany({
    where: { status: CandidateStatus.APROVADO },
    include: { _count: { select: { votes: true } } }
  });

  const sorted = candidates
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      gradeYear: candidate.gradeYear,
      classLetter: candidate.classLetter,
      votes: candidate._count.votes
    }))
    .sort((a, b) => b.votes - a.votes);

  return res.json(sorted);
});

adminRouter.post('/admin/settings/phase', async (req, res) => {
  const parsed = z.object({ phase: z.enum(['CANDIDATURA', 'VOTACAO', 'ENCERRADA']) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Fase inválida.' });
  }

  const setting = await prisma.setting.upsert({
    where: { key: 'phase' },
    update: { value: parsed.data.phase },
    create: { key: 'phase', value: parsed.data.phase }
  });

  return res.json({ phase: setting.value });
});

adminRouter.get('/admin/export/candidates.csv', async (_req, res) => {
  const candidates = await prisma.candidate.findMany({ orderBy: { createdAt: 'asc' } });
  const csv = toCsv(
    ['id', 'name', 'gradeYear', 'classLetter', 'status', 'createdAt'],
    candidates.map((c) => [c.id, c.name, c.gradeYear, c.classLetter, c.status, c.createdAt.toISOString()])
  );

  res.header('Content-Type', 'text/csv');
  res.attachment('inscritos.csv');
  return res.send(csv);
});

adminRouter.get('/admin/export/results.csv', async (_req, res) => {
  const results = await prisma.candidate.findMany({
    where: { status: CandidateStatus.APROVADO },
    include: { _count: { select: { votes: true } } }
  });

  const sorted = results.sort((a, b) => b._count.votes - a._count.votes);
  const csv = toCsv(
    ['id', 'name', 'gradeYear', 'classLetter', 'votes'],
    sorted.map((c) => [c.id, c.name, c.gradeYear, c.classLetter, c._count.votes])
  );

  res.header('Content-Type', 'text/csv');
  res.attachment('resultados.csv');
  return res.send(csv);
});

adminRouter.post('/admin/reset', async (req, res) => {
  const parsed = z.object({ scope: z.enum(['VOTOS', 'TUDO']) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Escopo inválido.' });
  }

  await prisma.vote.deleteMany();
  if (parsed.data.scope === 'TUDO') {
    await prisma.candidate.deleteMany();
    await prisma.setting.upsert({
      where: { key: 'phase' },
      update: { value: 'CANDIDATURA' },
      create: { key: 'phase', value: 'CANDIDATURA' }
    });
  }

  return res.json({ message: 'Reset concluído.' });
});

export default adminRouter;
