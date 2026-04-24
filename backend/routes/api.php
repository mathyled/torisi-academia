<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/my-courses', [StudentController::class, 'myCourses']);
    });

    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('/courses', [TeacherController::class, 'courses']);
        Route::get('/courses/{course}/students', [TeacherController::class, 'courseStudents']);
        Route::put('/grades/{grade}', [TeacherController::class, 'updateGrade']);
        Route::post('/grades', [TeacherController::class, 'storeGrade']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/courses', [AdminController::class, 'courses']);
        Route::post('/courses', [AdminController::class, 'storeCourse']);
        Route::delete('/courses/{course}', [AdminController::class, 'deleteCourse']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/courses/{course}/assign-teacher', [AdminController::class, 'assignTeacher']);
    });
});
