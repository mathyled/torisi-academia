<?php

namespace App\Policies;

use App\Models\Grade;
use App\Models\User;

class GradePolicy
{
    public function update(User $user, Grade $grade): bool
    {
        if ($user->role !== 'teacher') return false;
        return $user->taughtCourses()->where('course_id', $grade->enrollment->course_id)->exists();
    }
}
