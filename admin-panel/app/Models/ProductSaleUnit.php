<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProductSaleUnit extends Model
{
    use LogsActivity;

    protected $fillable = [
        'product_id', 'sku_code', 'label', 'label_en',
        'price', 'original_price', 'quantity',
        // Hierarchical unit fields
        'base_unit', 'base_quantity', 'parent_sale_unit_id', 'bundle_count', 'weight_kg',
        // Per-unit discount fields
        'discount_percent', 'discount_amount', 'inherit_product_discount', 'discount_expires_at',
        'is_default', 'sort_order',
    ];

    protected $casts = [
        'price'                    => 'decimal:2',
        'original_price'           => 'decimal:2',
        'base_quantity'            => 'decimal:3',
        'weight_kg'                => 'decimal:3',
        'discount_percent'         => 'decimal:2',
        'discount_amount'          => 'decimal:2',
        'inherit_product_discount' => 'boolean',
        'discount_expires_at'      => 'datetime',
        'is_default'               => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }

    /** The product this unit belongs to */
    public function product() { return $this->belongsTo(Product::class); }

    /** If this is a bundle: the single-pack unit it references */
    public function parentUnit() { return $this->belongsTo(self::class, 'parent_sale_unit_id'); }

    /** Child bundles that use this unit as their parent */
    public function bundles() { return $this->hasMany(self::class, 'parent_sale_unit_id'); }

    /** Stock level record */
    public function inventoryStock() { return $this->hasOne(InventoryStock::class, 'product_sale_unit_id'); }

    public function inventoryTransactions() { return $this->hasMany(InventoryTransaction::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }

    /**
     * Human-friendly description of what this unit represents.
     * E.g. "Pack 10kg" or "Set of 6 × Pack 10kg"
     */
    public function getDisplayLabel(?string $locale = null): string
    {
        $isFr  = ($locale ?? app()->getLocale()) === 'fr';
        $label = $isFr ? $this->label : ($this->label_en ?: $this->label);

        if ($this->parent_sale_unit_id && $this->bundle_count && $this->parentUnit) {
            $parentLabel = $isFr
                ? $this->parentUnit->label
                : ($this->parentUnit->label_en ?: $this->parentUnit->label);
            return "Set of {$this->bundle_count} × {$parentLabel}";
        }

        if ($this->base_quantity && $this->base_unit) {
            $qty = rtrim(rtrim(number_format((float) $this->base_quantity, 3, '.', ''), '0'), '.');
            return $label ?: "{$qty}{$this->base_unit}";
        }

        return $label;
    }

    /** Effective price (for comparison: price per base unit) */
    public function getPricePerBaseUnitAttribute(): ?float
    {
        if ($this->base_quantity && $this->base_quantity > 0) {
            return round((float) $this->price / (float) $this->base_quantity, 4);
        }
        return null;
    }
}
