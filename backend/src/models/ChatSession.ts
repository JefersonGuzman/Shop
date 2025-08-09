import { Schema, model, Document, Types } from 'mongoose';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    productsReferenced?: Types.ObjectId[];
    actionType?: 'search' | 'recommendation' | 'comparison' | 'info' | 'general';
    confidence?: number;
    processingTime?: number;
  };
}

export interface ChatSessionDocument extends Document {
  userId?: Types.ObjectId;
  sessionId: string;
  messages: ChatMessage[];
  isActive: boolean;
}

const chatSessionSchema = new Schema<ChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    sessionId: { type: String, required: true, unique: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metadata: {
          productsReferenced: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
          actionType: {
            type: String,
            enum: ['search', 'recommendation', 'comparison', 'info', 'general'],
          },
          confidence: { type: Number, min: 0, max: 1 },
          processingTime: Number,
        },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ isActive: 1 });

export const ChatSessionModel = model<ChatSessionDocument>('ChatSession', chatSessionSchema);


