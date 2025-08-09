# Prompt de Desarrollo: Makers Tech ChatBot System

## Contexto del Proyecto

Eres un desarrollador senior encargado de crear un **sistema completo de ChatBot para Makers Tech**, una tienda de tecnología. El proyecto debe impresionar al CEO con características innovadoras y arquitectura sólida.

## Objetivos Principales

### 1. ChatBot Inteligente de Inventario
- **Funcionalidad Core**: Responder consultas sobre productos, stock, características y precios desde MongoDB
- **Conversacional**: Mantener contexto y responder de manera natural
- **Informativo**: Proporcionar detalles específicos según la consulta
- **Persistente**: Historial de conversaciones almacenado en base de datos

### 2. Sistema de Recomendaciones (Opcional Premium)
- **Personalización**: Categorizar productos según preferencias del usuario almacenadas en MongoDB
- **Clasificación**: "Altamente Recomendado", "Podría Interesarte", "Otros"
- **Inteligente**: Aprender de las interacciones y actualizar preferencias en tiempo real

### 3. Dashboard Administrativo (Opcional Premium)
- **Métricas Visuales**: Gráficos de stock, ventas y categorías desde MongoDB aggregations
- **Gestión**: CRUD de productos con validación y persistencia
- **Analytics**: Reportes y estadísticas detalladas en tiempo real
- **Configuración IA**: Gestión segura de API Keys con encriptación
- **Gestión Usuarios**: Panel de administración de usuarios y roles

## Especificaciones Técnicas

### Stack Requerido
```typescript
// Frontend: React 18+ con TypeScript
// Backend: Node.js + Express/Fastify + TypeScript
// Base de Datos: MongoDB + Mongoose ODM
// Autenticación: JWT + bcrypt + middleware personalizado
// Styling: Tailwind CSS + shadcn/ui
// Estado: Zustand (preferido) con persist middleware
// Gráficos: Recharts
// Icons: Lucide React
// Validación: Zod (compartido frontend/backend)
// API Client: Axios con interceptors para auth
// Encriptación: crypto (Node.js) para API keys
```

