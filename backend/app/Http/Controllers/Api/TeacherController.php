<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradeRequest;
use App\Http\Requests\UpdateGradeRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\EnrollmentStudentResource;
use App\Http\Resources\GradeResource;
use App\Models\Course;
use App\Models\CourseTeacher;
use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TeacherController extends Controller
{
    public function courses(): JsonResponse
    {
        $courses = Course::whereHas('courseTeachers', fn($q) => $q->where('user_id', Auth::id()))->get();
        return response()->json(['courses' => CourseResource::collection($courses)]);
    }

    public function courseStudents(Course $course): JsonResponse
    {
        if (!CourseTeacher::where('course_id', $course->id)->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'No estás asignado a este curso.'], 403);
        }

        $enrollments = Enrollment::with(['user', 'grade'])->where('course_id', $course->id)->get();
        return response()->json(['students' => EnrollmentStudentResource::collection($enrollments)]);
    }

    public function updateGrade(UpdateGradeRequest $request, Grade $grade): JsonResponse
    {
        if (!CourseTeacher::where('course_id', $grade->enrollment->course_id)->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'No estás autorizado para editar esta nota.'], 403);
        }

        $grade->update(['score' => $request->score]);
        return response()->json(['grade' => new GradeResource($grade->load(['enrollment.user', 'enrollment.course']))]);
    }

    public function storeGrade(StoreGradeRequest $request): JsonResponse
    {
        $enrollment = Enrollment::with('course')->findOrFail($request->enrollment_id);

        if (!CourseTeacher::where('course_id', $enrollment->course_id)->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'No estás asignado a este curso.'], 403);
        }

        $grade = Grade::updateOrCreate(
            ['enrollment_id' => $enrollment->id],
            ['score' => $request->score, 'period' => $enrollment->course->period]
        );

        return response()->json(['grade' => new GradeResource($grade->load(['enrollment.user', 'enrollment.course']))], 201);
    }
}
