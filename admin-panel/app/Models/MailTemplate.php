<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\App;

class MailTemplate extends Model
{
    protected $fillable = [
        'key', 'name', 'subject_fr', 'subject_en',
        'body_fr', 'body_en', 'variables', 'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    /** Get localized subject, merging {variables} */
    public function getSubject(array $vars = [], ?string $locale = null): string
    {
        $locale = $locale ?? App::getLocale();
        $subject = ($locale !== 'fr' && $this->subject_en) ? $this->subject_en : $this->subject_fr;
        return $this->interpolate($subject, $vars);
    }

    /** Get localized HTML body, merging {variables} */
    public function getBody(array $vars = [], ?string $locale = null): string
    {
        $locale = $locale ?? App::getLocale();
        $body = ($locale !== 'fr' && $this->body_en) ? $this->body_en : $this->body_fr;
        return $this->interpolate($body, $vars);
    }

    private function interpolate(string $text, array $vars): string
    {
        foreach ($vars as $key => $value) {
            $text = str_replace('{' . $key . '}', (string) $value, $text);
        }
        return $text;
    }

    public static function findByKey(string $key): ?self
    {
        return static::where('key', $key)->where('is_active', true)->first();
    }
}
