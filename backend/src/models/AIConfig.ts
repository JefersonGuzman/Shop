import { Schema, model, Document } from 'mongoose';

export interface AIConfigDocument extends Document {
  provider: 'groq' | 'openai';
  apiKey: string; // encriptada si aplica
  modelName: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  status: 'active' | 'inactive' | 'error';
  stopwords?: string[];
  clarifyBeforeRecommend?: boolean;
  clarifyMaxQuestions?: number;
}

const aiConfigSchema = new Schema<AIConfigDocument>(
  {
    provider: { type: String, enum: ['groq', 'openai'], required: true },
    apiKey: { type: String, required: true },
    modelName: { type: String, required: true },
    maxTokens: { type: Number, default: 500 },
    temperature: { type: Number, default: 0.7 },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive', 'error'], default: 'inactive' },
    stopwords: { type: [String], default: [] },
    clarifyBeforeRecommend: { type: Boolean, default: true },
    clarifyMaxQuestions: { type: Number, default: 3 },
  },
  { timestamps: true }
);

aiConfigSchema.index({ provider: 1, isActive: 1 });

export const AIConfigModel = model<AIConfigDocument>('AIConfig', aiConfigSchema);


