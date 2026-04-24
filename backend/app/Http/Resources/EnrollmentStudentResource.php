<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentStudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $grade = $this->grade;

        return [
            'enrollment_id' => $this->id,
            'grade_id' => $grade?->id,
            'student_name' => $this->user->name,
            'student_dni' => $this->user->dni,
            'score' => $grade?->score,
        ];
    }
}
