import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const MeetingController = {
  async list(req: Request, res: Response) {
    try {
      const { start, end, roomId } = req.query;

      const where: any = {};

      if (start || end) {
        where.startTime = {};

        if (typeof start === 'string') {
          where.startTime.gte = new Date(start);
        }

        if (typeof end === 'string') {
          where.startTime.lte = new Date(end);
        }
      }

      if (typeof roomId === 'string') {
        where.roomId = roomId;
      }

      const meetings = await prisma.meeting.findMany({
        where,
        include: { sector: true, room: true },
        orderBy: { startTime: 'asc' }
      });

      return res.json(meetings);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar reuniões' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, startTime, endTime, sectorId, roomId, meetingTypeId, canceled } = req.body;

      if (!roomId) {
        return res.status(400).json({ error: 'Sala é obrigatória' });
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({ error: 'Horário inválido' });
      }

      const conflict = await prisma.meeting.findFirst({
        where: {
          roomId,
          canceled: false,
          startTime: { lt: end },
          endTime: { gt: start }
        }
      });

      if (conflict) {
        return res.status(400).json({
          error: 'Já existe uma reunião nesta sala neste horário'
        });
      }

      const meeting = await prisma.meeting.create({
        data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        sectorId,
        roomId,
        meetingTypeId,
        canceled: canceled || false
      }
      });

      return res.status(201).json(meeting);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao agendar reunião' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { title, startTime, endTime, sectorId, roomId, canceled } = req.body;

      const data: any = {
        title,
        sectorId,
        roomId
      };

      if (canceled !== undefined) data.canceled = canceled;

      if (startTime) data.startTime = new Date(startTime);
      if (endTime) data.endTime = new Date(endTime);
      if (data.startTime && data.endTime && roomId) {
        const conflict = await prisma.meeting.findFirst({
          where: {
            id: { not: id },
            roomId,
            canceled: false,
            startTime: { lt: data.endTime },
            endTime: { gt: data.startTime }
          }
        });

        if (conflict) {
          return res.status(400).json({
            error: 'Já existe uma reunião nesta sala neste horário'
          });
        }
      }

      const meeting = await prisma.meeting.update({
        where: { id },
        data
      });

      return res.json(meeting);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar reunião' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await prisma.meeting.delete({
        where: { id }
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir reunião' });
    }
  }
};