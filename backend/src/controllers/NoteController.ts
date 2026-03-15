import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const NoteController = {
  async getByDate(req: Request, res: Response) {
    try {
      const { date } = req.query; 
      const searchDate = date ? new Date(date as string) : new Date();
      
      searchDate.setUTCHours(0, 0, 0, 0);

      const note = await prisma.dailyNote.findUnique({
        where: { date: searchDate }
      });

      return res.json(note || { content: "" });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar nota' });
    }
  },

  async save(req: Request, res: Response) {
    try {
      const { content, date } = req.body;
      const noteDate = date ? new Date(date) : new Date();
      noteDate.setUTCHours(0, 0, 0, 0);

      const note = await prisma.dailyNote.upsert({
        where: { date: noteDate },
        update: { content },
        create: {
          date: noteDate,
          content
        }
      });

      return res.json(note);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar nota' });
    }
  }
};