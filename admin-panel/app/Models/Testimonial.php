<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Testimonial extends Model {
    use LogsActivity;
    protected $fillable = ['author_name','role','role_en','review_text','review_text_en','product_id','rating','avatar_path','is_active','sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function product() { return $this->belongsTo(Product::class); }
}
