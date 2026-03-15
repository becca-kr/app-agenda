import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findFirst();
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};