import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret';

export function generateAdminToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão.' });
    }
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}
