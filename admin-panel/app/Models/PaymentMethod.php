<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class PaymentMethod extends Model {
    use LogsActivity;
    protected $fillable = ['name','name_en','description','icon','is_active','sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
}
