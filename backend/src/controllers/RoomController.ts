import  type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const RoomController = {
  async list(req: Request, res: Response) {
    try {
      const rooms = await prisma.room.findMany({
        orderBy: { name: 'asc' }
      });
      return res.json(rooms);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar salas' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const room = await prisma.room.create({
        data: { name }
      });
      return res.status(201).json(room);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar sala' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { name } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID da sala é obrigatório' });
      }

      const room = await prisma.room.update({
        where: { id },
        data: { name }
      });
      return res.json(room);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar sala' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'ID da sala é obrigatório' });
      }

      await prisma.room.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar sala. Verifique se existem reuniões vinculadas.' });
    }
  }
};