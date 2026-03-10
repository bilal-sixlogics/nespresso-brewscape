<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryStock;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminInventoryController extends Controller
{
    /**
     * GET /api/v1/admin/inventory
     */
    public function index(Request $request)
    {
        // Join inventory_stock with products for richer data
        $stocks = InventoryStock::with(['saleUnit.product'])
            ->when($request->filled('search'), fn ($q) => $q->whereHas('saleUnit.product', fn ($pq) =>
                $pq->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('sku', 'like', '%' . $request->search . '%')
            ))
            ->when($request->query('filter') === 'low', fn ($q) => $q->whereColumn('quantity_on_hand', '<=', 'reorder_threshold')->where('quantity_on_hand', '>', 0))
            ->when($request->query('filter') === 'out', fn ($q) => $q->where('quantity_on_hand', '<=', 0))
            ->get()
            ->map(fn ($stock) => [
                'id'                 => $stock->id,
                'product_id'         => $stock->saleUnit?->product_id,
                'product_name'       => $stock->saleUnit?->product?->name ?? '—',
                'product_type'       => $stock->saleUnit?->product?->product_type ?? '—',
                'sku'                => $stock->saleUnit?->sku_code ?? '—',
                'sale_unit_label'    => $stock->saleUnit?->label ?? '—',
                'quantity_on_hand'   => $stock->quantity_on_hand,
                'reorder_threshold'  => $stock->reorder_threshold,
                'reorder_quantity'   => $stock->reorder_quantity,
                'last_updated'       => $stock->updated_at,
            ]);

        return response()->json(['data' => $stocks, 'total' => $stocks->count()]);
    }

    /**
     * POST /api/v1/admin/inventory/{id}/adjust
     */
    public function adjust(Request $request, InventoryStock $inventoryStock)
    {
        $request->validate([
            'type'     => 'required|in:restock,sale,return,adjustment,wastage',
            'quantity' => 'required|integer|not_in:0',
            'notes'    => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($request, $inventoryStock) {
            $before = $inventoryStock->quantity_on_hand;
            $after  = max(0, $before + $request->integer('quantity'));

            $inventoryStock->update(['quantity_on_hand' => $after]);

            InventoryTransaction::create([
                'product_sale_unit_id' => $inventoryStock->product_sale_unit_id,
                'type'                 => $request->type,
                'quantity'             => $request->integer('quantity'),
                'quantity_before'      => $before,
                'quantity_after'       => $after,
                'notes'                => $request->notes,
                'performed_by'         => $request->user()?->email ?? 'system',
            ]);

            return response()->json([
                'message'          => 'Stock adjusted',
                'quantity_before'  => $before,
                'quantity_after'   => $after,
            ]);
        });
    }

    /**
     * GET /api/v1/admin/inventory/{id}/transactions
     */
    public function transactions(InventoryStock $inventoryStock)
    {
        $txns = InventoryTransaction::where('product_sale_unit_id', $inventoryStock->product_sale_unit_id)
            ->orderByDesc('created_at')
            ->take(50)
            ->get();

        return response()->json(['data' => $txns]);
    }
}
