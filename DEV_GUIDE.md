# Admin Dashboard - Guía de Desarrollo

## 🚀 Comenzar con Desarrollo Local

### 1. Instalar Dependencias

```bash
# En la raíz del proyecto
pnpm install

# Instalar específicamente admin-sdk en todos lados
pnpm install
```

### 2. Configurar Base de Datos

```bash
# Copiar archivo de ambiente
cp .env.example .env.local

# Levantar PostgreSQL con Docker
docker-compose up -d postgres redis

# Ejecutar migraciones
pnpm -F @workspace/db run push

# (Opcional) Seed con datos de prueba
pnpm tsx lib/db/seed.ts
```

### 3. Iniciar el Backend (API Server)

```bash
cd artifacts/api-server

# En desarrollo (watch mode)
pnpm dev

# O compilar y ejecutar
pnpm build && pnpm start
```

La API estará disponible en `http://localhost:3001`

### 4. Iniciar el Frontend (Admin Dashboard)

En otra terminal:

```bash
cd artifacts/admin-dashboard

# En desarrollo (next dev)
pnpm dev

# O compilar y ejecutar
pnpm build && pnpm start
```

El dashboard estará disponible en `http://localhost:3000` (o 3002 si localhost:3000 está en uso)

### 5. Login al Dashboard

Credenciales de prueba:
- Email: `admin@gym-saga.local`
- Password: `Admin@123456`

## 📁 Estructura de Directorios Explicada

### `/artifacts/api-server/src/routes/admin/`

Cada archivo representa un conjunto de rutas relacionadas:

- **auth.ts** - Rutas de autenticación (login, refresh, logout)
- **dashboard.ts** - Estadísticas y overview del dashboard
- **releases.ts** - Gestión de versiones y releases
- **builds.ts** (future) - Gestión de builds
- **settings.ts** (future) - Configuraciones globales
- **feature-flags.ts** (future) - Feature flags
- **users.ts** (future) - Gestión de usuarios admin
- **monitoring.ts** (future) - Logs y auditoría

### `/artifacts/admin-dashboard/src/app/(dashboard)/`

Cada carpeta es una página/sección del dashboard:

