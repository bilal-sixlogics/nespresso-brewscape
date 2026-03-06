<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PromoCode extends Model
{
    use LogsActivity;

    protected $table = 'promo_codes';

    protected $fillable = [
        'code', 'type', 'value', 'usage_limit', 'used_count', 'expires_at', 'is_active',
        'min_order_amount', 'first_order_only', 'max_discount_amount',
        'applies_to', 'included_ids', 'exclude_discounted_products', 'exclude_on_sale_products',
        'customer_email', 'description',
    ];

    protected $casts = [
        'value'                      => 'decimal:2',
        'expires_at'                 => 'datetime',
        'is_active'                  => 'boolean',
        'min_order_amount'           => 'decimal:2',
        'first_order_only'           => 'boolean',
        'max_discount_amount'        => 'decimal:2',
        'included_ids'               => 'array',
        'exclude_discounted_products'=> 'boolean',
        'exclude_on_sale_products'   => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'promo_code_products');
    }

    public function isValid(): bool
    {
        return $this->is_active
            && (!$this->expires_at || $this->expires_at->isFuture())
            && (!$this->usage_limit || $this->used_count < $this->usage_limit);
    }

    public function meetsConditions(float $subtotal, int $orderCount = 0, string $email = ''): bool
    {
        if (!$this->isValid()) return false;
        if ($this->min_order_amount && $subtotal < (float) $this->min_order_amount) return false;
        if ($this->first_order_only && $orderCount > 0) return false;
        if ($this->customer_email && strtolower($this->customer_email) !== strtolower($email)) return false;
        return true;
    }

    public function getApplicableSubtotal(array $items): float
    {
        if ($this->applies_to === 'products') {
            $linkedIds = $this->products()->pluck('products.id')->toArray();
            $allIds    = array_merge($linkedIds, (array) ($this->included_ids ?? []));
            $subtotal  = collect($items)->filter(fn($i) => in_array($i['product']->id, $allIds))->sum('line_total');
        } elseif ($this->applies_to === 'categories') {
            $catIds   = (array) ($this->included_ids ?? []);
            $subtotal = collect($items)->filter(fn($i) => in_array($i['product']->category_id, $catIds))->sum('line_total');
        } else {
            $subtotal = collect($items)->sum('line_total');
        }

        if ($this->exclude_discounted_products || $this->exclude_on_sale_products) {
            foreach ($items as $item) {
                $p  = $item['product'];
                $su = $item['sale_unit'];
                $hasDiscount = ($su->discount_percent || $su->discount_amount) || ($p->original_price && $p->original_price > $p->price);
                if (($this->exclude_discounted_products && $hasDiscount) || ($this->exclude_on_sale_products && $p->is_on_sale)) {
                    $subtotal = max(0, $subtotal - (float) $item['line_total']);
                }
            }
        }

        return (float) $subtotal;
    }

    public function calculateDiscount(float $applicableSubtotal): float
    {
        if ($applicableSubtotal <= 0) return 0.0;
        $discount = $this->type === 'percent'
            ? $applicableSubtotal * ((float) $this->value / 100)
            : (float) $this->value;
        if ($this->max_discount_amount && $discount > (float) $this->max_discount_amount) {
            $discount = (float) $this->max_discount_amount;
        }
        return round(min($discount, $applicableSubtotal), 2);
    }
}
