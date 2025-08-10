import { Request, Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth';
import { LoginSchema, RegisterSchema } from '../schemas/auth';
import { AuthService } from '../services/AuthService';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const payload = RegisterSchema.parse(req.body);
      const out = await AuthService.register(payload);
      res.status(201).json({ success: true, id: out.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials = LoginSchema.parse(req.body);
      const tokens = await AuthService.login(credentials);
      if (!tokens) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }
      res.json({ success: true, ...tokens });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    res.json({ success: true, user: req.user });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token requerido' });
        return;
      }
      const tokens = await AuthService.refresh(refreshToken);
      res.json({ success: true, ...tokens });
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Refresh inválido' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    await AuthService.logout();
    res.json({ success: true });
  }
}


