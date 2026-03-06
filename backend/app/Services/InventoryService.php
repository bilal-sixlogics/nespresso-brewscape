<?php

namespace App\Services;

use App\Models\InventoryStock;
use App\Models\InventoryTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class InventoryService
{
    /**
     * Adjust stock safely with DB transaction + row lock.
     * Handles concurrent requests correctly (millions of users).
     */
    public function adjust(
        int    $saleUnitId,
        string $type,
        float  $quantity,
        string $notes = '',
        ?int   $referenceId = null,
        string $referenceType = ''
    ): InventoryTransaction {
        return DB::transaction(function () use ($saleUnitId, $type, $quantity, $notes, $referenceId, $referenceType) {
            // Lock the row to prevent race conditions
            $stock = InventoryStock::where('product_sale_unit_id', $saleUnitId)
                ->lockForUpdate()
                ->firstOrCreate(
                    ['product_sale_unit_id' => $saleUnitId],
                    ['quantity_on_hand' => 0, 'reorder_threshold' => 5, 'reorder_quantity' => 10]
                );

            $before = $stock->quantity_on_hand;

            match ($type) {
                'restock', 'return'    => $stock->increment('quantity_on_hand', $quantity),
                'sale', 'wastage'      => $stock->decrement('quantity_on_hand', $quantity),
                'adjustment'           => $stock->update(['quantity_on_hand' => $quantity]),
            };

            $stock->updated_at = now();
            $stock->save();

            $after = (float) $stock->fresh()->quantity_on_hand;

            $transaction = InventoryTransaction::create([
                'product_sale_unit_id' => $saleUnitId,
                'type'                 => $type,
                'quantity'             => abs($quantity),
                'quantity_before'      => $before,
                'quantity_after'       => $after,
                'reference_type'       => $referenceType,
                'reference_id'         => $referenceId,
                'notes'                => $notes,
                'performed_by'         => Auth::id(),
                'created_at'           => now(),
            ]);

            // Invalidate cache for this product's stock status
            Cache::forget("stock_{$saleUnitId}");

            return $transaction;
        });
    }

    /**
     * Get stock level with caching for high-traffic reads.
     */
    public function getStock(int $saleUnitId): float
    {
        return Cache::remember("stock_{$saleUnitId}", 60, function () use ($saleUnitId) {
            return InventoryStock::where('product_sale_unit_id', $saleUnitId)
                ->value('quantity_on_hand') ?? 0;
        });
    }

    /**
     * Get all low-stock items (used by dashboard widget).
     */
    public function getLowStockItems()
    {
        return Cache::remember('low_stock_items', 120, function () {
            return InventoryStock::with(['saleUnit.product'])
                ->whereColumn('quantity_on_hand', '<=', 'reorder_threshold')
                ->orderBy('quantity_on_hand')
                ->get();
        });
    }
}
