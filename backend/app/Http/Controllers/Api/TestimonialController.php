<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class TestimonialController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_testimonials_' . $locale, 300, fn () =>
            Testimonial::where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn ($t) => [
                    'author'  => $t->author_name,
                    'role'    => $locale === 'fr' ? $t->role : ($t->role_en ?: $t->role),
                    'review'  => $locale === 'fr' ? $t->review_text : ($t->review_text_en ?: $t->review_text),
                    'rating'  => $t->rating,
                    'avatar'  => $t->avatar_path,
                ])
        ));
    }
}
