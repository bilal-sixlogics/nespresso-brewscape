<?php

namespace App\Policies;

use App\Models\User;

/**
 * Used by ManageSettings and other settings-related pages.
 */
class SettingsPolicy
{
    public function viewAny(User $user): bool { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function update(User $user): bool  { return $user->hasRole('super_admin'); }
}
