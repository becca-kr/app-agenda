import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const MeetingController = {
  async list(req: Request, res: Response) {
    try {
      const { start, end } = req.query;

      const where: any = {};

      if (start || end) {
        where.startTime = {};

        if (start) {
          where.startTime.gte = new Date(start as string);
        }

        if (end) {
          where.startTime.lte = new Date(end as string);
        }
      }

      const meetings = await prisma.meeting.findMany({
        where,
        include: { sector: true },
        orderBy: { startTime: 'asc' }
      });

      return res.json(meetings);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar reuniões' });
    }
  },

  // Criar nova reunião
  async create(req: Request, res: Response) {
    try {
      const { title, description, startTime, endTime, sectorId } = req.body;

      const conflict = await prisma.meeting.findFirst({
        where: {
          startTime: { lt: new Date(endTime) },
          endTime: { gt: new Date(startTime) },
        }
      });

      if (conflict) {
        return res.status(400).json({ error: 'Já existe uma reunião neste horário' });
      }

      const meeting = await prisma.meeting.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          sectorId
        }
      });

      return res.status(201).json(meeting);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao agendar reunião' });
    }
  },

  // Atualizar reunião
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { title, description, startTime, endTime, sectorId } = req.body;

      const data: Partial<{
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
        sectorId: string;
      }> = {
        title,
        description,
        sectorId
      };

      if (startTime) data.startTime = new Date(startTime);
      if (endTime) data.endTime = new Date(endTime);

      const meeting = await prisma.meeting.update({
        where: { id },
        data
      });

      return res.json(meeting);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar reunião' });
    }
  },

  // Excluir reunião
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      await prisma.meeting.delete({
        where: { id }
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir reunião' });
    }
  }
};