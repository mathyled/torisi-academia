<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $luis = User::where('email', 'luis.mamani@ita.edu.pe')->first();
        $ana = User::where('email', 'ana.torres@ita.edu.pe')->first();
        $kevin = User::where('email', 'kevin.salas@ita.edu.pe')->first();
        $rosa = User::where('email', 'rosa.ccopa@ita.edu.pe')->first();

        $mot101 = Course::where('code', 'MOT-101')->first();
        $elec201 = Course::where('code', 'ELEC-201')->first();
        $caja102 = Course::where('code', 'CAJA-102')->first();
        $frenos301 = Course::where('code', 'FRENOS-301')->first();
        $diag401 = Course::where('code', 'DIAG-401')->first();

        $this->create($luis->id, $mot101->id, 16);
        $this->create($luis->id, $elec201->id, 9);
        $this->create($luis->id, $caja102->id, null);
        $this->create($ana->id, $mot101->id, null);
        $this->create($ana->id, $elec201->id, 14);
        $this->create($ana->id, $frenos301->id, 12);
        $this->create($kevin->id, $caja102->id, 8);
        $this->create($kevin->id, $diag401->id, 15);
        $this->create($rosa->id, $mot101->id, 18);
        $this->create($rosa->id, $frenos301->id, 11);
        $this->create($rosa->id, $diag401->id, null);
    }

    private function create(int $userId, int $courseId, ?float $score): void
    {
        $enrollment = Enrollment::create(['user_id' => $userId, 'course_id' => $courseId]);
        if ($score !== null) {
            Grade::create(['enrollment_id' => $enrollment->id, 'score' => $score, 'period' => '2025-I']);
        }
    }
}
