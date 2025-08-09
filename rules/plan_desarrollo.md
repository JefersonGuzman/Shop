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
- [ ] Definir estructura del repositorio (`backend/` y `frontend/`)
- [ ] Configurar herramientas base: TypeScript, tsconfig, eslint/prettier, editorconfig
- [ ] Configurar `dotenv` y `env` seguros (incluir `.env.example` sin secretos)
- [ ] Configurar scripts de desarrollo y build
- [ ] (Opcional) CI mínima y husky para lint-staged

#### Fase 1 — Backend MVP (API REST)
- [ ] Estructura base `backend/src/{controllers,services,models,routes,middleware,schemas,config}`
- [ ] Conexión a MongoDB Atlas con pool y timeouts; manejo de errores robusto
- [ ] Modelos Mongoose: `User`, `Product`, `ChatSession`, `AIConfig`
- [ ] Middlewares: `authenticateToken`, `requireAdmin`, `validateBody`/`validateQuery`
- [ ] Servicios: `AuthService`, `ProductService`, `AIService` (skeleton con fallback)
- [ ] Rutas: `/api/auth`, `/api/products`, `/api/chat`, `/api/recommendations`, `/api/admin`
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
1) Crear estructura de carpetas `backend/` y `frontend/` con configuraciones base (TS, lint, scripts)
2) Implementar `backend` con conexión MongoDB, modelos y middlewares
3) Exponer rutas mínimas de salud y `auth`/`products` (GET) para validar pipeline

---

### Bitácora de avances
- [x] 2025-08-09 — Revisión integral de `rules/` y extracción de lineamientos clave
- [x] 2025-08-09 — Creación de `rules/plan_desarrollo.md` con roadmap, DoD y próximas acciones
- [ ] {pendiente} — Estructura inicial del repositorio y configuración tooling

Nota: Actualizar esta sección con cada hito relevante (breve descripción y fecha).


