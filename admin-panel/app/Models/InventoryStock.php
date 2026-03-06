<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class InventoryStock extends Model {
    protected $table = 'inventory_stock';
    public $timestamps = false;
    protected $fillable = ['product_sale_unit_id','quantity_on_hand','reorder_threshold','reorder_quantity'];
    protected $casts = ['quantity_on_hand' => 'decimal:3','reorder_threshold' => 'decimal:3','reorder_quantity' => 'decimal:3'];
    const UPDATED_AT = 'updated_at';
    public function saleUnit() { return $this->belongsTo(ProductSaleUnit::class, 'product_sale_unit_id'); }
    public function isLow(): bool { return $this->quantity_on_hand <= $this->reorder_threshold; }
}
