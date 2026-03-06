<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Deal extends Model {
    use LogsActivity;
    protected $fillable = ['product_id','deal_price','label','label_en','expires_at','is_active','sort_order'];
    protected $casts = ['deal_price' => 'decimal:2','expires_at' => 'datetime','is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function product() { return $this->belongsTo(Product::class); }
}
