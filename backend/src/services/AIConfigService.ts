import { AIConfigModel } from '../models/AIConfig';
import { encrypt } from '../utils/crypto';

export class AIConfigService {
  static async upsertConfig(params: {
    provider: 'groq' | 'openai';
    apiKey: string;
    modelName: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<void> {
    const encryptedKey = encrypt(params.apiKey);
    await AIConfigModel.updateMany({ provider: params.provider, isActive: true }, { isActive: false });
    await AIConfigModel.create({
      provider: params.provider,
      apiKey: encryptedKey,
      modelName: params.modelName,
      maxTokens: params.maxTokens ?? 500,
      temperature: params.temperature ?? 0.7,
      isActive: true,
      status: 'active',
    });
  }

  static async getActiveConfig(provider?: 'groq' | 'openai') {
    const query = provider ? { provider, isActive: true } : { isActive: true };
    const doc = await AIConfigModel.findOne(query).sort({ updatedAt: -1 }).lean();
    if (!doc) return null;
    return {
      provider: doc.provider,
      modelName: doc.modelName,
      maxTokens: doc.maxTokens,
      temperature: doc.temperature,
      // No retornamos apiKey por seguridad
      hasKey: Boolean(doc.apiKey),
    };
  }
}


