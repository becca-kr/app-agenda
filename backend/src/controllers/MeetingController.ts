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
  },

  // Atualizar reunião (Editar - Imagem 4)
  async update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { title, description, startTime, endTime, sectorId } = req.body;

    const data: any = {
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

  // Cancelar reunião (Excluir)
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