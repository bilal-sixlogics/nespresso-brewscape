<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Support\Facades\Blade;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login(\App\Filament\Pages\Auth\Login::class)
            ->passwordReset()
            ->profile(\App\Filament\Pages\EditProfile::class)
            ->darkMode(true)
            ->defaultThemeMode(\Filament\Enums\ThemeMode::Light)
            ->brandName('Cafrezzo')
            ->brandLogo(fn () => view('filament.brand'))
            ->favicon(asset('favicon.ico'))
            ->colors([
                'primary'   => Color::hex('#3C7A58'),
                'gray'      => Color::Zinc,
                'info'      => Color::Sky,
                'success'   => Color::Emerald,
                'warning'   => Color::Amber,
                'danger'    => Color::Rose,
            ])
            ->navigationGroups([
                NavigationGroup::make('Catalog'),
                NavigationGroup::make('Inventory'),
                NavigationGroup::make('Orders'),
                NavigationGroup::make('Content'),
                NavigationGroup::make('Commerce'),
                NavigationGroup::make('Analytics'),
                NavigationGroup::make('Settings'),
            ])
            ->plugins([
                \Leandrocfe\FilamentApexCharts\FilamentApexChartsPlugin::make(),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                // AccountWidget removed — user info + logout already live in the topbar avatar menu
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
                \App\Http\Middleware\SetLocaleFromUser::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            // ── Inject custom CSS (Premium Theme v3) ──────────────────────
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn () => Blade::render('<style>{!! \Illuminate\Support\Facades\File::get(resource_path("css/cafrezzo-admin.css")) !!}</style>')
            )
            // ── Inject animation JS ───────────────────────────────────────
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn () => Blade::render('<script>{!! \Illuminate\Support\Facades\File::get(resource_path("js/cafrezzo-admin.js")) !!}</script>')
            )
            // ── Demo login buttons (login page only) ──────────────────────
            ->renderHook(
                PanelsRenderHook::AUTH_LOGIN_FORM_AFTER,
                fn () => Blade::render('
                    <div class="mt-5 pt-5 border-t border-gray-100 dark:border-white/8">
                        <p class="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-center text-gray-400 dark:text-gray-600 mb-3">
                            Quick demo access
                        </p>
                        <div class="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                wire:click="demoLogin(\'admin@cafrezzo.com\', \'Admin@2024!\')"
                                wire:loading.attr="disabled"
                                class="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg
                                       border border-primary-200 dark:border-primary-800/50
                                       bg-primary-50/60 dark:bg-primary-900/15
                                       hover:bg-primary-100 dark:hover:bg-primary-900/30
                                       text-primary-700 dark:text-primary-400
                                       transition-all duration-200 hover:scale-[1.02]
                                       cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                                <span class="text-xs font-bold flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                    Super Admin
                                </span>
                                <span class="text-[0.7rem] opacity-60 font-mono leading-tight">admin@cafrezzo.com</span>
                            </button>
                            <button
                                type="button"
                                wire:click="demoLogin(\'manager@cafrezzo.com\', \'Manager@2024!\')"
                                wire:loading.attr="disabled"
                                class="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg
                                       border border-gray-200 dark:border-white/10
                                       bg-gray-50 dark:bg-white/[0.04]
                                       hover:bg-gray-100 dark:hover:bg-white/[0.07]
                                       text-gray-600 dark:text-gray-400
                                       transition-all duration-200 hover:scale-[1.02]
                                       cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
                                <span class="text-xs font-bold flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    Manager
                                </span>
                                <span class="text-[0.7rem] opacity-60 font-mono leading-tight">manager@cafrezzo.com</span>
                            </button>
                        </div>
                    </div>
                ')
            )
            // ── Locale switcher dropdown (topbar) — scales to any number of langs ──
            ->renderHook(
                PanelsRenderHook::TOPBAR_END,
                fn () => view('filament.partials.locale-switcher')
            );
    }
}
