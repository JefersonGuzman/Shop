# Makers Tech ChatBot - Cursor Rules

## Proyecto Overview
Desarrollo de un ChatBot inteligente para Makers Tech (tienda de tecnología) con sistema de recomendaciones y dashboard administrativo.

## Arquitectura y Estructura

### Stack Tecnológico Recomendado
- **Frontend**: React 18+ con TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado Global**: Zustand o Redux Toolkit
- **Base de Datos**: JSON local/mock + IndexedDB para persistencia
- **Gráficos**: Recharts o Chart.js
- **Icons**: Lucide React

### Estructura de Carpetas
```
src/
├── components/
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── common/          # Componentes reutilizables
│   ├── chat/            # Componentes del ChatBot
│   ├── dashboard/       # Componentes del admin dashboard
│   ├── settings/        # Configuración de IA y API Keys
│   └── recommendation/  # Sistema de recomendaciones
├── hooks/               # Custom hooks reutilizables
├── services/            # Lógica de negocio y APIs
│   ├── ai/              # Servicios de integración con LLM
│   ├── groq/            # Servicio específico de Groq
│   └── openai/          # Servicio específico de OpenAI
├── stores/              # Estado global (Zustand/Redux)
├── types/               # Definiciones TypeScript
├── utils/               # Funciones utilitarias
├── data/                # Datos mock del inventario
└── constants/           # Constantes de la aplicación
```

## Principios de Desarrollo

### 1. DRY (Don't Repeat Yourself)
- **VERIFICAR ANTES DE CREAR**: Siempre busca si ya existe un componente, hook o función similar
- Crear funciones utilitarias para lógica repetitiva
- Usar custom hooks para estado y lógica compartida
- Abstraer patrones comunes en componentes base

### 2. Modularidad
- Componentes pequeños y enfocados en una responsabilidad
- Separar lógica de negocio de la presentación
- Usar composición sobre herencia
- Interfaces claras entre módulos

### 3. Reutilización
- Componentes genéricos parametrizables
- Hooks personalizados para lógica compartida
- Servicios reutilizables para operaciones comunes
- Tipos TypeScript compartidos

## Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (`ChatBot`, `ProductCard`)
- **Hooks**: camelCase con prefijo 'use' (`useProductSearch`, `useRecommendations`)
- **Funciones**: camelCase (`calculatePrice`, `formatProductData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS`, `PRODUCT_CATEGORIES`)
- **Tipos**: PascalCase con sufijo 'Type' (`ProductType`, `UserPreferenceType`)

### Convenciones de Comentarios
**NUNCA usar comentarios en línea al lado del código:**
```typescript
// ❌ INCORRECTO - No hacer esto
brandMatch: number; // 0-30 puntos
price: number; // Precio en USD

// ✅ CORRECTO - Comentarios arriba del código
// Puntuación por coincidencia de marca (0-30 puntos)
brandMatch: number;

// Precio del producto en USD
price: number;
```

**Reglas de comentarios:**
- Comentarios SIEMPRE arriba del código que describen
- Usar JSDoc para funciones y métodos complejos
- Comentarios de línea única con `//`
- Comentarios de bloque con `/* */` solo para documentación extensa
- No comentar código obvio
- Comentarios en español para lógica de negocio específica del proyecto

### Organización de Imports
```typescript
// 1. React y librerías externas
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// 2. Hooks personalizados
import { useProductSearch } from '@/hooks/useProductSearch';

// 3. Componentes internos
import { ProductCard } from '@/components/common/ProductCard';

// 4. Tipos y constantes
import type { ProductType } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/constants/products';
```

## Reglas Específicas del Proyecto

### ChatBot
1. **Procesamiento de Lenguaje Natural Básico**
   - Crear un parser simple para extraer intenciones
   - Manejar variaciones de preguntas comunes
   - Respuestas contextuales y conversacionales

2. **Gestión de Estado del Chat**
   - Historial de conversaciones
   - Contexto de la conversación actual
   - Estado de tipeo/loading

### Sistema de Recomendaciones
1. **Algoritmo de Recomendación**
   - Basado en preferencias del usuario
   - Categorización: "Altamente Recomendado", "Podría Interesarte", "Otros"
   - Filtros por precio, marca, categoría

2. **Persistencia de Preferencias**
   - Usar IndexedDB para guardar preferencias
   - Sistema de puntuación para productos

### Dashboard Administrativo
1. **Métricas de Stock**
   - Gráficos interactivos con Recharts
   - Filtros dinámicos por categoría/marca
   - Exportación de reportes

2. **Gestión de Inventario**
   - CRUD completo de productos
   - Alertas de stock bajo
   - Histórico de cambios

