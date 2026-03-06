<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email', 'name', 'locale', 'token',
        'subscribed_at', 'unsubscribed_at', 'ip_address',
    ];

    protected $casts = [
        'subscribed_at'   => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($sub) {
            if (empty($sub->token)) {
                $sub->token = Str::random(64);
            }
            if (empty($sub->subscribed_at)) {
                $sub->subscribed_at = now();
            }
        });
    }

    public function isActive(): bool
    {
        return is_null($this->unsubscribed_at);
    }

    public function unsubscribe(): void
    {
        $this->update(['unsubscribed_at' => now()]);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('unsubscribed_at');
    }
}
