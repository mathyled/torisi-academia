<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentCourseResource;
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
}