- **page.tsx** - Home del dashboard
- **versions/** - Gestión de releases
- **builds/** - Gestión de builds
- **configs/** - Configuración del sistema
- **users/** - Gestión de usuarios
- **monitoring/** - Logs y errores

### `/lib/admin-sdk/`

SDK compartido entre frontend y backend:

- **src/types/** - Definiciones Zod de tipos
- **src/client.ts** - Cliente API tipado
- **src/auth/** - Tipos de autenticación
- **src/constants.ts** - Constantes (roles, permisos, etc)

### `/lib/db/src/schema/`

Definiciones de tablas Drizzle:

- **auth.ts** - Users, sesiones, permisos
- **versions.ts** - Releases
- **builds.ts** - Builds
- **configs.ts** - Settings, feature flags, remote config
- **monitoring.ts** - Audit logs, error logs
- **notifications.ts** - Notifications

## 🔄 Flujo de Desarrollo

### Agregar una Nueva Ruta en el Backend

1. Crear archivo en `/artifacts/api-server/src/routes/admin/nueva-ruta.ts`

```typescript
import type { Router } from "express";
import { authenticateAdmin, requirePermission } from "../middlewares/auth.js";

export async function createNuevaRutaRoutes(router: Router) {
  router.get(
    "/api/admin/nueva-ruta",
    authenticateAdmin,
    requirePermission("view_nueva_ruta"),
    async (req, res) => {
      // Lógica aquí
      res.json({ success: true, data: [] });
    }
  );
}
```

2. Exportar en `/artifacts/api-server/src/routes/admin/index.ts`

```typescript
import { createNuevaRutaRoutes } from "./nueva-ruta.js";

export async function registerAdminRoutes(router: Router) {
  // ... existentes
  await createNuevaRutaRoutes(router);
}
```

### Agregar un Nuevo Tipo en admin-sdk

1. Agregar a `/lib/admin-sdk/src/types/index.ts`

```typescript
export const MiTipoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
});

export type MiTipo = z.infer<typeof MiTipoSchema>;
```

2. Exportar en cliente en `/lib/admin-sdk/src/client.ts`

```typescript
async getMiTipo() {
  return this.request<MiTipo>("/api/admin/mi-tipo");
}
```

### Crear Nueva Página en el Dashboard

1. Crear carpeta en `/artifacts/admin-dashboard/src/app/(dashboard)/mi-seccion/`

2. Crear `page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminApiClient } from "@workspace/admin-sdk";

export default function MiSeccionPage() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const client = new AdminApiClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      token: localStorage.getItem("access_token") || "",
    });
    
    client.getMiTipo().then(setData);
  }, []);

  return <div>{/* Tu contenido */}</div>;
}
```

## 🔐 Sistema de Autenticación

### JWT Tokens

Los tokens JWT contienen:

```json
{
  "sub": "user-id-uuid",
  "email": "admin@gym-saga.local",
  "role": "super_admin",
  "permissions": ["view_dashboard", "create_release", ...],
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Tiempos de expiración:**
- Access Token: 15 minutos
- Refresh Token: 7 días

### Refresh Token Flow

```
1. Login -> recibe access_token + refresh_token
2. Access token expira (15min)
3. Usar refresh_token en /api/admin/auth/refresh
4. Recibir nuevo access_token
5. Continuar usando API
```

### Roles y Permisos

Los permisos se validan con middleware:

```typescript
router.get(
  "/api/admin/algo",
  authenticateAdmin,                    // Verificar token
  requirePermission("view_algo"),       // Verificar permiso específico
  requireRole("admin", "super_admin"),  // Verificar rol
  handler
);
```

## 📊 Trabajando con la Base de Datos

### Queries Básicas

```typescript
import { db } from "@workspace/db";
import { releases, eq } from "@workspace/db/schema";

// SELECT * FROM releases
const allReleases = await db.select().from(releases);

// SELECT * FROM releases WHERE id = 'xxx'
const release = await db
  .select()
  .from(releases)
  .where(eq(releases.id, id));

// INSERT
const [newRelease] = await db
  .insert(releases)
  .values({ version, ... })
  .returning();

// UPDATE
const [updated] = await db
  .update(releases)
  .set({ status: "published" })
  .where(eq(releases.id, id))
  .returning();

// DELETE
await db.delete(releases).where(eq(releases.id, id));
```

### Migraciones

```bash
# Ver cambios pendientes
pnpm -F @workspace/db run push

# Si necesitas fuerzar (cuidado)
pnpm -F @workspace/db run push-force
```

## 🎨 Componentes y UI

Usamos **shadcn/ui** + **Tailwind**. Componentes disponibles:

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
```

### Crear Componente Personalizado

```typescript
// src/components/custom/mi-componente.tsx
"use client";

export function MiComponente({ title }: { title: string }) {
  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h2 className="text-white font-bold">{title}</h2>
    </div>
  );
}
```

## 🧪 Testing

Coming soon...

## 🐛 Debugging

### Backend

```bash
# Con inspect
node --inspect artifacts/api-server/dist/index.mjs

# Logs detallados
LOG_LEVEL=debug pnpm dev
```

### Frontend

Usar DevTools de Chrome normalmente. Next.js tiene source maps.

## 📦 Build para Producción

```bash
# Backend
pnpm -F @workspace/api-server build

# Frontend
pnpm -F @workspace/admin-dashboard build

# Full
pnpm build
```

## 🚀 Despliegue con Docker

```bash
# Build images
docker build -f artifacts/api-server/Dockerfile -t gym-saga-api .
docker build -f artifacts/admin-dashboard/Dockerfile -t gym-saga-admin .

# Run containers
docker run -p 3001:3001 gym-saga-api
docker run -p 3000:3000 gym-saga-admin
```

## 📚 Referencias Útiles

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Zod Validation](https://zod.dev)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Intro](https://jwt.io/introduction)

## ❓ Troubleshooting

### Puerto en uso

```bash
# Linux/Mac: encontrar proceso
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problemas con pnpm workspaces

```bash
# Limpiar node_modules
pnpm clean
pnpm install

# O
rm -rf node_modules
pnpm install
```

### DB connection error

```bash
# Verificar PostgreSQL
docker-compose ps

# Ver logs
docker-compose logs postgres
```

---

¡Happy coding! 🎉
