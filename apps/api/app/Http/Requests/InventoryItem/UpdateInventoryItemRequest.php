<?php

namespace App\Http\Requests\InventoryItem;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['sometimes','string','max:150'],
            'product_type' => ['sometimes','string','max:30'],
            'is_active' => ['nullable','boolean'],
        ];
    }
}
