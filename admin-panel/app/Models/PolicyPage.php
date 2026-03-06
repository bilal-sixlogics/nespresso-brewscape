<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\App;

class PolicyPage extends Model
{
    protected $fillable = [
        'key', 'title_fr', 'title_en', 'content_fr', 'content_en', 'last_updated_at',
    ];

    protected $casts = [
        'last_updated_at' => 'datetime',
    ];

    public function getTitle(?string $locale = null): string
    {
        $locale = $locale ?? App::getLocale();
        return ($locale !== 'fr' && $this->title_en) ? $this->title_en : $this->title_fr;
    }

    public function getContent(?string $locale = null): string
    {
        $locale = $locale ?? App::getLocale();
        return ($locale !== 'fr' && $this->content_en) ? $this->content_en : $this->content_fr;
    }
}
