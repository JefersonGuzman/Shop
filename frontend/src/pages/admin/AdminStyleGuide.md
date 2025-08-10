# Guía de Estilo del Panel de Administración

Este documento describe el sistema de diseño utilizado en la vista de `AdminProducts` y debe servir como referencia para unificar el estilo en todas las vistas del panel de administración.

## Filosofía

El diseño es limpio, funcional y moderno, con un buen contraste y una clara jerarquía visual. Se prioriza la facilidad de uso y la eficiencia para el administrador.

## Paleta de Colores (Tokens de TailwindCSS)

Se utilizan nombres de clases semánticas de TailwindCSS. Estos colores deben ser definidos en `tailwind.config.cjs`.

- **Fondo principal**: `bg-background` (Un color oscuro o claro base).
- **Superficies / Tarjetas**: `bg-surface` (Ligeramente distinto al fondo para crear profundidad, ej. tarjetas, modales).
- **Bordes**: `border-border` (Color sutil para delinear elementos).
- **Texto principal**: `text-text` (Alto contraste con el fondo).
- **Texto secundario/muted**: `text-mutedText` (Menor contraste, para metadatos o texto menos importante).

- **Primario (Acentos y Acciones Principales)**:
  - Fondo: `bg-primary`
  - Texto sobre primario: `text-primary-foreground`
  - Hover: `hover:bg-primary/90`

- **Peligro / Eliminación (Rojo)**:
  - Base: `bg-red-600`, `text-red-600`
  - Hover: `hover:bg-red-700`
  - Fondo claro (para alertas): `bg-red-100`, `text-red-800`

- **Éxito (Verde)**:
  - Fondo claro (para notificaciones): `bg-green-100`, `text-green-800`

- **Advertencia (Amarillo)**:
  - Fondo claro (para badges): `bg-yellow-200`, `text-yellow-800`

- **Información (Azul)**:
  - Fondo claro (para barras de selección): `bg-blue-100`, `text-blue-800`

## Tipografía

- **Fuente**: `Inter`, `sans-serif`.
- **Títulos de Página (`h1`)**: `text-2xl font-bold` (Ej: "Gestión de Productos").
- **Texto Normal**: `text-base` (implícito).
- **Texto Pequeño**: `text-sm` (Ej: en diálogos, botones).
- **Texto Muy Pequeño (Cabeceras de tabla)**: `text-xs`.

## Componentes

### 1. Botones

- **Botón Primario (con icono)**:
  - **Uso**: Para la acción principal de la página (Ej: "Nuevo Producto").
  - **Clases**: `h-9 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50`
  - **Icono**: `lucide-react`, tamaño `18`.

- **Botón de Peligro (Confirmación)**:
  - **Uso**: Para confirmar acciones destructivas.
  - **Clases**: `h-9 px-4 inline-flex items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700`

- **Botón Secundario/Borde**:
  - **Uso**: Para acciones secundarias (Ej: "Cancelar").
  - **Clases**: `h-9 px-4 inline-flex items-center justify-center rounded-md border border-border hover:bg-black/5`

- **Botón de Icono**:
  - **Uso**: Para acciones en línea en tablas (Editar, Eliminar).
  - **Clases**: `text-mutedText` con cambio de color en hover (`hover:text-primary` o `hover:text-red-600`).
  - **Icono**: `lucide-react`, tamaño `16`.

### 2. Tabla de Datos

- **Contenedor**: `bg-surface border border-border rounded-xl shadow-sm overflow-hidden`.
- **Cabecera (`thead`)**: `text-mutedText text-xs bg-black/5`.
  - **Celdas de cabecera (`th`)**: `py-2 px-3 font-medium`. Si es ordenable, `cursor-pointer`.
- **Cuerpo (`tbody`)**: 
  - **Filas (`tr`)**: `border-t border-border`. Efecto hover `hover:bg-black/5`. Fila seleccionada: `bg-blue-50`.
  - **Celdas (`td`)**: `py-2 px-3`.

### 3. Formularios e Inputs

- **Barra de Filtros**: Contenedor `flex items-center gap-4 mb-4 p-4 bg-surface border border-border rounded-xl`.
- **Input de Búsqueda (con icono)**:
  - **Contenedor**: `relative flex-grow`.
  - **Icono**: `absolute left-3 top-1/2 -translate-y-1/2 text-mutedText`, tamaño `18`.
  - **Input**: `h-9 w-full pl-10 pr-4 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary`.
- **Select (Desplegable)**:
  - **Clases**: `h-9 pl-3 pr-8 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary`.

#### 3.1 Carga de Imágenes
- **Input de Archivo**: `w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90`
- **Preview de Imágenes**: Grid `grid-cols-2 gap-2` con imágenes `w-full h-20 object-cover rounded-lg border border-border`
- **Botón de Eliminar Imagen**: `absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs`
- **Contenedor de Preview**: `space-y-2` con botón "Limpiar todas" `text-xs text-red-600 hover:text-red-700`

### 4. Badges (Etiquetas)

