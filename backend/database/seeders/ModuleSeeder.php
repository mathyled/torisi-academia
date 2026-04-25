<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = \App\Models\Course::all();
        
        foreach ($courses as $course) {
            $numModules = rand(3, 6);
            for ($i = 1; $i <= $numModules; $i++) {
                \App\Models\Module::create([
                    'course_id' => $course->id,
                    'name' => "Módulo {$i}: Fundamentos y Práctica",
                    'description' => "En este módulo se abordan los temas principales correspondientes a la unidad {$i} del curso.",
                    'order' => $i
                ]);
            }
        }
    }
}
