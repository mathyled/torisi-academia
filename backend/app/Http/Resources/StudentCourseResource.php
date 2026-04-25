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
            'id' => $this->course->id,
            'code' => $this->course->code,
            'name' => $this->course->name,
            'description' => $this->course->description,
            'period' => $this->course->period,
            'teacher' => $teacher ? [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
            ] : null,
            'grade' => $grade ? [
                'id' => $grade->id,
                'score' => $grade->score,
                'period' => $grade->period,
            ] : null,
        ];
    }
}
