## Servicios Backend Principales

### AuthService
```typescript
class AuthService {
  // Registro de nuevo usuario
  async register(userData: RegisterDTO): Promise<AuthResponse> {
    // Validar datos con Zod
    // Hash password con bcrypt
    // Crear usuario en MongoDB
    // Generar JWT tokens
  }

  // Autenticación de usuario
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    // Validar credenciales
    // Verificar password con bcrypt
    // Actualizar lastLogin
    // Generar JWT tokens
  }

  // Renovar token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Validar refresh token
    // Generar nuevo access token
  }

  // Validar token JWT
  async validateToken(token: string): Promise<IUser> {
    // Verificar y decodificar JWT
    // Obtener usuario de DB
  }
}
```

### ProductService
```typescript
class ProductService {
  // Obtener productos con filtros y paginación
  async getProducts(filters: ProductFilters, pagination: PaginationDTO): Promise<ProductsResponse> {
    // Construir query MongoDB con filtros
    // Aplicar paginación y sorting
    // Incluir agregaciones para facets
  }

  // Búsqueda de texto completo
  async searchProducts(query: string, filters?: ProductFilters): Promise<IProduct[]> {
    // Usar MongoDB text search
    // Aplicar relevancia scoring
    // Incluir sugerencias de búsqueda
  }

  // CRUD operations (admin only)
  async createProduct(productData: CreateProductDTO): Promise<IProduct> {
    // Validar datos
    // Generar SKU único
    // Crear producto en DB
  }

  async updateProduct(id: string, updates: UpdateProductDTO): Promise<IProduct> {
    // Validar actualizaciones
    // Actualizar en DB
    // Invalidar cache si existe
  }

  // Analytics para dashboard
  async getProductAnalytics(): Promise<ProductAnalytics> {
    // Agregaciones MongoDB para métricas
    // Stock por categoría
    // Distribución por marca
    // Productos más consultados
  }
}
```

### AIService (Abstracción para LLM)
```typescript
interface LLMProvider {
  generateResponse(prompt: string, context: any): Promise<LLMResponse>;
  testConnection(): Promise<boolean>;
  getUsageStats(): Promise<UsageStats>;
}

class AIService {
  private groqProvider: GroqProvider;
  private openaiProvider: OpenAIProvider;
  private activeProvider: LLMProvider;

  // Procesar consulta del usuario
  async processUserQuery(
    userMessage: string,
    userId?: string,
    sessionId: string
  ): Promise<ChatResponse> {
    
    // Obtener contexto del usuario
    const userContext = userId ? await this.getUserContext(userId) : null;
    
    // Obtener inventario actual
    const inventory = await ProductService.getActiveProducts();
    
    // Construir prompt completo
    const fullPrompt = await this.buildPrompt({
      systemPrompt: CHATBOT_SYSTEM_PROMPT,
      userMessage,
      userContext,
      inventory,
      chatHistory: await this.getChatHistory(sessionId)
    });

    // Procesar con LLM activo
    const response = await this.activeProvider.generateResponse(fullPrompt);
    
    // Extraer productos referenciados
    const referencedProducts = await this.extractProductReferences(response);
    
    // Guardar en historial
    await this.saveChatMessage(sessionId, userMessage, response, {
      productsReferenced: referencedProducts,
      processingTime: Date.now() - startTime
    });

    return response;
  }

  // Construir prompt dinámico
  private async buildPrompt(context: PromptContext): Promise<string> {
    return `
${context.systemPrompt}

INVENTARIO ACTUAL (${context.inventory.length} productos):
${JSON.stringify(context.inventory, null, 2)}

CONTEXTO DEL USUARIO:
${context.userContext ? JSON.stringify(context.userContext) : 'Usuario anónimo'}

