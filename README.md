# CRMAP - Sistema de Gestión

Sistema de gestión para abogados con React + Vite + Supabase.

## 🚀 Características

- ✅ **Usuarios** - Gestión de usuarios con permisos granulares
- ✅ **Clientes** - CRUD con validación de RUT chileno
- ✅ **Presupuestador** - Creación de presupuestos con códigos de servicio
- ✅ **Pipeline** - Gestión visual de tratos en 6 etapas
- ✅ **Pagos** - Control de cobros múltiples por presupuesto
- ✅ **Autenticación** - Login con Supabase Auth
- ✅ **Exportación** - Exportar datos a Excel/CSV

## 📋 Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/crmap.git
cd crmap
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings → API** y copia:
   - Project URL
   - anon public key

3. Copia el archivo de ejemplo:

```bash
cp .env.example .env.development
```

4. Edita `.env.development` con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Crear tablas en Supabase

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Copia y ejecuta el contenido de `database/schema.sql`

### 5. Crear usuario administrador

1. Ve a **Authentication → Users** en Supabase
2. Click en "Add user"
3. Ingresa email y contraseña
4. Ve a **Table Editor → usuarios**
5. Edita el usuario creado:
   - Cambia `rol` a `Administrador`
   - Actualiza `permisos` con acceso total:

```json
{
  "usuarios": {"ver": true, "crear": true, "editar": true, "eliminar": true},
  "clientes": {"ver": true, "crear": true, "editar": true, "eliminar": true},
  "presupuestador": {"ver": true, "crear": true, "editar": true, "eliminar": true},
  "pipeline": {"ver": true, "crear": true, "editar": true, "eliminar": true},
  "pagos": {"ver": true, "crear": true, "editar": true, "eliminar": true}
}
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 📁 Estructura del Proyecto

```
crmap/
├── src/
│   ├── components/
│   │   ├── layout/       # MainLayout, Sidebar, Header
│   │   └── ui/           # Button, Input, Modal, Icon
│   ├── context/
│   │   ├── AuthContext   # Autenticación Supabase
│   │   └── AppContext    # Estado global
│   ├── modules/
│   │   ├── auth/         # Login, Dashboard
│   │   ├── usuarios/     # Gestión de usuarios
│   │   ├── clientes/     # Gestión de clientes
│   │   ├── presupuestador/ # Presupuestos y códigos
│   │   ├── pipeline/     # Pipeline de tratos
│   │   └── pagos/        # Control de pagos
│   ├── services/
│   │   └── supabase.js   # Cliente Supabase
│   └── utils/
├── database/
│   └── schema.sql        # Script SQL para Supabase
├── .env.example
├── .env.development
└── .env.production
```

## 🔧 Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npm run preview   # Preview build
```

## 🔐 Ambientes

- **Development**: `.env.development`
- **Production**: `.env.production`

## 📦 Tecnologías

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [React Router 6](https://reactrouter.com/)

## 📄 Licencia

MIT
