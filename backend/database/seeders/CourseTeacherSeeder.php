<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseTeacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseTeacherSeeder extends Seeder
{
    public function run(): void
    {
        $carlos = User::where('email', 'carlos.rios@ita.edu.pe')->first();
        $patricia = User::where('email', 'patricia.vega@ita.edu.pe')->first();
        $jorge = User::where('email', 'jorge.llanos@ita.edu.pe')->first();

        $mot101 = Course::where('code', 'MOT-101')->first();
        $frenos301 = Course::where('code', 'FRENOS-301')->first();
        $elec201 = Course::where('code', 'ELEC-201')->first();
        $caja102 = Course::where('code', 'CAJA-102')->first();
        $diag401 = Course::where('code', 'DIAG-401')->first();

        CourseTeacher::create(['course_id' => $mot101->id, 'user_id' => $carlos->id]);
        CourseTeacher::create(['course_id' => $frenos301->id, 'user_id' => $carlos->id]);
        CourseTeacher::create(['course_id' => $elec201->id, 'user_id' => $patricia->id]);
        CourseTeacher::create(['course_id' => $caja102->id, 'user_id' => $jorge->id]);
        CourseTeacher::create(['course_id' => $diag401->id, 'user_id' => $jorge->id]);

        $teachers = User::where('role', 'teacher')->get();
        $courses = Course::whereNotIn('id', [$mot101->id, $frenos301->id, $elec201->id, $caja102->id, $diag401->id])->get();

        foreach ($courses as $course) {
            CourseTeacher::create([
                'course_id' => $course->id,
                'user_id' => $teachers->random()->id
            ]);
        }
    }
}
