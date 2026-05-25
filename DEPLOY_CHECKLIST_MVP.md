# Deploy Checklist MVP

This checklist is focused on practical MVP deployment for:
- API server on Railway
- Admin dashboard on Vercel
- Android APK (internal preview) with EAS

## 1) Mobile APK Readiness (Expo + EAS)

- [ ] Confirm [artifacts/profeandres/app.json](artifacts/profeandres/app.json) includes a valid Android package.
- [ ] Confirm [artifacts/profeandres/eas.json](artifacts/profeandres/eas.json) exists with a preview profile using APK.
- [ ] Set `EXPO_PUBLIC_API_URL` to the Railway API HTTPS URL before build.
- [ ] Run `pnpm -F @workspace/profeandres build:apk:preview`.

Required build env vars for EAS:
- `EXPO_PUBLIC_API_URL=https://<railway-api-domain>`

## 2) Railway API Readiness

Service root:
- [ ] Set service root to repository root and start command to `pnpm -F @workspace/api-server start`.

Required Railway environment variables:
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (or Railway provided port mapping)
- [ ] `DATABASE_URL=<managed-postgres-url>`
- [ ] `JWT_SECRET=<long-random-secret>`
- [ ] `JWT_EXPIRY=15m`
- [ ] `REFRESH_TOKEN_EXPIRY=7d`
- [ ] `CORS_ORIGIN=https://<vercel-domain>,http://localhost:3000`

Health:
- [ ] Verify `GET /api/healthz` returns `200` in Railway.

## 3) Vercel Dashboard Readiness

Project root:
- [ ] Set root directory to `artifacts/admin-dashboard`.

Required Vercel environment variables:
- [ ] `BACKEND_API_URL=https://<railway-api-domain>`
- [ ] `NEXT_PUBLIC_API_URL=https://<vercel-domain>`

Post-deploy checks:
- [ ] `POST /api/auth/login` works in deployed UI.
- [ ] `GET /api/admin/gym/dashboard` returns data with valid token.

## 4) End-to-End Smoke (Real Environment)

Admin dashboard:
- [ ] Login as coach A works.
- [ ] Coach A dashboard loads athletes/routines.
- [ ] Create athlete from dashboard works.

Ownership isolation:
- [ ] Coach A cannot read Coach B athlete by id (404 expected).
- [ ] Coach A cannot mutate Coach B routine/measurement (404 expected).

Mobile APK:
- [ ] Login in APK works with deployed backend.
- [ ] `Mi Plan` loads routines.
- [ ] Mark routine completion succeeds and syncs.
- [ ] `Perfil` and `Progreso` load real data.

API sanity:
- [ ] `GET /api/healthz` responds under 1s average.
- [ ] 401/403/404 behavior remains consistent.

## 5) Rollback Notes

- Keep previous Railway deploy active until new one passes smoke checks.
- Keep previous Vercel production alias until login + dashboard smoke passes.
- If APK has backend connectivity issues, rebuild preview with corrected `EXPO_PUBLIC_API_URL`.