### Arquitectura de Datos MongoDB
```typescript
// Mongoose Schemas

interface UserDocument extends Document {
  _id: ObjectId;
  email: string;
  password: string; // Hash con bcrypt
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  preferences: UserPreferencesType;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

interface ProductDocument extends Document {
  _id: ObjectId;
  name: string;
  brand: 'HP' | 'Dell' | 'Apple' | 'Lenovo' | 'Asus' | 'Samsung';
  category: 'laptop' | 'desktop' | 'tablet' | 'smartphone' | 'accessory';
  price: number;
  stock: number;
  specifications: {
    processor?: string;
    ram?: string;
    storage?: string;
    screen?: string;
    os?: string;
    graphics?: string;
    [key: string]: any;
  };
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface ChatSessionDocument extends Document {
  _id: ObjectId;
  userId?: ObjectId;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
      productsReferenced: ObjectId[];
      actionType: 'search' | 'recommendation' | 'comparison' | 'info';
      confidence: number;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface AIConfigDocument extends Document {
  _id: ObjectId;
  provider: 'groq' | 'openai';
  apiKey: string; // Encriptado con crypto
  modelName: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  lastTested?: Date;
  status: 'active' | 'inactive' | 'error';
  usage: {
    totalTokens: number;
    totalRequests: number;
    currentMonth: number;
    estimatedCost: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Requerimientos Funcionales Detallados

### ChatBot Core
1. **Parser de Intenciones Natural**
   ```typescript
   // Ejemplos de consultas a manejar:
   // "¿Cuántas laptops HP tienen?"
   // "Muéstrame la Dell más barata"
   // "Computadoras con 16GB RAM"
   // "¿Qué recomiendas para gaming?"
   ```

2. **Respuestas Contextuales**
   - Mantener historial de conversación
   - Referirse a productos mencionados previamente
   - Sugerir productos relacionados
   - Hacer preguntas de seguimiento relevantes

3. **Acciones Inteligentes**
   - Filtrado dinámico por especificaciones
   - Comparación de productos
   - Sugerencias basadas en presupuesto
   - Links directos a productos

### Sistema de Recomendaciones
1. **Algoritmo de Scoring**
   ```typescript
   interface RecommendationScore {
     // Puntuación por coincidencia de marca (0-30 puntos)
     brandMatch: number;
     
     // Puntuación por coincidencia de categoría (0-25 puntos)
     categoryMatch: number;
     
     // Puntuación por rango de precio (0-20 puntos)
     priceRange: number;
     
     // Puntuación por especificaciones técnicas (0-15 puntos)
     specMatch: number;
     
     // Boost por popularidad del producto (0-10 puntos)
     popularityBoost: number;
     
     // Puntuación total calculada (0-100 puntos)
     total: number;
   }
   ```

2. **Categorización Dinámica**
   - **Altamente Recomendado**: Score 80-100
   - **Podría Interesarte**: Score 50-79  
   - **Otros**: Score 0-49

### Dashboard Administrativo
1. **Métricas Visuales Requeridas**
   - Gráfico de barras: Stock por categoría
   - Gráfico circular: Distribución por marca
   - Línea temporal: Tendencias de consultas
   - Heatmap: Productos más buscados

2. **Funcionalidades Admin**
   - Gestión completa de inventario
   - Alertas de stock bajo (<5 unidades)
   - Análisis de patrones de búsqueda
   - Exportar reportes en PDF/CSV

3. **Configuración de IA (Settings)**
   - **API Key Management**: Formularios seguros para Groq y OpenAI
   - **Model Selection**: Dropdown con modelos disponibles por proveedor
   - **Parameter Tuning**: Controles para temperature, maxTokens, etc.
   - **Connection Testing**: Botón para validar API keys y conectividad
   - **Provider Switching**: Toggle entre Groq/OpenAI con fallback automático
   - **Usage Analytics**: Métricas de uso de tokens y costos estimados

## Instrucciones de Desarrollo

### Fase 1: Fundación (Prioritario)
1. **Setup del Proyecto**
   ```bash
   # Crear estructura de carpetas según cursorrules.md
   # Configurar TypeScript + Tailwind + shadcn/ui
   # Setup de Zustand store
   ```

2. **Datos Mock Realistas**
   - Crear inventario de 50+ productos variados
   - Incluir especificaciones técnicas detalladas
   - Simular datos de usuarios y preferencias

3. **ChatBot Básico**
   - Interfaz de chat responsive
   - Parser de intenciones básico
   - Respuestas para consultas comunes
   - Búsqueda y filtrado de productos

### Fase 2: Inteligencia (Importante)
1. **ChatBot Avanzado**
   - Procesamiento de consultas complejas
   - Contexto conversacional
   - Sugerencias inteligentes
   - Manejo de errores elegante

2. **Sistema de Recomendaciones**
   - Algoritmo de scoring implementado
   - Interface para capturar preferencias
   - Actualización dinámica de recomendaciones

### Fase 3: Administración (Opcional Premium)
1. **Dashboard Completo**
   - Todos los gráficos requeridos
   - CRUD de productos funcional
   - Sistema de reportes
   - Responsive design

2. **Configuración de IA**
   - Interface para configurar API Keys
   - Selección de modelos LLM
   - Parámetros ajustables (temperature, tokens)
   - Sistema de testing y validación
   - Fallback automático entre providers

## Criterios de Calidad y Mejores Prácticas

### Verificación DRY
```typescript
// ANTES de crear cualquier función/componente:
// 1. Buscar en utils/ si existe algo similar
// 2. Revisar hooks/ para lógica compartida
// 3. Verificar components/common/ para UI reutilizable
// 4. Consultar services/ para lógica de negocio

