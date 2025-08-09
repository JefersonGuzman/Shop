import { Request, Response } from 'express';
import { AIConfigSchema } from '../schemas/admin';
import { AIConfigService } from '../services/AIConfigService';

export class AdminController {
  async upsertAIConfig(req: Request, res: Response): Promise<void> {
    try {
      const payload = AIConfigSchema.parse(req.body);
      await AIConfigService.upsertConfig(payload);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }
}


