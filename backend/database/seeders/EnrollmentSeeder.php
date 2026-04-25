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

        $this->create($luis->id, $mot101->id);
        $this->create($luis->id, $elec201->id);
        $this->create($luis->id, $caja102->id);
        $this->create($ana->id, $mot101->id);
        $this->create($ana->id, $elec201->id);
        $this->create($ana->id, $frenos301->id);
        $this->create($kevin->id, $caja102->id);
        $this->create($kevin->id, $diag401->id);
        $this->create($rosa->id, $mot101->id);
        $this->create($rosa->id, $frenos301->id);
        $this->create($rosa->id, $diag401->id);

        $students = User::where('role', 'student')->whereNotIn('id', [$luis->id, $ana->id, $kevin->id, $rosa->id])->get();
        $courses = Course::all();

        foreach ($students as $student) {
            $numCourses = rand(2, 5);
            $selectedCourses = $courses->random($numCourses);
            foreach ($selectedCourses as $course) {
                $this->create($student->id, $course->id);
            }
        }
    }

    private function create(int $userId, int $courseId): void
    {
        Enrollment::create(['user_id' => $userId, 'course_id' => $courseId]);
    }
}
