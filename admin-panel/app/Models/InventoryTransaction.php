<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class InventoryTransaction extends Model {
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    protected $fillable = ['product_sale_unit_id','type','quantity','quantity_before','quantity_after','reference_type','reference_id','notes','performed_by'];
    protected $casts = ['quantity' => 'decimal:3','quantity_before' => 'decimal:3','quantity_after' => 'decimal:3','created_at' => 'datetime'];
    public function saleUnit() { return $this->belongsTo(ProductSaleUnit::class, 'product_sale_unit_id'); }
    public function performer() { return $this->belongsTo(User::class, 'performed_by'); }
}
