#!/bin/bash
echo "🔧 Iniciando configuración completa de Torisi Academia..."

# Configuración del Backend
echo "====================================="
echo "⚙️  Configurando el Backend..."
echo "====================================="
cd backend

echo "🔧 Instalando dependencias de PHP..."
composer install

echo "⚙️  Configurando entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
fi

echo "🗄️  Preparando base de datos..."
touch database/database.sqlite
php artisan migrate:fresh --seed

echo "🚀 Iniciando servidor Backend en segundo plano..."
php artisan serve &
BACKEND_PID=$!

# Configuración del Frontend
echo "====================================="
echo "⚙️  Configurando el Frontend..."
echo "====================================="
cd ../frontend

echo "🔧 Instalando dependencias de Node..."
npm install

echo "🚀 Iniciando servidor Frontend..."
npm run dev

# Al cerrar el frontend, matamos el backend
kill $BACKEND_PID
