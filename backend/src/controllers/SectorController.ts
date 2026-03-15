import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const listSectors = async (req: Request, res: Response) => {
  const sectors = await prisma.sector.findMany();
  return res.json(sectors);
};