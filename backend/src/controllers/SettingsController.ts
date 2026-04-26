import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const SettingsController = {
  async get(req: Request, res: Response) {
    try {
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({
          data: {
            primaryColor: '#0057FF',
            companyLogo: '',
            footerText: '© 2026 Todos os direitos reservados - Sua Empresa'
          }
        });
      }
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { primaryColor, companyLogo, footerText } = req.body;
      const existing = await prisma.settings.findFirst();

      let settings;
      if (existing) {
        settings = await prisma.settings.update({
          where: { id: existing.id },
          data: { primaryColor, companyLogo, footerText }
        });
      } else {
        settings = await prisma.settings.create({
          data: { primaryColor, companyLogo, footerText }
        });
      }
      return res.json(settings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
  }
};