# Torisi Academia - Plataforma de Gestión Académica

Torisi Academia es una plataforma integral para la gestión de cursos, alumnos y calificaciones, desarrollada como una prueba técnica de alto rendimiento. La aplicación separa claramente las responsabilidades entre un backend robusto en Laravel y un frontend moderno y dinámico en Next.js.

## 🚀 Instalación Rápida

Para facilitar la evaluación, se ha incluido un script de automatización que configura el entorno completo (backend y frontend) con un solo comando.

1. Clona el repositorio.
2. Abre una terminal (Bash/Git Bash) en la raíz del proyecto.
3. Ejecuta el script de configuración:
   ```bash
   ./setup.sh
   ```

*El script se encargará de instalar dependencias (Composer/NPM), configurar archivos .env, generar llaves, preparar la base de datos SQLite y poblarla con datos de prueba.*

---

## 🛠️ Requisitos del Sistema

- **PHP:** 8.2 o superior
- **Node.js:** 18.0 o superior
- **Composer:** v2
- **Base de datos:** SQLite (por defecto para facilitar la evaluación rápida)

---

## 🔑 Credenciales de Prueba

Una vez instalada la aplicación, puedes acceder con los siguientes roles:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@ita.edu.pe` | `password` |
| **Profesor** | `carlos.rios@ita.edu.pe` | `password` |
| **Estudiante** | (Cualquier estudiante cargado) | `password` |

---

## ✨ Características Principales

### Backend (Laravel 11)
- **API RESTful:** Endpoints estandarizados con JSON.
- **Seguridad:** Autenticación mediante Laravel Sanctum (Tokens Bearer).
- **Control de Acceso:** Middleware personalizado para la gestión de roles (Admin, Profesor, Estudiante).
- **Arquitectura Limpia:** Uso de `API Resources` para la transformación de datos y `FormRequests` para validaciones robustas.
- **Seeding Inteligente:** Carga masiva de 40 cursos, módulos por curso, asignaciones aleatorias de profesores y notas simuladas para demostrar escalabilidad.

### Frontend (Next.js + Tailwind CSS)
- **Dashboard Dinámico:** Interfaz responsiva que se adapta según el rol del usuario.
- **UX Optimizada:** 
  - **Selectores Buscables (Combobox):** Búsqueda en tiempo real para asignar profesores o matricular alumnos.
  - **Acordeones Dinámicos:** Visualización colapsable de módulos para una navegación fluida.
  - **Sincronización Instantánea:** Actualización de tablas mediante `refetch` tras cada acción (asignar nota, borrar curso, etc.).
- **Diseño Premium:** Estética moderna utilizando componentes de Radix UI y animaciones sutiles.

---

## 📂 Estructura del Proyecto

```text
├── backend/            # Aplicación Laravel 11 (API)
├── frontend/           # Aplicación Next.js (SPA)
├── setup.sh            # Script de instalación automatizada
└── README.md           # Documentación
```

---

## 💻 Ejecución Manual

Si prefieres no usar el script automático:

**Backend:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---
*Desarrollado con ❤️ para Torisi Academia.*
 
