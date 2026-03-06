<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OrderItem extends Model {
    protected $fillable = ['order_id','product_id','product_sale_unit_id','product_snapshot','quantity','unit_price','line_total'];
    protected $casts = ['product_snapshot' => 'array','unit_price' => 'decimal:2','line_total' => 'decimal:2'];
    public function order() { return $this->belongsTo(Order::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function saleUnit() { return $this->belongsTo(ProductSaleUnit::class, 'product_sale_unit_id'); }
}
