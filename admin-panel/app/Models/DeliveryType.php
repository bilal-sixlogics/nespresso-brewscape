<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class DeliveryType extends Model {
    use LogsActivity;
    protected $fillable = ['name','name_en','description','description_en','price','estimated_days','icon','is_active','sort_order'];
    protected $casts = ['price' => 'decimal:2','is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
}
