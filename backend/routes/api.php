<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Cafrezzo REST API Routes  (v1)
|--------------------------------------------------------------------------
| Base URL:  https://api.cafrezzo.com/api/v1
|
| STATUS: Deferred — user approval required before implementation.
|         Stubs are grouped here to show intended structure.
|         Controllers do not exist yet.
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // -----------------------------------------------------------------------
    // PUBLIC ENDPOINTS  (no auth required)
    // -----------------------------------------------------------------------
    Route::prefix('public')->group(function () {

        // Catalog
        Route::get('products',              'App\Http\Controllers\Api\ProductController@index');
        Route::get('products/{slug}',       'App\Http\Controllers\Api\ProductController@show');
        Route::get('categories',            'App\Http\Controllers\Api\CategoryController@index');
        Route::get('brands',                'App\Http\Controllers\Api\BrandController@index');

        // Content
        Route::get('blog-posts',            'App\Http\Controllers\Api\BlogPostController@index');
        Route::get('blog-posts/{slug}',     'App\Http\Controllers\Api\BlogPostController@show');
        Route::get('testimonials',          'App\Http\Controllers\Api\TestimonialController@index');

        // Commerce config
        Route::get('deals',                 'App\Http\Controllers\Api\DealController@index');
        Route::get('banners',               'App\Http\Controllers\Api\SiteBannerController@index');
        Route::get('delivery-types',        'App\Http\Controllers\Api\DeliveryTypeController@index');
        Route::get('payment-methods',       'App\Http\Controllers\Api\PaymentMethodController@index');

        // Site config
        Route::get('footer',                'App\Http\Controllers\Api\FooterController@index');
        Route::get('contact',               'App\Http\Controllers\Api\ContactInfoController@index');
        Route::get('settings/brand',        'App\Http\Controllers\Api\SettingController@brand');
        Route::get('settings/promo',        'App\Http\Controllers\Api\SettingController@promo');
        Route::get('settings/checkout',     'App\Http\Controllers\Api\SettingController@checkout');
        Route::get('settings/colors',       'App\Http\Controllers\Api\SettingController@colors');
        Route::get('settings/tax',          'App\Http\Controllers\Api\SettingController@tax');

        // Policy pages (privacy, returns, terms)
        Route::get('policy/{key}',          'App\Http\Controllers\Api\PolicyPageController@show');

        // Search
        Route::get('search',                'App\Http\Controllers\Api\SearchController@index');

        // Promo code validation (public — caller supplies code + cart total)
        Route::post('promo-codes/validate', 'App\Http\Controllers\Api\OrderController@validatePromo');
    });

    // -----------------------------------------------------------------------
    // AUTH
    // -----------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('register',             'App\Http\Controllers\Api\Auth\RegisterController@store');
        Route::post('login',                'App\Http\Controllers\Api\Auth\LoginController@store');
        Route::post('logout',               'App\Http\Controllers\Api\Auth\LoginController@destroy')->middleware('auth:sanctum');
        Route::post('forgot-password',      'App\Http\Controllers\Api\Auth\PasswordController@forgot');
        Route::post('reset-password',       'App\Http\Controllers\Api\Auth\PasswordController@reset');
    });

    // -----------------------------------------------------------------------
    // AUTHENTICATED CUSTOMER ENDPOINTS
    // -----------------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {

        // Account
        Route::get('account/profile',       'App\Http\Controllers\Api\AccountController@show');
        Route::put('account/profile',       'App\Http\Controllers\Api\AccountController@update');

        // Addresses
        Route::get('account/addresses',     'App\Http\Controllers\Api\AddressController@index');
        Route::post('account/addresses',    'App\Http\Controllers\Api\AddressController@store');
        Route::put('account/addresses/{id}',    'App\Http\Controllers\Api\AddressController@update');
        Route::delete('account/addresses/{id}', 'App\Http\Controllers\Api\AddressController@destroy');

        // Orders
        Route::get('orders',                  'App\Http\Controllers\Api\OrderController@index');
        Route::get('orders/{id}',             'App\Http\Controllers\Api\OrderController@show');
        Route::post('orders',                 'App\Http\Controllers\Api\OrderController@store');
        Route::post('orders/{id}/cancel',     'App\Http\Controllers\Api\OrderController@cancel');
        Route::get('orders/{id}/receipt',     'App\Http\Controllers\Api\OrderController@receipt');
    });
});
