# Sistema Administrativo - Arquitectura Profesional

## Visión General

Sistema SaaS Console completo para administración, versionado, empaquetado y despliegue de la aplicación Gym Saga.

## Estructura del Proyecto

```
artifacts/
├── api-server/                    # Backend Express existente + extensiones admin
│   └── src/
│       ├── routes/
│       │   ├── admin/             # ✨ Nuevas rutas administrativas
│       │   ├── versions/          # ✨ Versionado y releases
│       │   ├── builds/            # ✨ Build manager
│       │   ├── configs/           # ✨ Configuraciones dinámicas
│       │   ├── users/             # ✨ Admin de usuarios
│       │   └── monitoring/        # ✨ Logs y monitoreo
│       ├── middlewares/
│       │   ├── auth.ts            # ✨ JWT + roles/permisos
│       │   └── admin-only.ts      # ✨ Protección rutas admin
│       └── lib/
│           ├── releases.ts        # ✨ Lógica de releases
│           ├── builds.ts          # ✨ Lógica de builds
│           └── security.ts        # ✨ Utilidades seguridad
├── admin-dashboard/               # ✨ Frontend Next.js admin
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # Páginas login/recovery
│   │   │   ├── (dashboard)/       # Layout principal dashboard
│   │   │   │   ├── page.tsx       # Home dashboard
│   │   │   │   ├── versions/      # Versiones y releases
│   │   │   │   ├── builds/        # Build manager
│   │   │   │   ├── configs/       # Configuraciones
│   │   │   │   ├── users/         # Admin usuarios
│   │   │   │   ├── monitoring/    # Logs y errores
│   │   │   │   └── settings/      # Configuración sistema
│   │   ├── components/
│   │   │   ├── dashboard/         # Widgets y KPIs
│   │   │   ├── forms/             # Formularios reutilizables
│   │   │   ├── tables/            # Tablas avanzadas
│   │   │   ├── ui/                # shadcn/ui customizado
│   │   │   └── layout/            # Header, sidebar
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api-client.ts      # Cliente API tipado
│   │   │   └── auth.ts            # Lógica auth frontend
│   │   ├── store/                 # Zustand state management
│   │   └── types/
│   └── public/
├── build-worker/                  # ✨ Servicio para compilar builds
│   ├── src/
│   │   ├── builders/
│   │   │   ├── apk.ts
│   │   │   ├── aab.ts
│   │   │   ├── ios.ts
│   │   │   └── web.ts
│   │   └── queue.ts              # BullMQ job processing
│   └── Dockerfile
└── docker-compose.yml             # ✨ Stack completo

lib/
├── admin-sdk/                     # ✨ SDK compartido
│   ├── src/
│   │   ├── types/                 # Tipos administrativos
│   │   ├── api.ts                 # Cliente API tipado
│   │   ├── auth.ts                # Tipos auth
│   │   └── constants.ts
├── db/
│   ├── src/
│   │   └── schema/
│   │       ├── auth.ts            # ✨ Users, roles, permisos
│   │       ├── versions.ts        # ✨ Releases y versiones
│   │       ├── builds.ts          # ✨ Build history
│   │       ├── configs.ts         # ✨ Config dinámica
│   │       ├── monitoring.ts      # ✨ Logs y auditoría
│   │       └── features.ts        # ✨ Feature flags
```

## Tabla de Tecnologías

| Layer | Tecnología | Justificación |
|-------|-----------|--------------|
| Backend API | Express 5 + Node.js | Existente, sólido, escalable |
| Base de Datos | PostgreSQL + Drizzle ORM | Existente, type-safe |
| Frontend Admin | Next.js 15 + React 19 | Moderno, SSR, file-based routing |
| UI Components | shadcn/ui + Tailwind CSS | Premium, accesible, customizable |
| Estado Frontend | Zustand + TanStack Query | Ligero, performante |
| Authentication | JWT + Refresh Tokens | Estándar industria |
| Build Manager | Node.js + BullMQ | Job queue, escalable |
| Containerización | Docker + Docker Compose | Producción ready |
| Documentación API | OpenAPI 3.0 / Swagger | Auto-generada desde tipos |

## Módulos Administrativos

### 1. Dashboard Principal
- KPIs en tiempo real
- Usuarios activos / estadísticas
- Estado de releases actual
- Errores recientes
- Uptime del sistema
- Actividad reciente
- Tema oscuro premium tipo Vercel/Stripe

### 2. Sistema de Versionado
- Crear/publicar versiones
- Changelog automático
- Marcar updates obligatorias
- Rollback disponible
- Historial completo
- Comparación de versiones

### 3. Build Manager
- Generar APK, AAB, iOS, Web
- Histórico de builds
- Logs completos
- Estado en tiempo real
- Multi-environment (dev/staging/prod)

