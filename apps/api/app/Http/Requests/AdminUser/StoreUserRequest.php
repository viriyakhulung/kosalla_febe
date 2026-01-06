<?php

namespace App\Http\Requests\AdminUser;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'organization_id' => ['required','integer','exists:organizations,id'],
            'location_id' => ['nullable','integer','exists:locations,id'],
            'master_role_id' => ['required','integer','exists:master_roles,id'],
        ];
    }
}
