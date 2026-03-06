<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class PromoCode extends Model {
    use LogsActivity;
    protected $table = 'promo_codes';
    protected $fillable = ['code','type','value','usage_limit','used_count','expires_at','is_active'];
    protected $casts = ['value' => 'decimal:2','expires_at' => 'datetime','is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function isValid(): bool {
        return $this->is_active
            && (!$this->expires_at || $this->expires_at->isFuture())
            && (!$this->usage_limit || $this->used_count < $this->usage_limit);
    }
}
