$env:Path = "C:\Users\$env:USERNAME\.config\herd\bin;C:\Users\$env:USERNAME\.config\herd\bin\php84;$env:Path"

Write-Host "Instalando Laravel Sanctum..."
composer require laravel/sanctum --no-interaction

Write-Host "Ejecutando migraciones..."
php artisan migrate:fresh --seed --force

Write-Host "Servidor listo. Iniciando..."
php artisan serve
