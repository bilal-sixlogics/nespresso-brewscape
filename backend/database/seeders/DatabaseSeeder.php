<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles ──────────────────────────────────────────────────────────────
        $roles = ['super_admin', 'manager', 'inventory_staff'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // ── Super Admin User ───────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@cafrezzo.com'],
            [
                'name'     => 'Cafrezzo Admin',
                'password' => Hash::make('Cafrezzo2024!'),
                'locale'   => 'fr',
                'is_active'=> true,
            ]
        );
        $admin->assignRole('super_admin');

        // ── Manager User ───────────────────────────────────────────────────────
        $manager = User::firstOrCreate(
            ['email' => 'manager@cafrezzo.com'],
            [
                'name'     => 'Store Manager',
                'password' => Hash::make('Manager2024!'),
                'locale'   => 'fr',
                'is_active'=> true,
            ]
        );
        $manager->assignRole('manager');

        // ── Default Site Settings ──────────────────────────────────────────────
        $this->call(SettingsSeeder::class);

        // ── Products & Catalogue ───────────────────────────────────────────────
        $this->call(ProductSeeder::class);
    }
}