### 4. OTA Updates
- Remote config dinámico
- Feature flags sin recompilar
- Actualización de assets
- Versionado de APIs

### 5. Panel de Configuraciones
- Variables globales editables
- Endpoints, branding, colores
- Logos, banners, mantenimiento
- Todos los toggles del sistema

### 6. Admin de Usuarios
- RBAC completo (5 roles)
- Login seguro, MFA opcional
- Auditoría completa
- Sesiones y recuperación

### 7. Monitoreo y Logs
- Errores frontend/backend/mobile
- Performance tracking
- Uptime monitoring
- Filtros y exportación

### 8. Notificaciones
- Push notifications
- Anuncios internos
- Mensajes globales
- Campaña futura-ready

## Seguridad

✅ **Implementar:**
- Helmet.js (headers de seguridad)
- CORS configurado
- Rate limiting (Express-rate-limit)
- Sanitización (DOMPurify frontend, validator backend)
- JWT + refresh tokens
- Bcrypt para passwords
- HTTPS/TLS en producción
- Auditoría de acciones
- Validación de entrada (Zod)

## Base de Datos - Esquema Admin

```typescript
// Auth & Users
users
├── id
├── email (unique)
├── password_hash
├── name
├── role_id (FK)
├── status (active/inactive/blocked)
├── mfa_enabled
├── last_login
└── created_at

roles
├── id
├── name (super_admin, admin, support, editor, viewer)
└── permissions (JSON array)

permissions
├── id
├── key
├── description
└── category

// Versioning
releases
├── id
├── version (semver)
├── changelog
├── platforms (json: {android, ios, web})
├── status (draft, published, deprecated, blocked)
├── mandatory
├── release_notes
├── rollback_available
├── released_at
└── created_by (FK users)

// Build Management
builds
├── id
├── release_id (FK)
├── platform (android/ios/web)
├── environment (dev/staging/prod)
├── status (pending/building/success/failed)
├── file_size
├── hash/checksum
├── build_logs
└── created_at

// Configuration
settings
├── id
├── key
├── value (JSON)
├── type (string/number/boolean/json)
├── description
├── updated_at
└── updated_by (FK users)

feature_flags
├── id
├── key
├── enabled
├── percentage (para rollout gradual)
├── platforms (json)
├── version_min/max
└── updated_at

remote_configs
├── id
├── key
├── value
├── version_min/max
└── updated_at

// Monitoring
audit_logs
├── id
├── user_id (FK)
├── action
├── resource_type
├── resource_id
├── changes (JSON)
├── ip_address
└── created_at

error_logs
├── id
├── source (frontend/backend/mobile)
├── error_type
├── message
├── stack_trace
├── user_id (optional FK)
├── metadata (JSON)
└── created_at

// Notifications
notifications
├── id
├── title
├── content
├── type (announcement/system/alert)
├── target_users (json array of roles)
├── status (draft/sent/scheduled)
├── sent_at
└── created_by (FK users)

// Sessions
sessions
├── id
├── user_id (FK)
├── token_hash
├── expires_at
├── ip_address
├── user_agent
└── created_at
```

## Variables de Entorno

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/gym_saga_admin

# Auth
JWT_SECRET=<super_secret_key>
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Admin API
ADMIN_API_URL=http://localhost:3001
ADMIN_API_SECRET=<secret_for_inter_service_auth>

# Frontend Admin
NEXT_PUBLIC_API_URL=http://localhost:3001

# Build Worker
REDIS_URL=redis://localhost:6379
BUILD_WORKER_CONCURRENCY=2

# Storage (S3 compatible)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=gym-saga-builds

# Seguridad
CORS_ORIGIN=http://localhost:3000,https://admin.gym-saga.com
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

## Flujo de Desarrollo

1. **Phase 1**: Auth + Dashboard shell + Schema DB
2. **Phase 2**: CRUD de versiones + releases
3. **Phase 3**: Build manager foundation
4. **Phase 4**: OTA updates + feature flags
5. **Phase 5**: Admin usuarios + RBAC
6. **Phase 6**: Monitoreo avanzado
7. **Phase 7**: Notificaciones
8. **Phase 8**: Polish + documentación

## Integración Mínima con App Existente

- NO modificar código existente de Expo
- Agregar SDK cliente para recibir updates OTA
- Agregar logging a backend existente
- Integración de feature flags en app

## Despliegue

- Docker Compose local (dev)
- CI/CD con GitHub Actions (future)
- Cloud deployment: DigitalOcean / AWS (future)
- Monitoring: New Relic / Datadog (future)

## Próximos Pasos Inmediatos

1. ✅ Crear estructura de carpetas
2. → Configurar Next.js admin dashboard
3. → Extender schema DB
4. → Implementar auth backend
5. → Crear rutas administrativas
6. → UI dashboard principal
