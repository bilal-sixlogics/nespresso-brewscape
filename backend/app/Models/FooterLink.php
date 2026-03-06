<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class FooterLink extends Model {
    protected $fillable = ['section_id','label','label_en','url','is_external','sort_order','is_active'];
    protected $casts = ['is_external' => 'boolean','is_active' => 'boolean'];
    public function section() { return $this->belongsTo(FooterSection::class, 'section_id'); }
}
