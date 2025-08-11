# Makers Tech ChatBot

Asistente conversacional para comercio electrónico de Makers Tech. Incluye backend API, frontend web y un módulo de IA que recomienda productos con base en el inventario real.

## Tecnologías del Proyecto (Tech Stack)

- Lenguaje
  - TypeScript (backend y frontend)

- Backend
  - Node.js 20, Express
  - Mongoose (MongoDB)
  - Autenticación JWT (`jsonwebtoken`), `bcrypt`
  - Subida/gestión de archivos: `multer`, Cloudinary SDK
  - Seguridad y middleware: `helmet`, `cors`, `compression`, `dotenv`
  - Validación: Zod

- Base de datos
  - MongoDB Atlas

- Inteligencia Artificial
  - Integraciones con Groq API y OpenAI API

- Frontend
  - React 19, React Router 7
  - Vite
  - Tailwind CSS (+ `@tailwindcss/forms`)
  - Axios
  - Iconos: `lucide-react`

- Tooling / Dev
  - TypeScript, ESLint, Prettier
  - PostCSS, Autoprefixer
  - `ts-node-dev` para desarrollo
  - Pruebas backend: Supertest, `mongodb-memory-server`

- Deploy / Infraestructura
  - Render.com (servicio web para backend y hosting estático para frontend)
  - Variables de entorno para claves y configuración
  - Node 20 en producción