HISTORIAL DE CONVERSACIÓN:
${context.chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

CONSULTA ACTUAL:
Usuario: ${context.userMessage}

Asistente:`;
  }

  // Cambiar proveedor LLM
  async switchProvider(provider: 'groq' | 'openai'): Promise<void> {
    const config = await AIConfigModel.findOne({ provider, isActive: true });
    if (!config) throw new Error(`No active config for ${provider}`);
    
    this.activeProvider = provider === 'groq' ? 
      this.groqProvider : this.openaiProvider;
      
    await this.activeProvider.updateConfig(config);
  }
}
```

### GroqProvider
```typescript
class GroqProvider implements LLMProvider {
  private apiKey: string;
  private modelName: string;
  private config: GroqConfig;

  async generateResponse(prompt: string, context?: any): Promise<LLMResponse> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: prompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      const data = await response.json();
      
      // Registrar uso para analytics
      await this.recordUsage(data.usage);
      
      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage.total_tokens,
        model: this.modelName,
        provider: 'groq'
      };
    } catch (error) {
      // Log error y intentar fallback
      console.error('Groq API Error:', error);
      throw new Error(`Groq API failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateResponse('Test connection', {});
      return response.content.length > 0;
    } catch {
      return false;
    }
  }
}
```

### RecommendationService
```typescript
class RecommendationService {
  // Generar recomendaciones personalizadas
  async generateRecommendations(userId: string): Promise<RecommendationResponse> {
    // Obtener preferencias del usuario
    const user = await UserModel.findById(userId).populate('preferences');
    
    // Obtener productos activos
    const products = await ProductModel.find({ isActive: true, stock: { $gt: 0 } });
    
    // Calcular scoring para cada producto
    const scoredProducts = products.map(product => ({
      product,
      score: this.calculateRecommendationScore(product, user.preferences)
    }));

    // Ordenar por score y categorizar
    const sorted = scoredProducts.sort((a, b) => b.score - a.score);
    
    return {
      highlyRecommended: sorted.filter(p => p.score >= 80).slice(0, 5),
      mightInterest: sorted.filter(p => p.score >= 50 && p.score < 80).slice(0, 8),
      others: sorted.filter(p => p.score < 50).slice(0, 10)
    };
  }

  // Algoritmo de scoring
  private calculateRecommendationScore(
    product: IProduct, 
    preferences: UserPreferences
  ): number {
    let score = 0;

    // Puntuación por marca preferida (0-30 puntos)
    if (preferences.preferredBrands.includes(product.brand)) {
      score += 30;
    }

    // Puntuación por categoría (0-25 puntos)
    if (preferences.categories.includes(product.category)) {
      score += 25;
    }

    // Puntuación por rango de precio (0-20 puntos)
    const { min, max } = preferences.priceRange;
    if (product.price >= min && product.price <= max) {
      score += 20;
    } else if (product.price <= max * 1.2) {
      // Penalización menor si está poco arriba del presupuesto
      score += 10;
    }

    // Puntuación por interacciones previas (0-15 puntos)
    const interactionScore = preferences.interactionScore.get(product._id.toString()) || 0;
    score += Math.min(interactionScore, 15);

    // Boost por popularidad (0-10 puntos)
    const popularityBoost = Math.min((product.rating * product.reviews) / 100, 10);
    score += popularityBoost;

    return Math.round(score);
  }

  // Registrar interacción para ML
  async recordInteraction(
    userId: string, 
    productId: string, 
    interactionType: 'view' | 'click' | 'inquiry' | 'comparison'
  ): Promise<void> {
    // Actualizar interaction score del usuario
    // Incrementar popularidad del producto
    // Registrar para analytics
  }
}
```

## Middleware Personalizado

### Authentication Middleware
```typescript
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await UserModel.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### Validation Middleware
```typescript
import { z } from 'zod';

// Esquemas de validación compartidos
export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.enum(['HP', 'Dell', 'Apple', 'Lenovo', 'Asus', 'Samsung']),
  category: z.enum(['laptop', 'desktop', 'tablet', 'smartphone', 'accessory']),
  price: z.number().positive(),
  stock: z.number().min(0),
  specifications: z.record(z.any()),
  images: z.array(z.string().url()),
  description: z.string().min(10),
  tags: z.array(z.string())
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
```

## Controladores API

### ProductController
```typescript
class ProductController {
  // GET /api/products
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req.query);
      const pagination = this.parsePagination(req.query);
      
      const result = await ProductService.getProducts(filters, pagination);
      
      res.json({
        success: true,
        data: result.products,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/products (admin only)
  async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validación ya hecha por middleware
      const productData = req.body as CreateProductDTO;
      
      // Generar SKU único
      productData.sku = await this.generateUniqueSKU(productData);
      
      const product = await ProductService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/products/search
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, ...filters } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const results = await ProductService.searchProducts(
        query as string, 
        filters as ProductFilters
      );
      
      res.json({
        success: true,
        data: results,
        query: query,
        total: results.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### ChatController
```typescript
class ChatController {
  // POST /api/chat/message
  async processMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id;

      // Validar entrada
      if (!message || !sessionId) {
        return res.status(400).json({ error: 'Message and sessionId required' });
      }

      // Procesar con AI Service
      const response = await AIService.processUserQuery(
        message,
        userId?.toString(),
        sessionId
      );

