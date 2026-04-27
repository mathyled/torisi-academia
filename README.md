# 🚀 Torisi Academia - Sistema de Gestión Académica

Torisi Academia es una plataforma integral de alto rendimiento para la gestión de cursos, alumnos y calificaciones. Diseñada con una arquitectura desacoplada, utiliza un **Backend robusto en Laravel 11** y un **Frontend moderno en Next.js**, ofreciendo una experiencia de usuario fluida, segura y escalable.

---

## 🌐 Demo en Vivo

Puedes acceder a la versión de producción en los siguientes enlaces:

*   **Frontend (Vercel):** [https://torisi-academia-frontend.vercel.app/](https://torisi-academia-frontend.vercel.app/)
*   **Backend API (Render):** [https://torisi-academia-backend.onrender.com/api](https://torisi-academia-backend.onrender.com/api)

---

## 🔑 Credenciales de Acceso (Demo)

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@ita.edu.pe` | `password` |
| **Profesor** | `carlos.rios@ita.edu.pe` | `password` |
| **Estudiante** | `juan.rodriguez@ita.edu.pe` | `password` |

---

## 🛠️ Stack Tecnológico

### **Backend (Core API)**
*   **Framework:** Laravel 11 (PHP 8.3)
*   **Autenticación:** Laravel Sanctum (Token-based)
*   **Base de Datos:** TiDB Cloud (MySQL compatible) para Producción / SQLite para Desarrollo.
*   **Infraestructura:** Despliegue mediante **Docker** en Render.
*   **Seguridad:** Middleware de roles personalizado, validación de esquemas y recursos API transformados.

### **Frontend (UX/UI)**
*   **Framework:** Next.js (App Router)
*   **Estilos:** Tailwind CSS
*   **Componentes:** Radix UI / Shadcn UI
*   **Estado:** Context API para gestión global de autenticación y sincronización con servidor.
*   **Despliegue:** Vercel.

---

## ✨ Características Destacadas

*   **Dashboard Inteligente:** Interfaz que muta dinámicamente según el rol detectado (Admin, Profesor, Alumno).
*   **Gestión de Cursos Pro:** Creación, edición y borrado de cursos con asignación dinámica de profesores mediante selectores inteligentes (Combobox).
*   **Módulos Dinámicos:** Organización de contenido por módulos colapsables.
*   **Sistema de Calificaciones:** Los profesores pueden gestionar notas de alumnos matriculados con validación en tiempo real.
*   **Validación de Sesión Profesional:** El frontend valida el token contra el servidor en cada carga para garantizar la integridad de la sesión.

---

## 📂 Instalación Local

Si deseas ejecutar el proyecto localmente:

1.  **Clonar el repositorio.**
2.  **Instalación automática:**
    ```bash
    ./setup.sh
    ```
    *Este script configura automáticamente el entorno (env, keys, migrations, seeders).*

3.  **Ejecución manual:**
    *   **Backend:** `cd backend && php artisan serve`
    *   **Frontend:** `cd frontend && npm run dev`

---

## 📝 Notas de Implementación
*   **CORS:** Configurado para permitir la comunicación segura entre los dominios de Vercel y Render.
*   **Seeding:** Se incluyen seeders idempotentes que generan una base de datos rica en información para pruebas (cursos, notas, profesores y alumnos).

---
*Desarrollado con ❤️ para Torisi Academia.*
