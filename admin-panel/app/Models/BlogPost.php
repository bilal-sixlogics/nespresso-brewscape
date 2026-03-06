<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class BlogPost extends Model {
    use LogsActivity, SoftDeletes;
    protected $fillable = ['title','title_en','slug','category','category_en','excerpt','excerpt_en','body','body_en','image_path','external_url','published_at','is_published','author_id'];
    protected $casts = ['is_published' => 'boolean','published_at' => 'datetime'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function author() { return $this->belongsTo(User::class, 'author_id'); }
}
