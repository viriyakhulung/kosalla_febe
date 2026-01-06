<?php 

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['enduser','engineer-manager','engineer-staff','super-admin']);
    }

    public function rules(): array
    {
        return [
            'body' => ['required','string'],
            'is_internal' => ['nullable','boolean'], // hanya dipakai jika engineer
        ];
    }
}
