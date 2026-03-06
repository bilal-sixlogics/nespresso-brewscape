<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class ProductSaleUnit extends Model {
    use LogsActivity;
    protected $fillable = ['product_id','sku_code','label','label_en','price','original_price','quantity','is_default','sort_order'];
    protected $casts = ['price' => 'decimal:2','original_price' => 'decimal:2','is_default' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function product() { return $this->belongsTo(Product::class); }
    public function inventoryStock() { return $this->hasOne(InventoryStock::class); }
    public function inventoryTransactions() { return $this->hasMany(InventoryTransaction::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
}
