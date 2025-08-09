import { Request, Response } from 'express';

import { ChatSessionModel } from '../models/ChatSession';
import { ChatMessageSchema } from '../schemas/chat';
import { AIService } from '../services/AIService';

const aiService = new AIService();

export class ChatController {
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, sessionId } = ChatMessageSchema.parse(req.body);
      const start = Date.now();

      // Obtener o crear sesión
      let session = await ChatSessionModel.findOne({ sessionId });
      if (!session) {
        session = await ChatSessionModel.create({ sessionId, messages: [], isActive: true });
      }

      // Guardar mensaje del usuario
      session.messages.push({ role: 'user', content: message, timestamp: new Date() });

      // Generar respuesta de IA
      const response = await aiService.processUserQuery(message);

      // Guardar respuesta
      session.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: { productsReferenced: [], actionType: 'general', confidence: 0.7, processingTime: Date.now() - start },
      });
      await session.save();

      res.json({ success: true, data: { response: response.content, suggestedProducts: response.suggestedProducts, followUpQuestions: response.followUpQuestions, sessionId } });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }
  
  async getHistory(req: Request, res: Response): Promise<void> {
    const sessionId = String(req.query.sessionId || '');
    if (!sessionId) {
      res.status(400).json({ error: 'sessionId requerido' });
      return;
    }
    const session = await ChatSessionModel.findOne({ sessionId });
    res.json({ success: true, data: session?.messages ?? [] });
  }
}


