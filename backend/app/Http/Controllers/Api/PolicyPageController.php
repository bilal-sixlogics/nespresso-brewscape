<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PolicyPage;
use Illuminate\Support\Facades\App;

/**
 * @OA\Tag(name="Policy", description="Policy pages (privacy, returns, terms)")
 */
class PolicyPageController extends Controller
{
    /** @OA\Get(path="/api/v1/public/policy/{key}", tags={"Policy"}, summary="Get a policy page by key") */
    public function show(string $key)
    {
        $page = PolicyPage::where('key', $key)->firstOrFail();
        $locale = App::getLocale();

        return response()->json([
            'key'            => $page->key,
            'title'          => $locale === 'en' && $page->title_en ? $page->title_en : $page->title_fr,
            'content'        => $locale === 'en' && $page->content_en ? $page->content_en : $page->content_fr,
            'last_updated_at'=> $page->last_updated_at,
        ]);
    }
}
