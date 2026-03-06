<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class SiteBanner extends Model {
    use LogsActivity;
    protected $fillable = ['message','message_en','cta_label','cta_label_en','cta_url','bg_color','text_color','is_active','sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
}
