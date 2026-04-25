<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EnrollmentStudentResource;
use App\Http\Resources\ModuleResource;
use App\Http\Resources\StudentCourseResource;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function myCourses(): JsonResponse
    {
        $enrollments = Enrollment::with(['course.teachers', 'grade'])
            ->where('user_id', Auth::id())
            ->get();

        return response()->json([
            'courses' => StudentCourseResource::collection($enrollments),
        ]);
    }

    public function courseClassmates(Course $course): JsonResponse
    {
        // Verify the student is enrolled in this course
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'No estás matriculado en este curso.'], 403);
        }

        // Get all other students enrolled in the same course
        $classmates = Enrollment::with(['user', 'grade'])
            ->where('course_id', $course->id)
            ->where('user_id', '!=', Auth::id())
            ->get();

        return response()->json([
            'classmates' => EnrollmentStudentResource::collection($classmates),
        ]);
    }

    public function courseModules(Course $course): JsonResponse
    {
        // Verify the student is enrolled in this course
        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'No estás matriculado en este curso.'], 403);
        }

        $modules = $course->modules;

        return response()->json([
            'modules' => ModuleResource::collection($modules),
        ]);
    }
}
