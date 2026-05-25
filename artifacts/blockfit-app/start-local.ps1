# ============================================================
# start-local.ps1
# Script para levantar el servidor de desarrollo Expo en Windows
# ============================================================

# Variables locales (reemplaza las de Replit)
$env:EXPO_PUBLIC_DOMAIN = "localhost"
$env:EXPO_PUBLIC_REPL_ID = "local-dev"
$env:NODE_ENV = "development"

Write-Host "🚀 Iniciando servidor Expo en modo local (Windows)..." -ForegroundColor Cyan
Write-Host "   Accede a: http://localhost:8081" -ForegroundColor Green
Write-Host ""

# Ejecuta Expo en modo web local, sin flags de Replit
pnpm exec expo start --web --port 8081
