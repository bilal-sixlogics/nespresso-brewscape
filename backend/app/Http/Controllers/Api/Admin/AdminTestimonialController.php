<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class AdminTestimonialController extends Controller
{
    public function index()
    {
        return response()->json(Testimonial::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'author_name'    => 'required|string|max:255',
            'role'           => 'nullable|string',
            'role_en'        => 'nullable|string',
            'review_text'    => 'required|string',
            'review_text_en' => 'nullable|string',
            'rating'         => 'nullable|integer|min:1|max:5',
            'product_id'     => 'nullable|exists:products,id',
            'is_active'      => 'nullable|boolean',
            'sort_order'     => 'nullable|integer',
        ]);

        return response()->json(Testimonial::create($data), 201);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $testimonial->update($request->all());
        return response()->json($testimonial);
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        return response()->json(['message' => 'Testimonial deleted']);
    }
}
