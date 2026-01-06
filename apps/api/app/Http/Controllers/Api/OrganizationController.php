<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
   public function index()
{
    // otomatis: hanya yang belum dihapus (deleted_at NULL)
    $orgs = Organization::orderBy('id', 'desc')->get();

    return response()->json(['data' => $orgs]);
}
public function trash()
{
    return response()->json([
        'data' => Organization::onlyTrashed()->orderByDesc('deleted_at')->get()
    ]);
}

public function restore($id)
{
    $org = Organization::onlyTrashed()->findOrFail($id);
    $org->restore();
    return response()->json(['data' => $org]);
}

public function forceDelete($id)
{
    $org = Organization::onlyTrashed()->findOrFail($id);
    $org->forceDelete();
    return response()->json(['message' => 'Force deleted']);
}

public function destroy(Organization $organization)
{
    $organization->delete();

    return response()->json(['message' => 'Deleted ']);}

public function store(Request $request)
{
    $data = $request->validate([
        'name' => ['required','string','max:200'],
    ]);

    $slug = $this->makeUniqueSlug($data['name']);

    $org = Organization::create([
        'name' => $data['name'],
        'slug' => $slug,
        'is_active' => true,
    ]);

    return response()->json(['data' => $org], 201);
}

public function update(Request $request, Organization $organization)
{
    $data = $request->validate([
        'name' => ['required','string','max:200'],
    ]);

    $slug = $this->makeUniqueSlug($data['name'], $organization->id);

    $organization->update([
        'name' => $data['name'],
        'slug' => $slug,
    ]);

    return response()->json(['data' => $organization]);
}

private function makeUniqueSlug(string $name, ?int $ignoreId = null): string
{
    $slug = Str::slug($name);
    $base = $slug;
    $i = 1;

    // kalau kamu mau slug tetap unik walau soft deleted, pakai withTrashed()
    $query = Organization::withTrashed();

    while (
        $query->where('slug', $slug)
              ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
              ->exists()
    ) {
        $slug = $base . '-' . $i++;
    }

    return $slug;
}

}
