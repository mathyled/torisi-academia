<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGradeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'score' => ['required', 'numeric', 'min:0', 'max:20', 'decimal:0,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'score.required' => 'La nota es obligatoria.',
            'score.numeric' => 'La nota debe ser un número.',
            'score.min' => 'La nota mínima es 0.',
            'score.max' => 'La nota máxima es 20.',
            'score.decimal' => 'La nota debe tener máximo 1 decimal.',
        ];
    }
}
