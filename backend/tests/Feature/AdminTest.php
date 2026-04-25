<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Course;
use App\Models\CourseTeacher;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_get_courses(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        Course::factory()->create(['code' => 'TEST-101', 'name' => 'Test Course']);

        $response = $this->withToken($token)->getJson('/api/admin/courses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'courses' => [
                    '*' => [
                        'id',
                        'code',
                        'name',
                        'period',
                    ],
                ],
            ]);
    }

    public function test_admin_can_create_course(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/courses', [
            'code' => 'NEW-101',
            'name' => 'New Course',
            'description' => 'Test description',
            'period' => '2025-I',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'course' => [
                    'id',
                    'code',
                    'name',
                ],
            ]);

        $this->assertDatabaseHas('courses', ['code' => 'NEW-101']);
    }

    public function test_admin_can_delete_course(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $course = Course::factory()->create();

        $response = $this->withToken($token)->deleteJson("/api/admin/courses/{$course->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    public function test_admin_can_get_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        User::factory()->create(['role' => 'student']);
        User::factory()->create(['role' => 'teacher']);

        $response = $this->withToken($token)->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'users' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'role',
                    ],
                ],
            ]);
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/users', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'role' => 'student',
            'dni' => '12345678',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'testuser@example.com']);
    }

    public function test_admin_can_get_enrollments(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $student = User::factory()->create(['role' => 'student']);
        $course = Course::factory()->create();
        Enrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response = $this->withToken($token)->getJson('/api/admin/enrollments');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'enrollments' => [
                    '*' => [
                        'id',
                        'user',
                        'course',
                    ],
                ],
            ]);
    }

    public function test_admin_can_assign_teacher_to_course(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $course = Course::factory()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/admin/courses/{$course->id}/assign-teacher", [
            'teacher_id' => $teacher->id,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('course_teacher', [
            'course_id' => $course->id,
            'user_id' => $teacher->id,
        ]);
    }
}
