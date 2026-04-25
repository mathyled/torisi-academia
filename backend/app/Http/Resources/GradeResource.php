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
            'student' => $this->when($this->relationLoaded('enrollment') && $this->enrollment->relationLoaded('user'), function () {
                return [
                    'id' => $this->enrollment->user->id,
                    'name' => $this->enrollment->user->name,
                    'dni' => $this->enrollment->user->dni,
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
