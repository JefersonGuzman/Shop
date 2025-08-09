// routes/index.ts - Router principal
import express from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import chatRoutes from './chat';
import adminRoutes from './admin';
import recommendationRoutes from './recommendations';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Makers Tech API'
  });
});

// Rutas principales
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/chat', chatRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/admin', adminRoutes);

export default router;

// routes/auth.ts
import express from 'express';
import { AuthController } from '@/controllers/AuthController';
import { validateBody } from '@/middleware/validation';
import { RegisterSchema, LoginSchema } from '@/schemas/auth';
import { authenticateToken } from '@/middleware/auth';

const router = express.Router();
const authController = new AuthController();

// Registro de usuario
router.post('/register', 
  validateBody(RegisterSchema),
  authController.register.bind(authController)
);

// Login
router.post('/login', 
  validateBody(LoginSchema),
  authController.login.bind(authController)
);

// Refresh token
router.post('/refresh', authController.refreshToken.bind(authController));

// Logout
router.post('/logout', 
  authenticateToken,
  authController.logout.bind(authController)
);

// Perfil usuario actual
router.get('/me', 
  authenticateToken,
  authController.getProfile.bind(authController)
);

export default router;

// routes/products.ts
import express from 'express';
import { ProductController } from '@/controllers/ProductController';
import { validateBody, validateQuery } from '@/middleware/validation';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { ProductCreateSchema, ProductUpdateSchema, ProductQuerySchema } from '@/schemas/product';

const router = express.Router();
const productController = new ProductController();

// Obtener productos con filtros
router.get('/', 
  validateQuery(ProductQuerySchema),
  productController.getProducts.bind(productController)
);

// Buscar productos
router.get('/search', productController.searchProducts.bind(productController));

// Obtener producto específico
router.get('/:id', productController.getProductById.bind(productController));

// Crear producto (admin only)
router.post('/', 
  authenticateToken,
  requireAdmin,
  validateBody(ProductCreateSchema),
  productController.createProduct.bind(productController)
);

// Actualizar producto (admin only)
router.put('/:id', 
  authenticateToken,
  requireAdmin,
  validateBody(ProductUpdateSchema),
  productController.updateProduct.bind(productController)
);

// Eliminar producto (admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  productController.deleteProduct.bind(productController)
);

// Analytics de productos (admin only)
router.get('/analytics/overview', 
  authenticateToken,
  requireAdmin,
  productController.getProductAnalytics.bind(productController)
);

export default router;

// routes/chat.ts
import express from 'express';
import { ChatController } from '@/controllers/ChatController';
import { validateBody } from '@/middleware/validation';
import { ChatMessageSchema } from '@/schemas/chat';
import { authenticateToken } from '@/middleware/auth';

const router = express.Router();
const chatController = new ChatController();

// Procesar mensaje del chat
router.post('/message', 
  validateBody(ChatMessageSchema),
  chatController.processMessage.bind(chatController)
);

// Obtener historial (requiere auth o sessionId)
router.get('/history', chatController.getChatHistory.bind(chatController));

// Limpiar historial
router.delete('/clear', 
  authenticateToken,
  chatController.clearHistory.bind(chatController)
);

// Feedback sobre respuesta
router.post('/feedback', 
  authenticateToken,
  chatController.submitFeedback.bind(chatController)
);

// Iniciar nueva sesión
router.post('/session', chatController.createSession.bind(chatController));

export default router;

// routes/admin.ts
import express from 'express';
import { AdminController } from '@/controllers/AdminController';
import { validateBody } from '@/middleware/validation';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { AIConfigSchema } from '@/schemas/admin';

const router = express.Router();
const adminController = new AdminController();

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard metrics
router.get('/metrics', adminController.getDashboardMetrics.bind(adminController));

// Analytics detallados
router.get('/analytics', adminController.getDetailedAnalytics.bind(adminController));

// Configuración de IA
router.get('/ai-config', adminController.getAIConfig.bind(adminController));
router.post('/ai-config', 
  validateBody(AIConfigSchema),
  adminController.updateAIConfig.bind(adminController)
);
router.post('/ai-config/test', adminController.testAIConnection.bind(adminController));

// Gestión de usuarios
router.get('/users', adminController.getUsers.bind(adminController));
router.put('/users/:id/role', adminController.updateUserRole.bind(adminController));
router.delete('/users/:id', adminController.deactivateUser.bind(adminController));

// Logs del sistema
router.get('/logs', adminController.getSystemLogs.bind(adminController));

// Exportar reportes
router.get('/export/products', adminController.exportProducts.bind(adminController));
router.get('/export/analytics', adminController.exportAnalytics.bind(adminController));

export default router;

// routes/recommendations.ts
import express from 'express';
import { RecommendationController } from '@/controllers/RecommendationController';
import { authenticateToken } from '@/middleware/auth';
import { validateBody } from '@/middleware/validation';
import { UserPreferencesSchema, InteractionSchema } from '@/schemas/recommendation';

const router = express.Router();
const recommendationController = new RecommendationController();

// Obtener recomendaciones (requiere auth o guest session)
router.get('/', recommendationController.getRecommendations.bind(recommendationController));

// Actualizar preferencias
router.put('/preferences', 
  authenticateToken,
  validateBody(UserPreferencesSchema),
  recommendationController.updatePreferences.bind(recommendationController)
);

// Registrar interacción con producto
router.post('/interaction', 
  validateBody(InteractionSchema),
  recommendationController.recordInteraction.bind(recommendationController)
);

// Analytics de recomendaciones (admin)
router.get('/analytics', 
  authenticateToken,
  recommendationController.getRecommendationAnalytics.bind(recommendationController)
);

export default router;