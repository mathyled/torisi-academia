FROM php:8.3-cli

# Instalar dependencias del sistema necesarias para las extensiones de PHP
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev

# Instalar todas las extensiones de PHP que Laravel 11 suele pedir
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd xml zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias de PHP ignorando restricciones de plataforma para evitar el Error 2
RUN composer install --no-interaction --no-dev --optimize-autoloader --ignore-platform-reqs

# Permisos para Laravel
RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Puerto por defecto
EXPOSE 8000

# Comando de inicio
CMD php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=$PORT

