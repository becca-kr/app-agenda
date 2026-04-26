import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const MeetingTypeController = {
  async list(req: Request, res: Response) {
    try {
      const types = await prisma.meetingType.findMany({ orderBy: { name: 'asc' } });
      return res.json(types);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tipos de reunião' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const type = await prisma.meetingType.create({ data: { name } });
      return res.status(201).json(type);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar tipo de reunião' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await prisma.meetingType.delete({ where: { id } });
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar tipo de reunião' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { name } = req.body;
      const type = await prisma.meetingType.update({
        where: { id },
        data: { name }
      });
      return res.json(type);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar tipo de reunião' });
    }
  },
};