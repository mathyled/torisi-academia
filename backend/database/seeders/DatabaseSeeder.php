<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Usuarios con roles
        $this->call(UserSeeder::class);
        
        // 2. Cursos automotrices
        $this->call(CourseSeeder::class);
        
        // 3. Asignación de profesores a cursos
        $this->call(CourseTeacherSeeder::class);
        
        // 4. Matrículas de alumnos
        $this->call(EnrollmentSeeder::class);
        
        // 5. Notas iniciales
        $this->call(GradeSeeder::class);

        // 6. Módulos
        $this->call(ModuleSeeder::class);
    }
}
