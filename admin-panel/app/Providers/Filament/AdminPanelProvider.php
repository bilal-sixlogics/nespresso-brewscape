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
            ->login()
            ->passwordReset()
            ->profile(\App\Filament\Pages\EditProfile::class)
            ->darkMode(true)
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
                Widgets\AccountWidget::class,
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
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn () => Blade::render('<style>{!! \Illuminate\Support\Facades\File::get(resource_path("css/cafrezzo-admin.css")) !!}</style>')
            )
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn () => Blade::render('<script>{!! \Illuminate\Support\Facades\File::get(resource_path("js/cafrezzo-admin.js")) !!}</script>')
            )
            ->renderHook(
                PanelsRenderHook::TOPBAR_END,
                fn () => Blade::render('
                    <div class="flex items-center gap-1 mr-2">
                        @foreach([["fr","🇫🇷"],["en","🇬🇧"],["de","🇩🇪"],["ru","🇷🇺"],["nl","🇳🇱"]] as [$code,$flag])
                            <a href="?lang={{ $code }}"
                               class="text-base leading-none px-1 py-0.5 rounded transition hover:bg-gray-100 dark:hover:bg-gray-700
                                      {{ app()->getLocale() === $code ? "ring-1 ring-primary-500 bg-primary-50 dark:bg-primary-900/30" : "" }}"
                               title="{{ $code }}">{{ $flag }}</a>
                        @endforeach
                    </div>
                ')
            );
    }
}
