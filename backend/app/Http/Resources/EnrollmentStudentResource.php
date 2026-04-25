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
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'dni' => $this->user->dni,
                'role' => $this->user->role,
            ],
            'grade' => $grade ? [
                'id' => $grade->id,
                'score' => $grade->score,
                'period' => $grade->period,
            ] : null,
        ];
    }
}
