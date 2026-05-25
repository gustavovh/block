# Gym Saga - Admin Dashboard & Control Panel System

## 🎯 Visión General

Sistema profesional de administración para Gym Saga que incluye:

- 📊 **Dashboard Principal** - KPIs y estadísticas en tiempo real
- 🚀 **Sistema de Versionado** - Gestión de releases y actualizaciones
- 🔨 **Build Manager** - Generación y gestión de builds
- ⚙️ **Configuración Dinámica** - Settings, feature flags, remote config
- 👥 **Admin de Usuarios** - RBAC completo con 5 roles
- 📈 **Monitoreo** - Logs, errores y auditoría
- 🔔 **Notificaciones** - Sistema preparado para campañas futuras

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard (Next.js)               │
│                    Frontend - React 19                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ (HTTP REST API)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Server (Express.js)                    │
│              Backend Routes Administrativos                 │
│                    Node.js 20 ESM                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    PostgreSQL      Redis          MinIO
    (Database)   (Cache/Queue)   (Storage)
```

## 📋 Stack Tecnológico

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching
- **Zustand** - State management

### Backend
- **Express.js 5** - API framework
- **Node.js 20** - Runtime
- **Drizzle ORM** - Database ORM
- **PostgreSQL 16** - Database
- **Redis** - Caching & Queue
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **MinIO** - S3-compatible storage
- **ESM Modules** - Modern JavaScript

## 🚀 Inicio Rápido

### Requisitos
- Docker & Docker Compose
- Node.js 20+ (para desarrollo local)
- pnpm 9+

### Instalación

1. **Clonar repositorio**
```bash
cd Gym-Saga-Design
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus valores:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gym_saga"
JWT_SECRET="your_very_secret_key_at_least_32_characters"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

3. **Levantar servicios con Docker Compose**
```bash
# Desarrollo (solo base de datos)
docker-compose up -d

# Full stack (con API y Dashboard)
docker-compose --profile full up -d
```

4. **Instalar dependencias (desarrollo local)**
```bash
pnpm install
```

5. **Ejecutar migraciones DB**
```bash
pnpm -F @workspace/db run push
```

### Acceso

- **Admin Dashboard**: http://localhost:3002
- **API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (user: minioadmin / pass: minioadmin)
- **PostgreSQL**: localhost:5432

## 📚 Documentación API

La API admin está documentada con OpenAPI/Swagger. Endpoints principales:

### Autenticación
```bash
POST   /api/admin/auth/login
POST   /api/admin/auth/refresh
GET    /api/admin/auth/me
POST   /api/admin/auth/logout
```

### Dashboard
```bash
GET    /api/admin/dashboard/stats
```

### Releases
```bash
GET    /api/admin/releases           # Listar todas
POST   /api/admin/releases           # Crear nueva
GET    /api/admin/releases/:id       # Obtener detalles
POST   /api/admin/releases/:id/publish  # Publicar
DELETE /api/admin/releases/:id       # Eliminar
```

### Builds (Coming Soon)
```bash
GET    /api/admin/builds
POST   /api/admin/builds
GET    /api/admin/builds/:id
```

### Configuración (Coming Soon)
```bash
GET    /api/admin/settings
PUT    /api/admin/settings/:key
GET    /api/admin/feature-flags
PUT    /api/admin/feature-flags/:key
```

## 🔐 Sistema de Roles y Permisos

### Roles Disponibles

| Rol | Descripción | Casos de Uso |
|-----|-------------|-------------|
| `super_admin` | Acceso total | Propietarios |
| `admin` | Casi todo excepto gestión de roles | Administradores principales |
| `support` | Solo lectura de datos | Team de soporte |
| `editor` | Editar configs y flags | Product managers |
| `viewer` | Solo visualizar | Stakeholders |

### Permisos

Cada permiso está estructurado por categorías:
- Dashboard: `view_dashboard`
- Releases: `view_releases`, `create_release`, `publish_release`, etc.
- Builds: `view_builds`, `create_build`, `cancel_build`
- Settings: `view_settings`, `edit_settings`
- Feature Flags: `view_feature_flags`, `edit_feature_flags`
- Users: `view_users`, `create_user`, `manage_roles`
- Monitoring: `view_logs`, `view_error_logs`, `export_logs`
- System: `manage_system`, `view_analytics`

## 📦 Estructura del Proyecto

