# Testing Guide - Admin System API

## Quick Start

### 1. Prerequisites
- Backend running on `http://localhost:3001`
- PostgreSQL running on `localhost:5432`
- Admin user seeded (email: `admin@gym-saga.local`, password: `Admin@123456`)

### 2. Get Access Token
```bash
RESPONSE=$(curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gym-saga.local",
    "password": "Admin@123456"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.data.access_token')
echo "Your token: $TOKEN"
```

### 3. Store Token for Future Requests
```bash
export ADMIN_TOKEN="your_token_here"
```

---

## API Endpoints Testing

### Authentication Routes

#### Login
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gym-saga.local",
    "password": "Admin@123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "admin@gym-saga.local",
      "name": "Admin",
      "role": "super_admin",
      "status": "active"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Get Current User
```bash
curl -X GET http://localhost:3001/api/admin/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Refresh Token
```bash
curl -X POST http://localhost:3001/api/admin/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token"
  }'
```

---

### Dashboard Routes

#### Get Dashboard Stats
```bash
curl -X GET http://localhost:3001/api/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Release Management Routes

#### List All Releases (Paginated)
```bash
curl -X GET "http://localhost:3001/api/admin/releases?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Get Single Release
```bash
curl -X GET http://localhost:3001/api/admin/releases/{release-id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Create Release
```bash
curl -X POST http://localhost:3001/api/admin/releases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "version": "1.2.0",
    "changelog": "Bug fixes and improvements",
    "platforms": {
      "android": {"available": true},
      "ios": {"available": true},
      "web": {"available": false}
    },
    "mandatory": false
  }'
```

#### Publish Release
```bash
curl -X POST http://localhost:3001/api/admin/releases/{release-id}/publish \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Delete Release
```bash
curl -X DELETE http://localhost:3001/api/admin/releases/{release-id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Build Management Routes

#### List All Builds
```bash
curl -X GET "http://localhost:3001/api/admin/builds?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Create Build
```bash
curl -X POST http://localhost:3001/api/admin/builds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "platform": "android",
    "environment": "prod",
    "version": "1.2.0",
    "release_id": "optional-uuid"
  }'
```

#### Cancel Build
```bash
curl -X POST http://localhost:3001/api/admin/builds/{build-id}/cancel \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Delete Build
```bash
curl -X DELETE http://localhost:3001/api/admin/builds/{build-id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Settings Routes

#### Get All Settings
```bash
curl -X GET http://localhost:3001/api/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Update Setting
```bash
curl -X PUT http://localhost:3001/api/admin/settings/branding_title \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "value": "My Gym App"
  }'
```

---

### Feature Flags Routes

#### List All Feature Flags
```bash
curl -X GET http://localhost:3001/api/admin/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Update Feature Flag (Gradual Rollout)
```bash
curl -X PUT http://localhost:3001/api/admin/feature-flags/new_ui \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "enabled": true,
    "percentage": 25,
    "platforms": ["android", "ios"],
    "version_min": "1.0.0",
    "version_max": "1.5.0"
  }'
```

---

### Remote Config Routes

#### Get Remote Config
```bash
curl -X GET http://localhost:3001/api/admin/remote-config \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Update Remote Config
```bash
curl -X PUT http://localhost:3001/api/admin/remote-config/api_endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "value": "https://api.gym-saga.local/v2",
    "version_min": "1.0.0"
  }'
```

---

### User Management Routes

#### List All Users
```bash
curl -X GET "http://localhost:3001/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Create User (Super Admin Only)
```bash
curl -X POST http://localhost:3001/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "newadmin@gym-saga.local",
    "name": "New Admin",
    "role": "admin",
    "password": "SecurePassword123456"
  }'
```

#### Update User
```bash
curl -X PUT http://localhost:3001/api/admin/users/{user-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Updated Name",
    "status": "active"
  }'
```

#### Delete User (Super Admin Only)
```bash
curl -X DELETE http://localhost:3001/api/admin/users/{user-id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Monitoring Routes

#### Get Audit Logs
```bash
curl -X GET "http://localhost:3001/api/admin/monitoring/audit-logs?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Get Error Logs (With Filtering)
```bash
# All errors
curl -X GET "http://localhost:3001/api/admin/monitoring/error-logs?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Frontend errors only
curl -X GET "http://localhost:3001/api/admin/monitoring/error-logs?page=1&limit=20&source=frontend" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Report Error (Public - No Auth Required)
```bash
curl -X POST http://localhost:3001/api/admin/monitoring/error-logs \
  -H "Content-Type: application/json" \
  -d '{
    "source": "frontend",
    "error_type": "NetworkError",
    "message": "Failed to fetch user data",
    "stack_trace": "Error: ...",
    "metadata": {
      "url": "http://localhost:3000",
      "userAgent": "Mozilla/5.0..."
    }
  }'
```

#### Health Check
```bash
curl http://localhost:3001/api/admin/monitoring/health
```

---

## Error Response Examples

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

---

## Useful Shell Functions

Save these in your `.bashrc` or `.zshrc`:

```bash
# Get admin token
get-admin-token() {
  curl -s -X POST http://localhost:3001/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@gym-saga.local",
      "password": "Admin@123456"
    }' | jq -r '.data.access_token'
}

# List releases
list-releases() {
  TOKEN=${1:-$(get-admin-token)}
  curl -s "http://localhost:3001/api/admin/releases?limit=10" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
}

# List builds
list-builds() {
  TOKEN=${1:-$(get-admin-token)}
  curl -s "http://localhost:3001/api/admin/builds?limit=10" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
}

# Get system health
system-health() {
  curl -s http://localhost:3001/api/admin/monitoring/health | jq '.'
}
```

Usage:
```bash
export ADMIN_TOKEN=$(get-admin-token)
list-releases
list-builds
system-health
```

---

## Postman Collection

Import this into Postman for easier testing:

```json
{
  "info": {
    "name": "Gym Saga Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3001/api/admin/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"admin@gym-saga.local\", \"password\": \"Admin@123456\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Releases",
      "item": [
        {
          "name": "List Releases",
          "request": {
            "method": "GET",
            "url": "http://localhost:3001/api/admin/releases",
            "header": [
              {"key": "Authorization", "value": "Bearer {{access_token}}"}
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### 401 Unauthorized on Every Request
- Verify token is not expired (15 minutes)
- Try refreshing token
- Check that token is being sent in Authorization header

### 403 Forbidden
- Verify user has required permission
- Check user role (some operations require super_admin)
- Review middleware chain in logs

### Connection Refused
- Verify backend is running on port 3001
- Check database connection: `psql -h localhost -U postgres -d gym_saga_admin`
- Check Redis is running: `redis-cli ping`

### Database Errors
- Run seed script: `pnpm tsx lib/db/seed.ts`
- Check database migrations are applied
- Verify DATABASE_URL in .env

---

## Next Steps

1. **Frontend Testing** - Test all UI flows
2. **Load Testing** - Stress test with `ab` or `wrk`
3. **Security Testing** - Verify auth/permission chains
4. **Integration Testing** - Test full workflows end-to-end
