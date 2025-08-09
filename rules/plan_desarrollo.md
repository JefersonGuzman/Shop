## Plan de Trabajo y Bitácora — Makers Tech ChatBot

### Contexto y fuentes
- Lineamientos analizados: `rules/arquitectura_backend.md`, `rules/cursorrules.md`, `rules/esquema_validacion_zod.md`, `rules/rutas_expres.md`, `rules/servicio_llm.md`, `rules/System_Prompt_bot.md`, `rules/prompt_desarrollo_app.md`.
- Objetivos clave: ChatBot de inventario, sistema de recomendaciones, dashboard administrativo, configuración de IA (Groq/OpenAI), validación con Zod, MongoDB.

### Enfoque de desarrollo
- Backend (Node.js + TypeScript + Express/Fastify) con MongoDB Atlas y Mongoose.
- Frontend (React + TypeScript + Tailwind + shadcn/ui) con Zustand.
- Validación compartida con Zod; diseño DRY y Clean Code; modularidad en `controllers`, `services`, `models`, `routes`, `middleware`.
- Abstracción de IA con `AIService` y proveedores Groq/OpenAI; prompt dinámico con contexto de inventario y usuario.

---

### Roadmap por fases con checklist

#### Fase 0 — Preparación y cimientos
- [x] Analizar carpeta `rules/` y lineamientos
- [x] Crear este plan y bitácora inicial
- Definir estructura del repositorio
  - [x] `backend/` (TypeScript + Express)
  - [ ] `frontend/` (Vite + React + TS)
- Herramientas base
  - [x] TypeScript y `tsconfig` en `backend/`
  - [ ] ESLint + Prettier
  - [ ] `.editorconfig`
- Gestión de entorno
  - [x] `backend/env.sample` (sin secretos)
  - [ ] Carga de variables en desarrollo y CI (segura)
- Scripts
  - [x] `backend`: `dev`, `build`, `start`
  - [ ] `frontend`: `dev`, `build`, `preview`
- [ ] (Opcional) CI mínima y husky para lint-staged

#### Fase 1 — Backend MVP (API REST)
- [ ] Estructura base `backend/src/{controllers,services,models,routes,middleware,schemas,config}`
- [ ] Conexión a MongoDB Atlas con pool y timeouts; manejo de errores robusto
- Modelos Mongoose
  - [ ] `User`
  - [ ] `Product`
  - [ ] `ChatSession`
  - [ ] `AIConfig`
- Middlewares
  - [ ] `authenticateToken`
  - [ ] `requireAdmin`
  - [ ] `validateBody` / `validateQuery`
- Servicios
  - [ ] `AuthService`
  - [ ] `ProductService`
  - [ ] `AIService` (skeleton con fallback)
- Rutas
  - [ ] `/api/auth`
  - [ ] `/api/products`
  - [ ] `/api/chat`
  - [ ] `/api/recommendations`
  - [ ] `/api/admin`
- [ ] Zod schemas alineados con `rules/esquema_validacion_zod.md`
- [ ] Índices críticos e inicialización en desarrollo
- [ ] Tests básicos (Jest + Supertest) para rutas core y middlewares

#### Fase 1 — Frontend MVP
- [ ] Bootstrap con Vite + React + TS
- [ ] Tailwind + shadcn/ui instalados y configurados
- [ ] Estado global con Zustand (persist)
- [ ] ChatBot UI: Header, Messages, Input; estados loading/error; accesibilidad
- [ ] Servicios HTTP (axios con interceptors de auth)
- [ ] Tipos compartidos y utils
- [ ] Datos mock iniciales y flujo básico de consulta

#### Fase 2 — Inteligencia (Chat avanzado y recomendaciones)
- [ ] Parser de intenciones básico y extracción de parámetros
- [ ] Prompt builder con contexto (inventario, usuario, historial)
- [ ] Integración real con Groq/OpenAI y fallback
- [ ] Sistema de recomendaciones con scoring y categorías
- [ ] Registro de interacciones y actualización de preferencias

