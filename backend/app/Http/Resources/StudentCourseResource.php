<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentCourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $grade = $this->grade ?? null;
        $teacher = $this->course->teachers->first();

        return [
            'course_id' => $this->course->id,
            'code' => $this->course->code,
            'name' => $this->course->name,
            'description' => $this->course->description,
            'period' => $this->course->period,
            'teacher_name' => $teacher?->name ?? 'Sin asignar',
            'score' => $grade?->score,
            'grade_id' => $grade?->id,
        ];
    }
}
