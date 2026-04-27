<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $initialCourses = [
            ['code' => 'MOT-101', 'name' => 'Motores de Combustión Interna', 'description' => 'Estudio de motores de gasolina y diésel, sistemas de inyección, encendido y refrigeración.', 'period' => '2025-I'],
            ['code' => 'ELEC-201', 'name' => 'Electrónica Automotriz', 'description' => 'Sistemas eléctricos y electrónicos del vehículo, sensores, actuadores y controladores.', 'period' => '2025-I'],
            ['code' => 'CAJA-102', 'name' => 'Sistemas de Transmisión', 'description' => 'Cajas de cambio manuales y automáticas, embragues, diferenciales y ejes.', 'period' => '2025-I'],
            ['code' => 'FRENOS-301', 'name' => 'Frenos y Suspensión', 'description' => 'Sistemas de frenado hidráulico, ABS, suspensión neumática y electrónica.', 'period' => '2025-I'],
            ['code' => 'DIAG-401', 'name' => 'Diagnóstico por Computadora OBD', 'description' => 'Uso de escáneres, interpretación de códigos de falla, diagnóstico avanzado.', 'period' => '2025-I'],
        ];

        foreach ($initialCourses as $courseData) {
            Course::updateOrCreate(['code' => $courseData['code']], $courseData);
        }

        $prefixes = ['MEC', 'ELEC', 'SIS', 'TER', 'DIN', 'AUTO', 'HYB', 'EV', 'DIAG', 'TALL'];
        
        for ($i = 5; $i < 40; $i++) {
            $prefix = $prefixes[array_rand($prefixes)];
            $codeNumber = rand(100, 999);
            $code = "{$prefix}-{$codeNumber}";
            
            Course::updateOrCreate(
                ['code' => $code],
                [
                    'name' => "Curso Avanzado de {$prefix} {$codeNumber}",
                    'description' => "Descripción detallada para el curso de {$prefix} {$codeNumber}. Este curso cubre aspectos teóricos y prácticos avanzados.",
                    'period' => rand(0, 1) === 0 ? '2025-I' : '2025-II'
                ]
            );
        }
    }
}