```
artifacts/
├── api-server/                 # Backend Express
│   ├── src/
│   │   ├── routes/admin/       # Rutas administrativas
│   │   ├── middlewares/        # Auth, validación, etc
│   │   ├── services/           # Lógica de negocio
│   │   └── utils/              # Utilidades
│   ├── Dockerfile
│   └── package.json
├── admin-dashboard/            # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Páginas de login
│   │   │   ├── (dashboard)/    # Dashboard y secciones
│   │   │   └── layout.tsx
│   │   ├── components/         # Componentes reutilizables
│   │   ├── lib/                # Utilidades
│   │   ├── types/              # Tipos TypeScript
│   │   └── store/              # Estado global
│   ├── Dockerfile
│   └── package.json
└── build-worker/               # (Future) Servicio de builds

lib/
├── db/                         # Drizzle ORM & Schema
│   ├── src/schema/
│   │   ├── auth.ts            # Users, roles, sesiones
│   │   ├── versions.ts        # Releases
│   │   ├── builds.ts          # Build history
│   │   ├── configs.ts         # Settings, flags, remote config
│   │   ├── monitoring.ts      # Audit & error logs
│   │   └── notifications.ts   # Notifications
│   └── package.json
├── admin-sdk/                  # SDK compartido
│   ├── src/
│   │   ├── types/             # Tipos Zod
│   │   ├── client.ts          # Cliente API tipado
│   │   ├── auth/              # Tipos de auth
│   │   └── constants.ts       # Constantes
│   └── package.json
└── api-client-react/           # (Existing)
```

## 🔑 Credenciales por Defecto

Para desarrollo local:

```
Email: admin@gym-saga.local
Password: Admin@123456
Role: super_admin
```

**⚠️ Importante**: Cambiar credenciales en producción

## 📝 Scripts Disponibles

```bash
# Monorepo
pnpm install               # Instalar dependencies
pnpm build                # Build todo
pnpm typecheck            # TypeScript check

# API Server
pnpm -F @workspace/api-server dev
pnpm -F @workspace/api-server build
pnpm -F @workspace/api-server start

# Admin Dashboard  
pnpm -F @workspace/admin-dashboard dev
pnpm -F @workspace/admin-dashboard build
pnpm -F @workspace/admin-dashboard start

# Database
pnpm -F @workspace/db run push        # Migrations
pnpm -F @workspace/db run push-force  # Force update

# Admin SDK
pnpm -F @workspace/admin-sdk typecheck
```

## 🗄️ Base de Datos

### Tablas Principales

#### Admin
- `admin_users` - Usuarios del panel admin
- `admin_sessions` - Sesiones activas
- `admin_permissions` - Matriz de permisos

#### Versioning
- `releases` - Historial de releases

#### Builds
- `builds` - Historial de builds

#### Configuración
- `settings` - Configuraciones globales
- `feature_flags` - Feature flags
- `remote_configs` - Configuración remota

#### Monitoreo
- `audit_logs` - Log de auditoría
- `error_logs` - Errores del sistema

#### Notificaciones
- `notifications` - Sistema de notificaciones

## 🚨 Seguridad

Implementado:
- ✅ JWT con refresh tokens
- ✅ CORS configurable
- ✅ Rate limiting
- ✅ HTTPS/TLS ready
- ✅ Bcrypt para passwords
- ✅ Helmet.js headers
- ✅ Validación Zod
- ✅ Sanitización de entrada

## 🧪 Testing

Coming soon...

## 🚢 Despliegue

### Docker
```bash
docker-compose --profile full up -d
```

### Kubernetes (Future)
- Manifests listos para generarse

### Cloud (Future)
- AWS ECS ready
- DigitalOcean compatible
- Heroku compatible

## 🔄 CI/CD (Future)

Preparado para:
- GitHub Actions
- GitLab CI
- CircleCI

## 📊 Monitoreo (Future)

Integración preparada para:
- Sentry
- DataDog
- New Relic
- LogRocket

## 🤝 Contribución

Este es un proyecto profesional mantenido internamente. Para cambios:

1. Crear rama feature
2. Commit con mensajes claros
3. Pull request con descripción
4. Code review y merge

## 📄 Licencia

MIT

## 📞 Soporte

Para soporte técnico: support@gym-saga.local

---

## 🗺️ Roadmap

### Phase 1 ✅ (Actual)
- [x] Arquitectura base
- [x] Auth JWT
- [x] Dashboard shell
- [x] Release management UI
- [x] DB schema completo

### Phase 2 (Próximas 2 semanas)
- [ ] Build manager funcional
- [ ] Feature flags completo
- [ ] Remote config
- [ ] Admin usuarios RBAC

### Phase 3
- [ ] Monitoreo avanzado
- [ ] Sistema de notificaciones
- [ ] OTA updates
- [ ] SDK mobile

### Phase 4
- [ ] CI/CD pipeline
- [ ] Analytics
- [ ] Multi-tenant support
- [ ] Webhooks

---

## 📚 Recursos Adicionales

- [Documentación Técnica](./ADMIN_ARCHITECTURE.md)
- [API Swagger](http://localhost:3001/api-docs) (cuando esté deployed)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle Docs](https://orm.drizzle.team/docs/overview)

---

**Construido con ❤️ para Gym Saga**
