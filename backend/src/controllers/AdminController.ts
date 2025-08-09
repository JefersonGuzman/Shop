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

  async getAIConfig(req: Request, res: Response): Promise<void> {
    try {
      const provider = (req.query.provider as 'groq' | 'openai') || undefined;
      const cfg = await AIConfigService.getActiveConfig(provider);
      res.json({ success: true, data: cfg });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
}


