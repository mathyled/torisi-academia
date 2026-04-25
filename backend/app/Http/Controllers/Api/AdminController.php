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
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,teacher',
            'dni' => 'nullable|string|size:8|unique:users',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'dni' => $validated['dni'] ?? null,
        ]);

        return response()->json(['user' => new UserResource($user)], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'No se puede editar el administrador.'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:student,teacher',
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json(['user' => new UserResource($user)]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'No se puede eliminar el administrador.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado exitosamente.']);
    }

    public function enrollments(): JsonResponse
    {
        $enrollments = Enrollment::with(['user', 'course'])->get();
        return response()->json(['enrollments' => $enrollments]);
    }

    public function storeEnrollment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Solo los estudiantes pueden ser matriculados.'], 422);
        }

        $existing = Enrollment::where('user_id', $validated['user_id'])
            ->where('course_id', $validated['course_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'El estudiante ya está matriculado en este curso.'], 422);
        }

        $enrollment = Enrollment::create($validated);
        $enrollment->load(['user', 'course']);

        return response()->json(['enrollment' => $enrollment], 201);
    }

    public function deleteEnrollment(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();
        return response()->json(['message' => 'Matrícula eliminada exitosamente.']);
    }

    public function assignTeacher(Course $course, AssignTeacherRequest $request): JsonResponse
    {
        $teacher = User::findOrFail($request->teacher_id);
        if ($teacher->role !== 'teacher') {
            return response()->json(['message' => 'El usuario no es profesor.', 'errors' => ['teacher_id' => ['Rol inválido.']]], 422);
        }

        CourseTeacher::where('course_id', $course->id)->delete();
        CourseTeacher::firstOrCreate([
            'course_id' => $course->id,
            'user_id' => $teacher->id,
        ]);

        return response()->json(['message' => 'Profesor asignado.', 'course' => new CourseResource($course->load('teachers'))]);
    }
}
