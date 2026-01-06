<?php

namespace App\Http\Requests\Location;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role sudah di middleware
    }

    public function rules(): array
    {
        return [
                 "name" => ["required", "string", "max:255"],
                 "address" => ["nullable", "string", "max:255"],
                "code" => ["nullable", "string", "max:50"],
        ];

    }
}
