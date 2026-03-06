<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Policies\BlogPostPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Model policies
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(BlogPost::class, BlogPostPolicy::class);

        // Super admin bypasses all gates
        Gate::before(function (User $user, string $ability) {
            if ($user->hasRole('super_admin')) {
                return true;
            }
        });

        // Page-level access gates for Filament pages
        Gate::define('access-settings', fn (User $user) => $user->hasAnyRole(['super_admin', 'manager']));
        Gate::define('manage-settings', fn (User $user) => $user->hasRole('super_admin'));
        Gate::define('access-inventory', fn (User $user) => $user->hasAnyRole(['super_admin', 'manager', 'inventory_staff']));
    }
}
