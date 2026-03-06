<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = App::getLocale();
        $isFr   = $locale === 'fr';

        return [
            'id'               => $this->id,
            'slug'             => $this->slug,
            'name'             => $isFr ? $this->name : ($this->name_en ?: $this->name),
            'name_part2'       => $isFr ? $this->name_part2 : ($this->name_part2_en ?: $this->name_part2),
            'tagline'          => $isFr ? $this->tagline : ($this->tagline_en ?: $this->tagline),
            'description'      => $isFr ? $this->description : ($this->description_en ?: $this->description),
            'price'            => (float) $this->price,
            'original_price'   => $this->original_price ? (float) $this->original_price : null,
            'discount_percent' => $this->discount_percent,
            'intensity'        => $this->intensity,
            'origin'           => $this->origin,
            'roast_level'      => $this->roast_level,
            'processing_method'=> $this->processing_method,
            'weight'           => $this->weight,
            'average_rating'   => (float) $this->average_rating,
            'review_count'     => $this->review_count,
            'is_featured'      => (bool) $this->is_featured,
            'is_new'           => (bool) $this->is_new,
            'in_stock'         => (bool) $this->in_stock,
            'category'         => $this->whenLoaded('category', fn () => [
                'id'   => $this->category->id,
                'name' => $isFr ? $this->category->name : ($this->category->name_en ?: $this->category->name),
                'slug' => $this->category->slug,
            ]),
            'brand'            => $this->whenLoaded('brand', fn () => [
                'id'   => $this->brand->id,
                'name' => $this->brand->name,
                'logo' => $this->brand->logo_path,
            ]),
            'primary_image'    => $this->whenLoaded('images', fn () =>
                $this->images->firstWhere('is_primary', true)?->path
                ?? $this->images->first()?->path
            ),
            'images'           => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => [
                    'path'       => $img->path,
                    'is_primary' => (bool) $img->is_primary,
                    'sort_order' => $img->sort_order,
                ])
            ),
            'sale_units'       => $this->whenLoaded('saleUnits', fn () =>
                $this->saleUnits->map(fn ($u) => [
                    'id'             => $u->id,
                    'sku'            => $u->sku_code,
                    'label'          => $isFr ? $u->label : ($u->label_en ?: $u->label),
                    'price'          => (float) $u->price,
                    'original_price' => $u->original_price ? (float) $u->original_price : null,
                    'quantity'       => $u->quantity,
                    'is_default'     => (bool) $u->is_default,
                ])
            ),
            'taste_profile'    => $this->whenLoaded('tasteProfile', fn () => $this->tasteProfile ? [
                'bitterness' => $this->tasteProfile->bitterness,
                'acidity'    => $this->tasteProfile->acidity,
                'roastiness' => $this->tasteProfile->roastiness,
                'body'       => $this->tasteProfile->body,
                'sweetness'  => $this->tasteProfile->sweetness,
            ] : null),
            'features'         => $this->whenLoaded('features', fn () =>
                $this->features->map(fn ($f) => [
                    'title' => $isFr ? $f->title : ($f->title_en ?: $f->title),
                    'items' => $f->items->map(fn ($i) => $isFr ? $i->item_text : ($i->item_text_en ?: $i->item_text)),
                ])
            ),
            'notes'            => $this->whenLoaded('notes', fn () => $this->notes->pluck('note_text')),
            'brew_sizes'       => $this->whenLoaded('brewSizes', fn () => $this->brewSizes->pluck('brew_size')),
            'tags'             => $this->whenLoaded('tags', fn () => $this->tags->pluck('tag')),
            'allergens'        => $this->whenLoaded('allergens', fn () =>
                $this->allergens->map(fn ($a) => $isFr ? $a->allergen_text : ($a->allergen_text_en ?: $a->allergen_text))
            ),
        ];
    }
}
