<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', 'integer', 'exists:enrollments,id'],
            'score' => ['required', 'numeric', 'min:0', 'max:20', 'decimal:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'enrollment_id.required' => 'La matrícula es obligatoria.',
            'enrollment_id.exists' => 'La matrícula no existe.',
            'score.required' => 'La nota es obligatoria.',
            'score.numeric' => 'La nota debe ser un número.',
            'score.min' => 'La nota mínima es 0.',
            'score.max' => 'La nota máxima es 20.',
            'score.decimal' => 'La nota debe tener máximo 1 decimal.',
        ];
    }
}