      res.json({
        success: true,
        data: {
          response: response.content,
          suggestedProducts: response.suggestedProducts,
          followUpQuestions: response.followUpQuestions,
          sessionId: sessionId
        }
      });
    } catch (error) {
      console.error('Chat processing error:', error);
      res.status(500).json({ 
        error: 'Error procesando mensaje',
        fallback: 'Lo siento, estoy teniendo problemas técnicos. ¿Puedes reformular tu pregunta?'
      });
    }
  }

  // GET /api/chat/history
  async getChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      const userId = req.user?._id;

      const chatSession = await ChatSessionModel.findOne({
        $or: [
          { sessionId, userId },
          { sessionId, userId: { $exists: false } }
        ]
      }).populate('messages.metadata.productsReferenced');

      res.json({
        success: true,
        data: chatSession?.messages || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### AdminController
```typescript
class AdminController {
  // GET /api/admin/metrics
  async getDashboardMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Métricas de inventario
      const inventoryMetrics = await ProductModel.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' }
          }
        }
      ]);

      // Métricas de usuarios
      const userMetrics = await UserModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ]);

      // Métricas del ChatBot
      const chatMetrics = await ChatSessionModel.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $unwind: '$messages' },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$messages.timestamp' } },
            totalMessages: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          inventory: inventoryMetrics,
          users: userMetrics,
          chat: chatMetrics,
          summary: {
            totalProducts: await ProductModel.countDocuments({ isActive: true }),
            totalUsers: await UserModel.countDocuments({ isActive: true }),
            lowStockProducts: await ProductModel.countDocuments({ stock: { $lt: 5 }, isActive: true })
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/admin/ai-config
  async updateAIConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { provider, apiKey, modelName, maxTokens, temperature } = req.body;

      // Encriptar API key
      const encryptedKey = CryptoUtil.encrypt(apiKey);

      // Desactivar configuración anterior
      await AIConfigModel.updateMany(
        { provider, isActive: true },
        { isActive: false }
      );

      // Crear nueva configuración
      const newConfig = await AIConfigModel.create({
        provider,
        apiKey: encryptedKey,
        modelName,
        maxTokens,
        temperature,
        isActive: true,
        status: 'inactive' // Se activará después del test
      });

      // Probar conexión
      const connectionTest = await AIService.testProviderConnection(provider, {
        apiKey,
        modelName,
        maxTokens,
        temperature
      });

      if (connectionTest.success) {
        newConfig.status = 'active';
        await newConfig.save();
        
        // Actualizar proveedor activo
        await AIService.switchProvider(provider);
      }

      res.json({
        success: true,
        data: {
          configId: newConfig._id,
          connectionTest
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## Base de Datos Optimización

### Índices MongoDB
```typescript
// Índices para performance crítica
db.products.createIndex({ name: "text", description: "text", tags: "text" });
db.products.createIndex({ category: 1, brand: 1, price: 1 });
db.products.createIndex({ stock: 1, isActive: 1 });
db.products.createIndex({ sku: 1 }, { unique: true });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, isActive: 1 });

db.chatsessions.createIndex({ userId: 1, createdAt: -1 });
db.chatsessions.createIndex({ sessionId: 1 });
db.chatsessions.createIndex({ "messages.timestamp": -1 });

// Índices TTL para limpiar sesiones viejas
db.chatsessions.createIndex(
  { "updatedAt": 1 }, 
  { expireAfterSeconds: 2592000 } // 30 días
);
```

### Agregaciones para Analytics
```typescript
// Pipeline para métricas del dashboard
const dashboardPipeline = [
  {
    $facet: {
      // Stock por categoría
      stockByCategory: [
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalStock: { $sum: '$stock' },
            productCount: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        }
      ],
      
      // Productos más consultados
      popularProducts: [
        {
          $lookup: {
            from: 'chatsessions',
            localField: '_id',
            foreignField: 'messages.metadata.productsReferenced',
            as: 'chatReferences'
          }
        },
        {
          $addFields: {
            consultationCount: { $size: '$chatReferences' }
          }
        },
        { $sort: { consultationCount: -1 } },
        { $limit: 10 }
      ],
      
      // Alertas de stock bajo
      lowStockAlerts: [
        { $match: { stock: { $lt: 5 }, isActive: true } },
        { $sort: { stock: 1 } }
      ]
    }
  }
];
```

## Configuración de Entorno

### Variables de Entorno (.env)
```bash
# Base de Datos
MONGODB_URI=mongodb://localhost:27017/makers-tech
MONGODB_TEST_URI=mongodb://localhost:27017/makers-tech-test

# Autenticación
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encriptación
CRYPTO_SECRET_KEY=your-32-char-secret-for-api-keys

# APIs de IA (opcional, se configuran via dashboard)
GROQ_API_KEY=optional-default-groq-key
OPENAI_API_KEY=optional-default-openai-key

