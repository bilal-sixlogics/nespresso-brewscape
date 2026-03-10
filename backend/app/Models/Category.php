<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Category extends Model {
    use LogsActivity;
    protected $fillable = ['name','name_en','slug','description','description_en','image_path','sort_order','is_active','product_type'];
    protected $casts = ['is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function products() { return $this->hasMany(Product::class); }
}
