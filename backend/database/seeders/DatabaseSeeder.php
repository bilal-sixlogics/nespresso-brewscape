<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

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
        $admin = User::updateOrCreate(
            ['email' => 'admin@cafrezzo.com'],
            [
                'name'      => 'Cafrezzo Admin',
                'password'  => Hash::make('Cafrezzo2024!'),
                'locale'    => 'fr',
                'is_active' => true,
            ]
        );
        $admin->assignRole('super_admin');

        // ── Manager User ───────────────────────────────────────────────────────
        $manager = User::updateOrCreate(
            ['email' => 'manager@cafrezzo.com'],
            [
                'name'      => 'Store Manager',
                'password'  => Hash::make('Manager2024!'),
                'locale'    => 'fr',
                'is_active' => true,
            ]
        );
        $manager->assignRole('manager');

        // ── Default Site Settings (delivery types, payment methods, etc.) ──────
        $this->call(SettingsSeeder::class);

        // ── 15 Customers with addresses ────────────────────────────────────────
        $this->call(CustomerSeeder::class);

        // ── Full product catalogue (200+ coffee, 50 treats, 20 machines, 10 acc)
        $this->call(BigProductSeeder::class);

        // ── Mail Templates + Policy Pages ──────────────────────────────────────
        $this->call(MailTemplateSeeder::class);

        // ── Sample Promo Codes + Tax Settings ──────────────────────────────────
        $this->call(PromoSeeder::class);

        // ── 50 Orders with real user+product relationships ─────────────────────
        $this->call(OrderSeeder::class);
    }
}