# Servidor
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Conexión MongoDB
```typescript
import mongoose from 'mongoose';

class DatabaseConnection {
  static async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI!;
      
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB conectado exitosamente');
      
      // Setup de índices en desarrollo
      if (process.env.NODE_ENV === 'development') {
        await this.setupIndexes();
      }
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      process.exit(1);
    }
  }

  private static async setupIndexes(): Promise<void> {
    // Crear índices automáticamente en desarrollo
    // Ver sección de índices arriba
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('🔌 MongoDB desconectado');
  }
}
```

## Ventajas de MongoDB Integration

### Performance
- **Índices optimizados** para búsquedas rápidas
- **Agregaciones** para analytics en tiempo real
- **Connection pooling** para alta concurrencia

### Escalabilidad
- **Horizontal scaling** ready
- **Sharding** support para grandes inventarios
- **Replica sets** para alta disponibilidad

### Flexibilidad
- **Schema flexible** para especificaciones de productos
- **Evolución fácil** de modelos de datos
- **Queries complejas** con aggregation pipeline

### Security
- **API Keys encriptadas** en base de datos
- **Passwords hasheadas** con bcrypt
- **JWT tokens** con expiración
- **Roles y permisos** granulares# Backend Architecture - Makers Tech ChatBot

## Stack Backend Completo

### Tecnologías Core
```bash
# Runtime y Framework
Node.js 18+ + TypeScript
Express.js o Fastify (recomendado para performance)

# Base de Datos
MongoDB 6.0+
Mongoose ODM 7.0+

# Autenticación y Seguridad
JWT (jsonwebtoken)
bcrypt (hash passwords)
helmet (security headers)
cors (CORS policy)
crypto (encriptar API keys)

# Validación y Utilidades
Zod (validación compartida)
winston (logging)
dotenv (variables de entorno)
compression (gzip)

# Testing
Jest + Supertest
MongoDB Memory Server (testing)
```

## Estructura API RESTful

### Endpoints Principales
```typescript
// Autenticación
POST   /api/auth/register     // Registro de usuario
POST   /api/auth/login        // Login
POST   /api/auth/refresh      // Refresh token
POST   /api/auth/logout       // Logout
GET    /api/auth/me           // Perfil usuario actual

// Productos
GET    /api/products          // Listar productos (con filtros/paginación)
GET    /api/products/:id      // Obtener producto específico
POST   /api/products          // Crear producto (admin)
PUT    /api/products/:id      // Actualizar producto (admin)
DELETE /api/products/:id      // Eliminar producto (admin)
GET    /api/products/search   // Búsqueda avanzada

// ChatBot
POST   /api/chat/message      // Enviar mensaje al bot
GET    /api/chat/history      // Historial de chat del usuario
DELETE /api/chat/clear        // Limpiar historial
POST   /api/chat/feedback     // Feedback sobre respuesta

// Recomendaciones
GET    /api/recommendations   // Obtener recomendaciones personalizadas
POST   /api/recommendations/interaction // Registrar interacción
PUT    /api/users/preferences // Actualizar preferencias

// Admin Dashboard
GET    /api/admin/metrics     // Métricas del dashboard
GET    /api/admin/analytics   // Analytics de uso
POST   /api/admin/ai-config   // Configurar modelo LLM
GET    /api/admin/users       // Gestión de usuarios
```

## Modelos MongoDB (Mongoose)

### User Model
```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  preferences: {
    preferredBrands: string[];
    priceRange: { min: number; max: number };
    categories: string[];
    searchHistory: Array<{
      query: string;
      timestamp: Date;
      resultsCount: number;
    }>;
    interactionScore: Map<string, number>;
  };
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  preferences: {
    preferredBrands: [String],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 }
    },
    categories: [String],
    searchHistory: [{
      query: String,
      timestamp: { type: Date, default: Date.now },
      resultsCount: Number
    }],
    interactionScore: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimización
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
```

### Product Model
```typescript
interface IProduct extends Document {
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  specifications: Record<string, any>;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    enum: ['HP', 'Dell', 'Apple', 'Lenovo', 'Asus', 'Samsung']
  },
  category: {
    type: String,
    required: true,
    enum: ['laptop', 'desktop', 'tablet', 'smartphone', 'accessory']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  specifications: {
    type: Schema.Types.Mixed,
    required: true
  },
  images: [String],
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  sku: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas optimizadas
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ sku: 1 });
```

### ChatSession Model
```typescript
interface IChatSession extends Document {
  userId?: ObjectId;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
      productsReferenced: ObjectId[];
      actionType: string;
      confidence: number;
      processingTime: number;
    };
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      productsReferenced: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }],
      actionType: {
        type: String,
        enum: ['search', 'recommendation', 'comparison', 'info', 'general']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      processingTime: Number
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para queries eficientes
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ isActive: 1 });
```

## Servicios Backend Principales

### AuthService
```typescript
class AuthService {
  // Registro