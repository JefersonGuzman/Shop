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
}


