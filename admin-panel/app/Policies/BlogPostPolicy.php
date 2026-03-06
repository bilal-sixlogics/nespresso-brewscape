<?php

namespace App\Policies;

use App\Models\BlogPost;
use App\Models\User;

class BlogPostPolicy
{
    public function viewAny(User $user): bool  { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function view(User $user, BlogPost $post): bool  { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function create(User $user): bool   { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function update(User $user, BlogPost $post): bool { return $user->hasAnyRole(['super_admin', 'manager']); }
    public function delete(User $user, BlogPost $post): bool { return $user->hasRole('super_admin'); }
    public function restore(User $user, BlogPost $post): bool { return $user->hasRole('super_admin'); }
    public function forceDelete(User $user, BlogPost $post): bool { return $user->hasRole('super_admin'); }
}
