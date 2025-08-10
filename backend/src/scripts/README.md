# Scripts de Inicialización de Base de Datos

Este directorio contiene scripts para inicializar la base de datos con datos de ejemplo para desarrollo y testing.

## 📋 Scripts Disponibles

### 1. `initializeAll.ts` - Script Principal
**Ejecuta todos los scripts en el orden correcto de dependencias.**

```bash
# Desde el directorio backend
npm run ts-node src/scripts/initializeAll.ts

# O con npx
npx ts-node src/scripts/initializeAll.ts
```

### 2. `initializeCategories.ts` - Categorías
**Crea la estructura jerárquica de categorías y subcategorías.**

```bash
npx ts-node src/scripts/initializeCategories.ts
```

**Características:**
- Categorías principales con subcategorías
- Estructura jerárquica (nivel 0 y 1)
- Campos SEO y metadatos
- Colores e iconos para UI

### 3. `initializeOrders.ts` - Órdenes
**Genera órdenes de ejemplo con usuarios y productos.**

```bash
npx ts-node src/scripts/initializeOrders.ts
```

**Características:**
- Órdenes con diferentes estados
- Items de orden con productos reales
- Direcciones de envío
- Estados de pago variados

### 4. `initializeOffers.ts` - Ofertas
**Crea ofertas de descuento con productos y categorías.**

```bash
npx ts-node src/scripts/initializeOffers.ts
```

**Características:**
- Descuentos porcentuales y fijos
- Fechas de vigencia
- Límites de uso
- Aplicación por productos y categorías

## 🚀 Uso Rápido

### Opción 1: Inicialización Completa (Recomendado)
```bash
cd backend
npx ts-node src/scripts/initializeAll.ts
```

### Opción 2: Scripts Individuales
```bash
cd backend

# Solo categorías
npx ts-node src/scripts/initializeCategories.ts

# Solo órdenes
npx ts-node src/scripts/initializeOrders.ts

# Solo ofertas
npx ts-node src/scripts/initializeOffers.ts
```

## ⚙️ Configuración

### Variables de Entorno
```bash
# En tu archivo .env
MONGODB_URI=mongodb://localhost:27017/makers-tech-chatbot
```

### Conexión por Defecto
Si no se especifica `MONGODB_URI`, se usa:
```
mongodb://localhost:27017/makers-tech-chatbot
```

## 📊 Datos Generados

### Categorías
- **Electrónicos** (con subcategorías: Computadoras, Smartphones, Tablets, Audio)
- **Ropa** (con subcategorías: Hombre, Mujer, Niños, Deportiva)
- **Hogar** (con subcategorías: Muebles, Decoración, Cocina, Jardín)
- **Deportes** (con subcategorías: Fitness, Outdoor, Natación, Ciclismo)
- **Libros** (con subcategorías: Ficción, No Ficción, Académicos, Infantiles)

### Órdenes
- 5 órdenes de ejemplo con diferentes estados
- Items de orden con productos reales
- Direcciones de envío completas
- Estados de pago variados

### Ofertas
- 5 ofertas de ejemplo (porcentuales y fijas)
- Diferentes fechas de vigencia
- Aplicación por productos y categorías
- Condiciones y términos variados

## 🔄 Re-inicialización

Los scripts están diseñados para ser seguros de ejecutar múltiples veces:

1. **Limpian datos existentes** antes de crear nuevos
2. **Manejan dependencias** automáticamente
3. **Crean datos de ejemplo** si no existen productos/usuarios

## ⚠️ Notas Importantes

- **Desarrollo solo**: Estos scripts son para desarrollo y testing
- **Datos de ejemplo**: No usar en producción
- **Dependencias**: Los scripts crean datos de ejemplo si no existen
- **Conexión**: Se cierra automáticamente al finalizar

## 🐛 Solución de Problemas

### Error de Conexión
```bash
# Verificar que MongoDB esté ejecutándose
mongod --version

# Verificar la URI de conexión
echo $MONGODB_URI
```

### Error de Dependencias
```bash
# Instalar dependencias
npm install

# Verificar TypeScript
npx tsc --version
```

### Limpiar Base de Datos
```bash
# Conectar a MongoDB
mongosh

# Seleccionar base de datos
use makers-tech-chatbot

# Limpiar colecciones
db.categories.deleteMany({})
db.orders.deleteMany({})
db.offers.deleteMany({})
```

## 📝 Personalización

Para modificar los datos generados:

1. **Editar arrays de datos** en cada script
2. **Modificar lógica de generación** según necesidades
3. **Agregar nuevos campos** si se han extendido los modelos

## 🎯 Próximos Pasos

Después de ejecutar los scripts:

1. **Verificar datos** en MongoDB Compass o mongosh
2. **Probar vistas administrativas** en el frontend
3. **Crear APIs** para consumir estos datos
4. **Implementar lógica de negocio** según requerimientos
