import { Request, Response } from 'express';

import { ChatSessionModel } from '../models/ChatSession';
import { UserModel } from '../models/User'; // Import UserModel
import { ChatMessageSchema } from '../schemas/chat';
import { AIService } from '../services/AIService';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

const aiService = new AIService();

export class ChatController {
  async processMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message, sessionId } = ChatMessageSchema.parse(req.body);
      const start = Date.now();

      let userContext: any = null;
      if (req.user && req.user.id) { // Assuming req.user is populated by auth middleware
        const user = await UserModel.findById(req.user.id).lean();
        if (user) {
          userContext = {
            userId: user._id,
            isLoggedIn: true,
            preferences: (user as any).preferences || {}, // Assuming user has preferences
            history: (user as any).purchaseHistory || [], // Assuming user has purchaseHistory
          };
        }
      }

      // Placeholder for currentPromotions and storeStatus
      const currentPromotions = {
        activeOffers: [],
        discounts: {},
      };
      const storeStatus = {
        isOpen: true,
        deliveryInfo: 'Envío gratis en compras >$100',
        supportHours: 'Lun-Sáb 9AM-8PM, Dom 10AM-6PM',
      };

      // Obtener o crear sesión (asociar al usuario si existe)
      let session = await ChatSessionModel.findOne({ sessionId });
      if (!session) {
        session = await ChatSessionModel.create({ sessionId, messages: [], isActive: true, userId: req.user?.id });
      }

      // Guardar mensaje del usuario
      session.messages.push({ role: 'user', content: message, timestamp: new Date() });

      // --- Lógica de Desambiguación Mejorada ---
      const lastAssistant = [...session.messages].reverse().find((m) => m.role === 'assistant');
      const askedDisambiguation = (lastAssistant?.metadata as any)?.actionType === 'disambiguation_prompt';
      const normalized = message.trim().toLowerCase();

      // Si el asistente pidió desambiguación y el usuario da una respuesta corta, forzar una pregunta estructurada.
      const isAffirmationOnly = ['si', 'sí', 'no', 'ok', 'vale', 'seguro', 'claro'].includes(normalized);
      if (askedDisambiguation && isAffirmationOnly) {
        const forcedReply =
          'Para ayudarte mejor, elige una opción: 1) Soporte técnico/servicio para tu MacBook, 2) Soporte físico/accesorio (base/stand). Responde con 1 o 2.';
        
        // Guardamos la pregunta forzada del asistente con metadatos claros
        session.messages.push({ 
          role: 'assistant', 
          content: forcedReply, 
          timestamp: new Date(), 
          metadata: { actionType: 'disambiguation_prompt' } as any 
        });
        await session.save();
        res.json({ success: true, data: { response: forcedReply, suggestedProducts: [], followUpQuestions: [], sessionId } });
        return;
      }

      // Si venimos de una pregunta de desambiguación, enriquecer la consulta para la IA.
      let effectiveMessage = message;
      if (askedDisambiguation) {
        const mentionsTech = /(técnic|tecnic|servicio|1)/i.test(message);
        const mentionsAccessory = /(accesori|físic|fisic|stand|base|soporte físico|2)/i.test(message);
        if (mentionsTech) {
          effectiveMessage = 'El usuario ha elegido la opción de "soporte técnico/servicio para su MacBook (diagnóstico/reparación)".';
        } else if (mentionsAccessory) {
          effectiveMessage = 'El usuario ha elegido la opción de "soporte físico/accesorio (base/stand) para su MacBook". Procede a verificar el inventario.';
        }
      }

      // Generar respuesta de IA con contexto de historial para evitar saludos repetidos
      const isFirstTurn = (session.messages.filter(m => m.role === 'assistant').length === 0);
      const response = await aiService.processUserQuery(
        effectiveMessage,
        userContext,
        currentPromotions,
        storeStatus,
        {
          history: session.messages.map(m => ({ role: m.role, content: m.content })),
          isFirstTurn
        }
      );

      // Revisar si la IA está pidiendo desambiguación y limpiar el tag
      let responseContent = response.content;
      let responseActionType: any = 'general';
      
      if (response.content.includes('[DISAMBIGUATION_PROMPT]')) {
        responseContent = response.content.replace('[DISAMBIGUATION_PROMPT]', '').trim();
        responseActionType = 'disambiguation_prompt';
      }

      // Evitar saludos repetidos en turnos posteriores
      const assistantCount = session.messages.filter(m => m.role === 'assistant').length;
      if (assistantCount > 0) {
        responseContent = responseContent.replace(/^(\s*)(hola|¡hola|buenas|buenos días|buenas tardes|bienvenido[a]?|bienvenid[oa]s)[!¡,\.\s]*/i, '$1');
        responseContent = responseContent.trimStart();
      }

      // Guardar respuesta del asistente
      session.messages.push({
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: { 
          productsReferenced: [], 
          actionType: responseActionType, 
          confidence: 0.7, 
          processingTime: Date.now() - start 
        },
      });
      await session.save();

      res.json({ success: true, data: { response: responseContent, suggestedProducts: response.suggestedProducts, followUpQuestions: response.followUpQuestions, sessionId } });
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

  async listSessions(req: Request, res: Response): Promise<void> {
    const limit = Math.max(1, Math.min(10, Number(req.query.limit || 3)));
    const idsParam = String(req.query.ids || '').trim();
    const ids = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];

    let criteria: any = {};
    // Si hay usuario autenticado, listar por userId
    const maybeUser = (req as any).user as { id?: string } | undefined;
    if (maybeUser?.id) {
      criteria.userId = maybeUser.id;
    } else if (ids.length > 0) {
      // Si no hay usuario, pero nos pasan sessionIds, limitar a esos
      criteria.sessionId = { $in: ids };
    } else {
      // Sin usuario ni ids, no exponemos sesiones
      res.json({ success: true, data: [] });
      return;
    }

    const sessions = await ChatSessionModel.find(criteria)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('sessionId createdAt updatedAt messages')
      .lean();

    const data = sessions.map((s: any) => ({
      sessionId: s.sessionId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      lastMessage: Array.isArray(s.messages) && s.messages.length > 0 ? s.messages[s.messages.length - 1].content : ''
    }));

    res.json({ success: true, data });
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    const sessionId = String((req.query.sessionId || (req.body as any)?.sessionId || '')).trim();
    if (!sessionId) {
      res.status(400).json({ error: 'sessionId requerido' });
      return;
    }

    await ChatSessionModel.deleteOne({ sessionId });
    res.json({ success: true });
  }
}


