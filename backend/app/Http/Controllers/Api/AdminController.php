<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTeacherRequest;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\UserResource;
use App\Models\Course;
use App\Models\CourseTeacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function courses(): JsonResponse
    {
        return response()->json(['courses' => CourseResource::collection(Course::with('teachers')->get())]);
    }

    public function storeCourse(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create($request->validated());
        return response()->json(['course' => new CourseResource($course)], 201);
    }

    public function deleteCourse(Course $course): JsonResponse
    {
        $course->delete();
        return response()->json(['message' => 'Curso eliminado exitosamente.']);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();
        if ($request->has('role')) $query->where('role', $request->role);
        return response()->json(['users' => UserResource::collection($query->get())]);
    }

    public function assignTeacher(Course $course, AssignTeacherRequest $request): JsonResponse
    {
        $teacher = User::findOrFail($request->teacher_id);
        if ($teacher->role !== 'teacher') {
            return response()->json(['message' => 'El usuario no es profesor.', 'errors' => ['teacher_id' => ['Rol inválido.']]], 422);
        }

        CourseTeacher::where('course_id', $course->id)->delete();
        CourseTeacher::create(['course_id' => $course->id, 'user_id' => $teacher->id]);

        return response()->json(['message' => 'Profesor asignado.', 'course' => new CourseResource($course->load('teachers'))]);
    }
}
