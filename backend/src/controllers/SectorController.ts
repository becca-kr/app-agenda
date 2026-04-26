import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const SectorController = {
  async list(req: Request, res: Response) {
    try {
      const sectors = await prisma.sector.findMany({ orderBy: { name: 'asc' } });
      return res.json(sectors);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar setores' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, color } = req.body;
      const sector = await prisma.sector.create({
        data: { name, color }
      });
      return res.status(201).json(sector);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar setor' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

      await prisma.sector.delete({
        where: { id }
      });
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar setor (verifique se não há reuniões atreladas a ele)' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { name, color } = req.body;
      const sector = await prisma.sector.update({
        where: { id },
        data: { name, color }
      });
      return res.json(sector);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar setor' });
    }
  },

};

