# Torisi Academia - Script de Configuración para Windows (PowerShell)

Write-Host "🔧 Iniciando configuración completa de Torisi Academia..." -ForegroundColor Cyan

# Configuración del Backend
Write-Host "`n=====================================" -ForegroundColor Yellow
Write-Host "⚙️  Configurando el Backend..."
Write-Host "=====================================" -ForegroundColor Yellow

Set-Location "backend"

Write-Host "🔧 Instalando dependencias de PHP (Composer)..."
composer install

Write-Host "⚙️  Configurando archivo de entorno..."
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    php artisan key:generate
}

Write-Host "🗄️  Preparando base de datos SQLite..."
if (-not (Test-Path "database/database.sqlite")) {
    New-Item -Path "database/database.sqlite" -ItemType File
}

Write-Host "🚀 Ejecutando migraciones y seeders..."
php artisan migrate:fresh --seed

# Volver a la raíz para el frontend
Set-Location ".."

# Configuración del Frontend
Write-Host "`n=====================================" -ForegroundColor Yellow
Write-Host "⚙️  Configurando el Frontend..."
Write-Host "=====================================" -ForegroundColor Yellow

Set-Location "frontend"

Write-Host "🔧 Instalando dependencias de Node (NPM)..."
npm install

Write-Host "`n✅ ¡Configuración completada con éxito!" -ForegroundColor Green
Write-Host "🚀 Para iniciar el proyecto, ejecuta:" -ForegroundColor Cyan
Write-Host "   1. En una terminal: cd backend; php artisan serve"
Write-Host "   2. En otra terminal: cd frontend; npm run dev"
