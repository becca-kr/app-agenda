import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const MeetingController = {
  async list(req: Request, res: Response) {
    try {
      const meetings = await prisma.meeting.findMany({
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
  }
};