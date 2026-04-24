<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'period',
    ];

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'course_teacher')
            ->withTimestamps();
    }

    public function courseTeachers()
    {
        return $this->hasMany(CourseTeacher::class);
    }

    public function currentTeacher()
    {
        return $this->hasOne(CourseTeacher::class)->latest();
    }
}
