import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Mensaje no puede estar vacío'),
  sessionId: z.string().min(1),
  userId: z.string().optional(),
});

export type ChatMessageDTO = z.infer<typeof ChatMessageSchema>;


