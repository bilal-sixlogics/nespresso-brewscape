<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Admin\AdminLoginController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminTagController;
use App\Http\Controllers\Api\Admin\AdminInventoryController;
use App\Http\Controllers\Api\Admin\AdminBlogPostController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminTestimonialController;
use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\AdminPromoCodeController;
use App\Http\Controllers\Api\Admin\AdminDeliveryController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;

/*
|--------------------------------------------------------------------------
| Cafrezzo REST API Routes  (v1)
|--------------------------------------------------------------------------
| Base URL:  https://api.cafrezzo.com/api/v1
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
    // ADMIN AUTH (no middleware — login endpoint is public)
    // -----------------------------------------------------------------------
    Route::post('admin/login',  [AdminLoginController::class, 'store']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('admin/logout', [AdminLoginController::class, 'destroy']);
        Route::get('admin/me',      [AdminLoginController::class, 'me']);
    });

    // -----------------------------------------------------------------------
    // ADMIN PROTECTED ENDPOINTS
    // -----------------------------------------------------------------------
    Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

        // Dashboard
        Route::get('dashboard/stats',         [AdminDashboardController::class, 'stats']);
        Route::get('dashboard/sales-trend',   [AdminDashboardController::class, 'salesTrend']);
        Route::get('dashboard/recent-orders', [AdminDashboardController::class, 'recentOrders']);

        // Products
        Route::apiResource('products', AdminProductController::class);

        // Orders
        Route::apiResource('orders', AdminOrderController::class)->only(['index', 'show', 'destroy']);
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

        // Catalog setup
        Route::apiResource('categories', AdminCategoryController::class);
        Route::apiResource('brands',     AdminBrandController::class);
        Route::apiResource('tags',       AdminTagController::class);

        // Inventory
        Route::get('inventory',                          [AdminInventoryController::class, 'index']);
        Route::post('inventory/{inventoryStock}/adjust', [AdminInventoryController::class, 'adjust']);
        Route::get('inventory/{inventoryStock}/transactions', [AdminInventoryController::class, 'transactions']);

        // Blog Posts
        Route::apiResource('blog-posts', AdminBlogPostController::class);

        // Testimonials
        Route::apiResource('testimonials', AdminTestimonialController::class)->except(['show']);

        // Banners
        Route::apiResource('banners', AdminBannerController::class)->except(['show']);

        // Promo Codes
        Route::apiResource('promo-codes', AdminPromoCodeController::class)->except(['show']);

        // Delivery Types
        Route::get('delivery-types',                     [AdminDeliveryController::class, 'deliveryIndex']);
        Route::post('delivery-types',                    [AdminDeliveryController::class, 'deliveryStore']);
        Route::put('delivery-types/{deliveryType}',      [AdminDeliveryController::class, 'deliveryUpdate']);
        Route::delete('delivery-types/{deliveryType}',   [AdminDeliveryController::class, 'deliveryDestroy']);

        // Payment Methods
        Route::get('payment-methods',                    [AdminDeliveryController::class, 'paymentIndex']);
        Route::post('payment-methods',                   [AdminDeliveryController::class, 'paymentStore']);
        Route::put('payment-methods/{paymentMethod}',    [AdminDeliveryController::class, 'paymentUpdate']);
        Route::delete('payment-methods/{paymentMethod}', [AdminDeliveryController::class, 'paymentDestroy']);

        // Users
        Route::apiResource('users', AdminUserController::class)->only(['index', 'show', 'update', 'destroy']);

        // Settings
        Route::get('settings',          [AdminSettingsController::class, 'index']);
        Route::put('settings',          [AdminSettingsController::class, 'update']);
        Route::get('settings/{group}',  [AdminSettingsController::class, 'group']);
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
