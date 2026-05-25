# Quick Start Guide - Gym Saga Admin System

## Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ and pnpm
- PostgreSQL 16 (or use Docker)

---

## Option 1: Docker (Recommended for Testing)

### Start All Services
```bash
cd Gym-Saga-Design

# Start database, cache, and storage
docker-compose up -d

# Start API + Admin Dashboard (full stack)
docker-compose --profile full up -d

# Wait for services to be healthy (~30 seconds)
docker-compose ps
```

Important variables for full stack:
- `PORT=3001` in API container (required)
- `BACKEND_API_URL=http://api-server:3001` in dashboard container
- `NEXT_PUBLIC_API_URL=http://localhost:3001` for browser requests

### Verify Services
```bash
# Check PostgreSQL
psql -h localhost -U postgres -c "SELECT 1"

# Check Redis
redis-cli ping

# Check MinIO
curl http://localhost:9000/health/live
```

---

## Option 2: Local Development

### 1. Setup Backend
```bash
cd artifacts/api-server

# Install dependencies
pnpm install

# Copy environment variables
cp ../../.env.example .env.local

# Update DATABASE_URL if needed (default: postgresql://postgres:postgres@localhost:5432/gym_saga_admin)

# Run migrations (if any)
pnpm run db:migrate

# Seed test data
pnpm tsx ../../lib/db/seed.ts

# Start backend server
pnpm dev
# Server will run on http://localhost:3001
```

### 2. Setup Frontend
```bash
cd artifacts/admin-dashboard

# Install dependencies
pnpm install

# Copy environment variables
cp ../../.env.example .env.local

# Add API URL
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' >> .env.local

# Start frontend server
pnpm dev
# App will run on http://localhost:3000
```

### 3. Access Admin Panel
- URL: **http://localhost:3000**
- Email: **admin@gym-saga.local**
- Password: **Admin@123456**

---

## Verify Installation

### Backend Health Check
```bash
curl http://localhost:3001/api/admin/monitoring/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Frontend Login Test
1. Navigate to http://localhost:3000
2. Enter credentials:
   - Email: `admin@gym-saga.local`
   - Password: `Admin@123456`
3. You should see the dashboard

---

## API Testing

### Quick Token Generation
```bash
RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gym-saga.local",
    "password": "Admin@123456"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.data.access_token')
echo "Token: $TOKEN"
```

### Test Releases Endpoint
```bash
curl -X GET http://localhost:3001/api/admin/releases \
  -H "Authorization: Bearer $TOKEN"
```

### Test Builds Endpoint
```bash
curl -X GET http://localhost:3001/api/admin/builds \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -h localhost -U postgres -c "SELECT version();"

# If using Docker
docker-compose ps postgres

# Reset database
pnpm tsx lib/db/seed.ts
```

### Frontend Not Connecting to Backend
- Verify backend is running: `curl http://localhost:3001`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors
- Verify `CORS_ORIGIN` in backend `.env.local`

---

## Useful Development Commands

### Backend
```bash
# Run in development (with hot reload)
pnpm dev

# Seed database
pnpm tsx ../lib/db/seed.ts

# Type check
pnpm typecheck

# Build
pnpm build

# Start production build
pnpm start
```

### Frontend
```bash
# Development with hot reload
pnpm dev

# Type check
pnpm typecheck

# Build
pnpm build

# Start production build
pnpm start

# Open browser automatically
pnpm dev --open
```

---

## Project Structure

```
Gym-Saga-Design/
├── artifacts/
│   ├── admin-dashboard/        # Next.js frontend app
│   │   ├── src/
│   │   │   ├── app/           # Next.js app directory
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks (useApi, useAuth)
│   │   │   └── store/         # Zustand stores
│   │   └── package.json
│   └── api-server/             # Express backend
│       ├── src/
│       │   ├── routes/        # API routes by domain
│       │   ├── middlewares/   # Auth & error handling
│       │   └── index.ts       # Server entry point
│       └── package.json
├── lib/
│   ├── admin-sdk/             # Shared types & client
│   │   ├── src/
│   │   │   ├── types/        # Zod schemas
│   │   │   └── client.ts      # AdminApiClient class
│   │   └── package.json
│   └── db/                    # Database & ORM
│       ├── src/schema/        # Drizzle schemas
│       ├── seed.ts            # Test data
│       └── package.json
├── .env.example               # Environment template
├── docker-compose.yml         # Docker services
├── ADMIN_README.md            # User guide
├── DEV_GUIDE.md              # Developer guide
├── TESTING_GUIDE.md          # API testing guide
├── UPDATE_LOG.md             # Latest changes
└── IMPLEMENTATION_CHECKLIST.md # Progress tracker
```

---

## Authentication Flow