#### Fase 3 — Administración (Dashboard y settings IA)
### Criterios de aceptación — Backend MVP
- [x] `GET /health` responde `{ status: 'OK', service, timestamp }`
- [ ] `GET /api/products` retorna lista paginada con filtros válidos
- [ ] `GET /api/products/search` busca por texto y filtra
- [ ] `POST /api/auth/login` valida y responde tokens; error en credenciales inválidas
- [ ] `GET /api/auth/me` retorna 401 sin token y datos de usuario con token
- [ ] `POST /api/chat/message` valida con Zod y devuelve estructura esperada
- [ ] Logs básicos y manejo de errores consistente (formato JSON)

---

### Sprint 1 — Objetivos (48–72h)
- [ ] Conexión MongoDB Atlas y helper de DB con timeouts
- [ ] Modelo `Product` + índices + seed mínima en desarrollo
- [ ] `ProductService.getProducts` y `GET /api/products`
- [ ] `ProductController.searchProducts` y `GET /api/products/search`
- [ ] Middleware `validateQuery`/`validateBody` con Zod
- [ ] `AuthService.login` + `POST /api/auth/login` (sin registro aún)

---

### Backlog técnico
- [ ] Logger con `winston` y niveles por entorno
- [ ] Middleware de errores centralizado
- [ ] Rate limiting y `helmet` tuning por entorno
- [ ] Tests (Jest + Supertest) para products y auth
- [ ] Dockerfile y compose para dev
- [ ] CI mínima (lint + build)

---
- [ ] Dashboard con Recharts: stock por categoría, marcas, tendencias de chat
- [ ] Gestión de inventario: CRUD de productos y alertas de stock
- [ ] Configuración IA: API keys, selección de modelos, parámetros, test de conexión
- [ ] Exportación de reportes (CSV/PDF)

---

### Definition of Done (DoD)
- Código tipado, legible y modular; sin duplicaciones; cumple lint y tests.
- Validaciones Zod en endpoints públicos; errores manejados y mensajes consistentes.
- Tokens JWT seguros y roles aplicados donde corresponde.
- Consultas a MongoDB con índices adecuados; operaciones críticas con timeouts.
- UI accesible, responsive y con estados de carga/errores claros.
- Documentación mínima en código con JSDoc donde hay lógica compleja.

---

### Riesgos y mitigaciones
- Gestión de secretos y API keys: usar `crypto` y variables de entorno; nunca commitear secretos.
- Límite/rate de proveedores LLM: implementar fallback y reintentos exponenciales.
- Calidad de datos de inventario: validar esquemas y normalizar especificaciones.
- Performance: paginación, proyecciones, agregaciones optimizadas y caching selectivo donde aplique.

---

### Próximas acciones inmediatas
- [x] Backend: endpoint `/health` para validación rápida
- [ ] Backend: conexión a MongoDB Atlas y helper de conexión
- [ ] Backend: modelos base (`User`, `Product`, `ChatSession`, `AIConfig`)
- [ ] Backend: rutas mínimas `GET /api/products` y `GET /api/auth/me`
- [ ] Tooling: configurar ESLint, Prettier y `.editorconfig`
- [ ] Frontend: bootstrap con Vite + React + TS

---

### Bitácora de avances
- [x] 2025-08-09 — Revisión integral de `rules/` y extracción de lineamientos clave
- [x] 2025-08-09 — Creación de `rules/plan_desarrollo.md` con roadmap, DoD y próximas acciones
- [x] 2025-08-09 — Scaffold inicial de `backend/` (TS + Express), endpoint `/health`, build OK
- [x] 2025-08-09 — Commits iniciales: `docs` (plan) y `feat` (backend scaffold)
- [ ] 2025-08-09 — Definición Sprint 1 y criterios de aceptación del Backend MVP
- [ ] {pendiente} — Estructura `frontend/` y configuración de tooling compartido

Nota: Actualizar esta sección con cada hito relevante (breve descripción y fecha).


