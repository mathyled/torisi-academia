<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'enrollment_id' => $this->enrollment_id,
            'score' => $this->score,
            'period' => $this->period,
            'student' => $this->whenLoaded('enrollment.student', function () {
                return [
                    'id' => $this->enrollment->student->id,
                    'name' => $this->enrollment->student->name,
                    'dni' => $this->enrollment->student->dni,
                ];
            }),
            'course' => $this->whenLoaded('enrollment.course', function () {
                return [
                    'id' => $this->enrollment->course->id,
                    'code' => $this->enrollment->course->code,
                    'name' => $this->enrollment->course->name,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
