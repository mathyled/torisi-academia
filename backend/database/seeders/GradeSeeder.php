<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    public function run(): void
    {
        $studentsList = User::where('role', 'student')->take(4)->get();
        $luis = $studentsList[0];
        $ana = $studentsList[1];
        $kevin = $studentsList[2];
        $rosa = $studentsList[3];

        $mot101 = Course::where('code', 'MOT-101')->first();
        $elec201 = Course::where('code', 'ELEC-201')->first();
        $caja102 = Course::where('code', 'CAJA-102')->first();
        $frenos301 = Course::where('code', 'FRENOS-301')->first();
        $diag401 = Course::where('code', 'DIAG-401')->first();

        $this->create($luis->id, $mot101->id, 16);
        $this->create($luis->id, $elec201->id, 9);
        $this->create($ana->id, $elec201->id, 14);
        $this->create($ana->id, $frenos301->id, 12);
        $this->create($kevin->id, $caja102->id, 8);
        $this->create($kevin->id, $diag401->id, 15);
        $this->create($rosa->id, $mot101->id, 18);
        $this->create($rosa->id, $frenos301->id, 11);

        $otherEnrollments = Enrollment::whereNotIn('user_id', [$luis->id, $ana->id, $kevin->id, $rosa->id])->get();

        foreach ($otherEnrollments as $index => $enrollment) {
            if ($index % 3 !== 0) { // ~66% get grades
                Grade::create([
                    'enrollment_id' => $enrollment->id,
                    'score' => rand(8, 20),
                    'period' => rand(0, 1) === 0 ? '2025-I' : '2025-II'
                ]);
            }
        }
    }

    private function create(int $userId, int $courseId, float $score): void
    {
        $enrollment = Enrollment::where('user_id', $userId)->where('course_id', $courseId)->first();
        if ($enrollment) {
            Grade::create([
                'enrollment_id' => $enrollment->id,
                'score' => $score,
                'period' => '2025-I'
            ]);
        }
    }
}