// CONVENCIONES DE COMENTARIOS:
// ❌ NUNCA comentarios en línea: value: number; // esto está mal
// ✅ SIEMPRE comentarios arriba:
// Valor calculado del producto
value: number;
```

### Patrones de Implementación
1. **Custom Hooks para Lógica Reutilizable**
   ```typescript
   // useProductSearch.ts
   // useRecommendations.ts  
   // useChatHistory.ts
   // useProductFilter.ts
   // useAIModel.ts - Hook para gestión de modelos LLM
   // useAPIConnection.ts - Hook para testing de conexiones
   ```

2. **Servicios Modulares**
   ```typescript
   // productService.ts - Operaciones CRUD
   // chatService.ts - Lógica del bot
   // recommendationService.ts - Algoritmos
   // analyticsService.ts - Métricas
   // aiService.ts - Abstracción para LLM providers
   // groqService.ts - Implementación específica Groq
   // openaiService.ts - Implementación específica OpenAI
   ```

3. **Componentes Compuestos**
   ```typescript
   // ChatBot compound component
   <ChatBot>
     <ChatBot.Header />
     <ChatBot.Messages />
     <ChatBot.Input />
   </ChatBot>
   ```

## Casos de Uso Críticos a Implementar

### Flujos de Usuario ChatBot
1. **Consulta Básica de Stock**
   ```
   Usuario: "¿Cuántas laptops tienen?"
   Bot: "Tenemos 15 laptops disponibles: 5 HP, 4 Dell, 3 Apple, 2 Lenovo y 1 Asus. ¿Te interesa alguna marca en particular?"
   ```

2. **Búsqueda por Especificaciones**
   ```
   Usuario: "Laptop para gaming con 16GB RAM"
   Bot: "Para gaming recomiendo estas 3 opciones con 16GB RAM: [lista con specs y precios]"
   ```

3. **Comparación de Productos**
   ```
   Usuario: "Compara la MacBook Pro con la Dell XPS"
   Bot: [Tabla comparativa con especificaciones clave]
   ```

### Flujos de Recomendación
1. **Onboarding de Preferencias**
   - Capturar marca favorita
   - Rango de presupuesto
   - Uso principal (trabajo, gaming, estudio)

2. **Refinamiento Progresivo**
   - Aprender de clicks/interacciones
   - Ajustar scoring basado en feedback
   - Actualizar recomendaciones en tiempo real

## Deliverables Esperados

### MVP (Mínimo Viable)
- ✅ ChatBot funcional con consultas básicas
- ✅ Interfaz limpia y responsive
- ✅ Búsqueda y filtrado de productos
- ✅ Datos mock realistas

### Versión Completa
- ✅ Sistema de recomendaciones activo
- ✅ Dashboard administrativo
- ✅ Métricas y analytics
- ✅ Persistencia de datos usuario
- ✅ Configuración de modelos LLM (Groq/OpenAI)
- ✅ Sistema de API Key management seguro

### Características "Wow" para CEO
- 🎯 NLP avanzado para consultas naturales
- 🎯 Recomendaciones precisas y personalizadas
- 🎯 Visualizaciones interactivas impresionantes
- 🎯 Performance excepcional (<200ms respuestas)
- 🎯 UX intuitiva y moderna
- 🎯 Integración flexible con múltiples proveedores LLM
- 🎯 Sistema de configuración empresarial avanzado

## Comando de Inicio para Cursor
```
Crea la estructura completa del proyecto Makers Tech ChatBot siguiendo exactamente las especificaciones del cursorrules.md. 

IMPORTANTE: Aplica las convenciones de comentarios correctas:
- NUNCA uses comentarios en línea al lado del código
- SIEMPRE coloca comentarios arriba del código que describen
- Usa JSDoc para funciones complejas

Prioridad:
1. Setup inicial con TypeScript + Tailwind + shadcn/ui
2. Datos mock de productos realistas (50+ productos)
3. ChatBot MVP funcional
4. Estructura modular y reutilizable

Verifica SIEMPRE antes de crear si algo similar ya existe.
Aplica principios DRY, modular y buenas prácticas.
Enfócate en código limpio, tipado y bien documentado.
```

## Notas Importantes

- **Impresionar al CEO**: Incluir detalles visuales y funcionalidades que demuestren expertise técnico
- **Escalabilidad**: Diseñar pensando en crecimiento futuro del catálogo
- **Performance**: Optimizar para respuestas rápidas del ChatBot
- **Accesibilidad**: Cumplir estándares WCAG básicos
- **Mobile-First**: Diseño responsive desde el inicio

¡Inicia el desarrollo priorizando funcionalidad sobre perfección visual inicial!