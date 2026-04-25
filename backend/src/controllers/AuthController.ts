import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const AuthController = {
  async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' } 
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
};