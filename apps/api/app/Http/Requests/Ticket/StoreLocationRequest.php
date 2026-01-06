<?php 

namespace App\Http\Requests\Location;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLocationRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->hasRole('super-admin'); }

    public function rules(): array
    {
        $org = $this->route('organization');

        return [
            'name' => ['required','string','max:200'],
            'code' => ['required','string','max:50',
                Rule::unique('locations','code')->where('organization_id', $org->id)
            ],
            'address' => ['nullable','string'],
            'timezone' => ['nullable','string','max:64'],
        ];
    }
}
