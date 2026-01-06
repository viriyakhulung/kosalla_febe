<?php

namespace App\Http\Requests\Location;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->hasRole('super-admin'); }

    public function rules(): array
    {
        $location = $this->route('location');

        return [
            'name' => ['sometimes','string','max:200'],
            'code' => ['sometimes','string','max:50',
                Rule::unique('locations','code')
                    ->where('organization_id', $location->organization_id)
                    ->ignore($location->id)
            ],
            'address' => ['nullable','string'],
            'timezone' => ['nullable','string','max:64'],
        ];
    }
}
