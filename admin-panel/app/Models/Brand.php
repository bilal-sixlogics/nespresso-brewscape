<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Brand extends Model {
    use LogsActivity;
    protected $fillable = ['name','logo_path','description','is_active'];
    protected $casts = ['is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function products() { return $this->hasMany(Product::class); }
}
