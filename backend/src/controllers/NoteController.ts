import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const NoteController = {
  async get(req: Request, res: Response) {
    try {
      const { date } = req.query;
      const note = await prisma.dailyNote.findUnique({
        where: { date: String(date) }
      });
      return res.json({ content: note?.content || '' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar nota' });
    }
  },

  async upsert(req: Request, res: Response) {
    try {
      const { date, content } = req.body;
      const note = await prisma.dailyNote.upsert({
        where: { date },
        update: { content },
        create: { date, content }
      });
      return res.json(note);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar nota' });
    }
  }
};