- **Uso**: Para mostrar estados o información categórica (Ej: Stock).
- **Badge de Peligro (Agotado)**: `px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full`.
- **Badge de Advertencia (Stock Bajo)**: `px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-full`.

### 5. Diálogo de Confirmación (Modal)

- **Overlay**: `fixed inset-0 bg-black/60 flex items-center justify-center z-50`.
- **Contenedor del Modal**: `bg-surface rounded-xl shadow-2xl p-6 w-full max-w-md m-4`.
- **Icono de Alerta**: Un círculo `bg-red-100` con un icono `text-red-600` dentro.
- **Título**: `text-lg font-bold text-text`.
- **Mensaje**: `text-sm text-mutedText mt-1`.

### 6. Notificaciones (Toasts)

- **Contenedor**: `fixed top-5 right-5 z-50 flex items-center gap-4 p-4 rounded-lg shadow-lg`.
- **Estilo de Éxito**: `bg-green-100 text-green-800`.
- **Estilo de Error**: `bg-red-100 text-red-800`.

### 7. Paginación

- **Contenedor**: `flex items-center justify-center gap-2 mt-4`.
- **Botones**: `h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-black/5 disabled:opacity-50`.
- **Botón de Página Activa**: `bg-primary text-primary-foreground`.

### 8. Funcionalidades Comunes del Panel de Administración

#### 8.1 Gestión de Datos
- **Crear Nuevo**: Botón principal con icono `Plus` y texto descriptivo
- **Editar**: Icono `Edit` en cada fila con hover `hover:text-primary`
- **Eliminar**: Icono `Trash2` en cada fila con hover `hover:text-red-600`
- **Selección Múltiple**: Checkbox en cada fila y checkbox "Seleccionar Todos" en cabecera
- **Eliminación Masiva**: Barra azul `bg-blue-100 border-blue-300` cuando hay elementos seleccionados

#### 8.2 Filtros y Búsqueda
- **Barra de Filtros**: Siempre visible con búsqueda por texto y filtros por categoría/marca
- **Búsqueda Debounced**: Delay de 500ms para optimizar rendimiento
- **Filtros Combinables**: Múltiples filtros aplicables simultáneamente

#### 8.3 Ordenamiento
- **Cabeceras Ordenables**: `cursor-pointer` con iconos `ChevronUp`/`ChevronDown`
- **Estado Visual**: Indicador claro de campo y dirección de ordenamiento

#### 8.4 Formularios
- **Modal Centrado**: Overlay con `bg-black/60` y modal centrado
- **Validación en Tiempo Real**: Mensajes de error claros y específicos
- **Estados de Carga**: Botones con `disabled` y spinners durante operaciones
- **Manejo de Errores**: Toast notifications para feedback inmediato

#### 8.5 Responsive Design
- **Grid Adaptativo**: `grid-cols-1 md:grid-cols-2` para formularios
- **Tabla Scrollable**: `overflow-hidden` en contenedor de tabla
- **Espaciado Consistente**: `gap-6` entre secciones, `gap-4` entre elementos

### 9. Vistas Específicas del Panel de Administración

#### 9.1 AdminProducts
- **Campos del Formulario**: Nombre, Marca, Categoría, Precio, Stock, SKU, Descripción, Imágenes, Tags
- **Carga de Imágenes**: Input de archivo múltiple con preview y validaciones
- **Filtros**: Búsqueda por nombre/SKU, filtro por categoría y marca
- **Ordenamiento**: Por SKU, nombre, marca, categoría, precio, stock

#### 9.2 AdminCategories
- **Campos del Formulario**: Nombre, Descripción, Color de marca (opcional)
- **Filtros**: Búsqueda por nombre
- **Ordenamiento**: Por nombre
- **Funcionalidades**: CRUD básico sin imágenes

#### 9.3 AdminBrands
- **Campos del Formulario**: Nombre, Descripción, Logo (imagen), Sitio web
- **Carga de Imágenes**: Logo único con preview
- **Filtros**: Búsqueda por nombre
- **Ordenamiento**: Por nombre

#### 9.4 AdminOffers
- **Campos del Formulario**: Título, Descripción, Descuento, Fecha inicio/fin, Productos aplicables
- **Filtros**: Búsqueda por título, filtro por estado (activa/inactiva)
- **Ordenamiento**: Por fecha de creación, título, descuento
- **Estados**: Badges para ofertas activas, expiradas, próximas

#### 9.5 AdminUsers
- **Campos del Formulario**: Nombre, Email, Rol, Estado (activo/inactivo)
- **Filtros**: Búsqueda por nombre/email, filtro por rol
- **Ordenamiento**: Por nombre, email, fecha de registro
- **Funcionalidades**: Cambio de rol, activar/desactivar usuarios

#### 9.6 AdminOrders
- **Campos del Formulario**: Cliente, Productos, Estado, Fecha, Total
- **Filtros**: Búsqueda por ID de orden, filtro por estado, fecha
- **Ordenamiento**: Por fecha, total, estado
- **Estados**: Badges para diferentes estados de orden (pendiente, procesando, enviado, entregado, cancelado)