```
1. User enters email/password → Frontend
2. Frontend POSTs to /api/auth/login (Next.js proxy)
3. Next.js proxy forwards to backend /api/admin/auth/login
4. Backend validates credentials, generates JWT tokens
5. Frontend stores access_token + refresh_token in localStorage
6. Frontend includes token in all API requests (Authorization header)
7. Backend middleware validates token on protected routes
8. If token expired, frontend uses refresh_token to get new access_token
```

---

## Permission System

The system has 5 roles with specific permissions:

- **super_admin**: Full access to everything
- **admin**: Most features except user/role management
- **editor**: Configuration and settings management only
- **support**: Read-only access (view logs, stats)
- **viewer**: Minimal read-only access (dashboard only)

---

## Next Steps

### Immediate (15 minutes)
1. ✅ Start backend and frontend
2. ✅ Login to dashboard
3. ✅ Test API endpoints using TESTING_GUIDE.md

### Short Term (1-2 hours)
1. Explore API endpoints
2. Review database schema (lib/db/src/schema/)
3. Try creating/updating test data

### Medium Term (Next session)
1. Implement frontend CRUD forms
2. Add advanced filtering/search
3. Write unit tests

### Long Term
1. Deploy to production
2. Set up monitoring (error tracking, analytics)
3. Implement build worker service
4. Add OTA update mechanism

---

## Support & Documentation

- 📖 [User Guide](./ADMIN_README.md) - System overview and features
- 👨‍💻 [Developer Guide](./DEV_GUIDE.md) - Development workflow and code patterns
- 🏗️ [Architecture Guide](./ADMIN_ARCHITECTURE.md) - System design and infrastructure
- 🧪 [Testing Guide](./TESTING_GUIDE.md) - Comprehensive API testing procedures
- ✅ [Checklist](./IMPLEMENTATION_CHECKLIST.md) - Feature completion status
- 📝 [Update Log](./UPDATE_LOG.md) - Recent changes and improvements

---

## Database Schema

The system manages these core entities:

- **Admin Users**: Authentication and authorization
- **Releases**: App versioning (semver format)
- **Builds**: Build artifacts and CI/CD tracking
- **Settings**: Global application configuration
- **Feature Flags**: Gradual rollout and A/B testing
- **Remote Config**: Version-specific configuration
- **Audit Logs**: Admin action tracking
- **Error Logs**: Application error collection
- **Notifications**: System announcements

---

## Environment Variables

Essential `.env.local` variables:

```env
# Backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gym_saga_admin
JWT_SECRET=your-secret-key-at-least-32-characters-long
ADMIN_API_URL=http://localhost:3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development

# Optional
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

---

## Performance Tips

1. **Database**: Add indexes to frequently queried columns
2. **API**: Implement pagination (default: 20 items per page)
3. **Frontend**: Use React Query for server state (already installed)
4. **Caching**: Redis available for session/cache layer
5. **Storage**: MinIO for build artifacts

---

## Security Notes

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT tokens signed with HS256
- ✅ Access tokens expire in 15 minutes
- ✅ Refresh tokens expire in 7 days
- ✅ Password hashes never returned in API responses
- ✅ All admin actions logged with IP/user agent
- 🔄 Rate limiting (configured but not enforced in dev)
- ⏳ HTTPS required in production
- ⏳ MFA support ready in schema

---

## Troubleshooting

### Still having issues?

1. Check logs:
   - Backend: `tail -f artifacts/api-server/logs.txt`
   - Frontend: Check browser console (F12)

2. Verify connectivity:
   - Backend alive: `curl http://localhost:3001`
   - Frontend alive: `curl http://localhost:3000`

3. Test auth:
   - See TESTING_GUIDE.md for detailed API examples

4. Check database:
   - `psql -h localhost -U postgres -d gym_saga_admin`
   - `\dt` to list tables

5. Review documentation:
   - DEV_GUIDE.md for development patterns
   - ADMIN_README.md for system overview

---

## Ready? Let's Go! 🚀

### PowerShell (Windows)
```powershell
# Step 1 - Start Docker services
Set-Location "Gym-Saga-Design"
docker-compose up -d

# Step 2 - Start backend (in a new terminal)
Set-Location "artifacts\api-server"
pnpm dev

# Step 3 - Start frontend (in another new terminal)
Set-Location "artifacts\admin-dashboard"
pnpm dev
```

### Bash/Linux/Mac
```bash
cd Gym-Saga-Design
docker-compose up -d
cd artifacts/api-server && pnpm dev &
cd ../../artifacts/admin-dashboard && pnpm dev
```

Navigate to http://localhost:3000 and login with:
- Email: `admin@gym-saga.local`
- Password: `Admin@123456`

Enjoy! 💪
