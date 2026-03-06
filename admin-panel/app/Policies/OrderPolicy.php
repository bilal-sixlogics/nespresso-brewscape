<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool  { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function view(User $user, Order $order): bool    { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function create(User $user): bool   { return false; } // Orders come from storefront only
    public function update(User $user, Order $order): bool  { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function delete(User $user, Order $order): bool  { return $user->hasRole('super_admin'); }
}
