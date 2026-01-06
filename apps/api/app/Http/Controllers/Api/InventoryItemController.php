<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InventoryItem\StoreInventoryItemRequest;
use App\Http\Requests\InventoryItem\UpdateInventoryItemRequest;
use App\Models\InventoryItem;
use App\Models\Organization;

class InventoryItemController extends Controller
{
    public function index(Organization $organization)
    {
        return $organization->inventoryItems()
            ->latest()
            ->paginate(50);
    }

    public function store(StoreInventoryItemRequest $request, Organization $organization)
    {
        // unique per org (sesuai unique index)
        $exists = $organization->inventoryItems()
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Inventory item name already exists in this organization'], 422);
        }

        $item = $organization->inventoryItems()->create([
            'name' => $request->name,
            'product_type' => $request->product_type,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json($item, 201);
    }

    public function show(InventoryItem $inventoryItem)
    {
        return $inventoryItem->load('organization');
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem)
    {
        // kalau name berubah, cek unique per org
        if ($request->filled('name')) {
            $exists = InventoryItem::where('organization_id', $inventoryItem->organization_id)
                ->where('name', $request->name)
                ->where('id', '!=', $inventoryItem->id)
                ->exists();

            if ($exists) {
                return response()->json(['message' => 'Inventory item name already exists in this organization'], 422);
            }
        }

        $inventoryItem->update($request->validated());
        return $inventoryItem->fresh()->load('organization');
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();
        return response()->json(['message' => 'Inventory item deleted']);
    }
}
