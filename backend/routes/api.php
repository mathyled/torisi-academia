<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware(EnsureRole::class . ':student')->prefix('student')->group(function () {
        Route::get('/my-courses', [StudentController::class, 'myCourses']);
    });

    Route::middleware(EnsureRole::class . ':teacher')->prefix('teacher')->group(function () {
        Route::get('/courses', [TeacherController::class, 'courses']);
        Route::get('/courses/{course}/students', [TeacherController::class, 'courseStudents']);
        Route::put('/grades/{grade}', [TeacherController::class, 'updateGrade']);
        Route::post('/grades', [TeacherController::class, 'storeGrade']);
    });

    Route::middleware(EnsureRole::class . ':admin')->prefix('admin')->group(function () {
        Route::get('/courses', [AdminController::class, 'courses']);
        Route::post('/courses', [AdminController::class, 'storeCourse']);
        Route::delete('/courses/{course}', [AdminController::class, 'deleteCourse']);
        Route::post('/courses/{course}/assign-teacher', [AdminController::class, 'assignTeacher']);
        
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        
        Route::get('/enrollments', [AdminController::class, 'enrollments']);
        Route::post('/enrollments', [AdminController::class, 'storeEnrollment']);
        Route::delete('/enrollments/{enrollment}', [AdminController::class, 'deleteEnrollment']);
    });
});
