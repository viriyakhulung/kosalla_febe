<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth dicek via middleware
    }

    public function rules(): array
    {
        return [
            'subject' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'priority' => ['nullable', 'in:low,normal,high'],

            // optional sesuai referensi kamu
            'action_number' => ['nullable', 'string', 'max:80'],
            'requested_resolution_date' => ['nullable', 'date'],
            'expected_date' => ['nullable', 'date'],
        ];
    }
}