3. **Configuración de IA (Settings)**
   - Configuración de API Keys para modelos LLM
   - Selección entre Groq y OpenAI
   - Configuración de parámetros del modelo
   - Validación y testing de conexión API

## Checklist de Desarrollo

### Antes de Crear Nuevo Código
- [ ] ¿Existe ya un componente similar?
- [ ] ¿Puedo reutilizar un hook existente?
- [ ] ¿Esta función ya existe en utils?
- [ ] ¿Los tipos están definidos correctamente?

### Al Crear Componentes
- [ ] Componente es responsabilidad única
- [ ] Props tipadas con TypeScript
- [ ] Manejo de estados de loading/error
- [ ] Accesibilidad (aria-labels, keyboard navigation)
- [ ] Responsive design
- [ ] Comentarios arriba del código, NUNCA en línea

### Al Crear Hooks
- [ ] Lógica reutilizable extraída
- [ ] Manejo de cleanup apropiado
- [ ] Tipado correcto del retorno
- [ ] Documentación JSDoc
- [ ] Comentarios descriptivos arriba de la lógica compleja

## Performance y Optimización

### React
- Usar `React.memo()` para componentes que no cambian frecuentemente
- `useMemo()` y `useCallback()` para cálculos costosos
- Lazy loading para rutas y componentes grandes
- Evitar re-renders innecesarios

### Estado
- Estado local vs global apropiadamente
- Normalizar estructuras de datos complejas
- Debounce para búsquedas y filtros

## Patrones de Diseño a Implementar

### 1. Provider Pattern
```typescript
// Para compartir estado del usuario y preferencias
<UserPreferencesProvider>
  <ChatBotProvider>
    <App />
  </ChatBotProvider>
</UserPreferencesProvider>
```

### 2. Compound Components
```typescript
// Para componentes complejos como el dashboard
<Dashboard>
  <Dashboard.Header />
  <Dashboard.Sidebar />
  <Dashboard.Content />
</Dashboard>
```

### 3. Custom Hooks Pattern
```typescript
// Para lógica reutilizable
const useProductFilter = (products, filters) => {
  // Lógica de filtrado reutilizable
};
```

## Testing Strategy

### Componentes a Testear
- Lógica del ChatBot (parser de intenciones)
- Algoritmo de recomendaciones
- Funciones de filtrado y búsqueda
- Componentes críticos del dashboard

### Herramientas
- Jest + React Testing Library
- Mock data para desarrollo y testing

## Consideraciones de UX/UI

### ChatBot Interface
- Interfaz conversacional intuitiva
- Indicadores de tipeo
- Historial scrolleable
- Acciones rápidas (botones de respuesta)

### Dashboard
- Navegación clara y lógica
- Gráficos interactivos y informativos
- Responsive para diferentes dispositivos
- Temas claro/oscuro

## Datos Mock Structure
```typescript
interface ProductType {
  id: string;
  name: string;
  brand: string;
  category: 'laptop' | 'desktop' | 'tablet' | 'smartphone';
  price: number;
  stock: number;
  specifications: Record<string, any>;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
}

interface AIModelConfig {
  id: string;
  provider: 'groq' | 'openai';
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  lastTested?: string;
  status: 'active' | 'inactive' | 'error';
}

interface AppSettings {
  aiModel: AIModelConfig;
  chatbot: {
    responseDelay: number;
    maxHistoryLength: number;
    enableTypingIndicator: boolean;
  };
  dashboard: {
    defaultCharts: string[];
    refreshInterval: number;
  };
}
```

## Reglas de Commit
- feat: Nueva funcionalidad
- fix: Corrección de bugs
- refactor: Refactoring sin cambios funcionales
- docs: Documentación
- style: Cambios de formato
- test: Agregar o modificar tests

## Comandos Cursor Específicos

### Verificación Antes de Crear
Antes de crear cualquier componente/función, usa:
```
@workspace ¿Existe algo similar a [descripción]?
```

### Refactoring Inteligente
```
@workspace Encuentra código duplicado en [carpeta/archivo]
@workspace Sugiere abstracciones para [patrón repetitivo]
```

### Optimización
```
@workspace Analiza performance de [componente]
@workspace Sugiere mejoras de accesibilidad
```

### Aplicar Convenciones de Comentarios
```
@workspace Revisa y corrige comentarios en línea, mueve todos los comentarios arriba del código correspondiente
@workspace Aplica convenciones de comentarios JSDoc a todas las funciones
```

## Objetivos de Calidad
- 90%+ TypeScript coverage
- Componentes reutilizables al 80%
- Tiempo de respuesta del ChatBot < 200ms
- Dashboard responsive en todos los dispositivos
- Código autodocumentado con JSDoc donde sea necesario