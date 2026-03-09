<?php
namespace App\Filament\Pages;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Notifications\Notification;
use App\Models\Setting;
use App\Models\CheckoutSetting;
use App\Models\ContactInfo;
use Illuminate\Support\Facades\Gate;

class ManageSettings extends Page
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Site Settings';
    protected static ?int $navigationSort = 10;
    protected static string $view = 'filament.pages.manage-settings';

    public static function canAccess(): bool
    {
        return Gate::allows('access-settings');
    }

    public array $data = [];

    public function mount(): void
    {
        $keys = [
            'brand_name', 'tagline', 'google_analytics_id', 'maintenance_mode',
            'sitewide_discount_enabled', 'sitewide_discount_percent', 'sitewide_discount_label',
            'free_shipping_enabled', 'free_shipping_threshold', 'free_shipping_label',
            'promo_banner_enabled', 'promo_banner_text',
            // Color scheme
            'color_primary', 'color_secondary', 'color_accent', 'color_text', 'color_background',
            // Checkout
            'checkout_guest_checkout', 'checkout_require_phone', 'checkout_order_prefix',
            // Tax
            'tax_enabled', 'tax_mode', 'tax_rate', 'tax_label', 'tax_label_en', 'tax_inclusive',
        ];
        foreach ($keys as $key) {
            $this->data[$key] = Setting::getValue($key, $this->defaults()[$key] ?? '');
        }
        $this->form->fill($this->data);
    }

    private function defaults(): array
    {
        return [
            'brand_name' => 'Cafrezzo',
            'color_primary' => '#3C7A58',
            'color_secondary' => '#111111',
            'color_accent' => '#F5F0E8',
            'color_text' => '#111111',
            'color_background' => '#FFFFFF',
            'checkout_order_prefix' => 'CAF',
            'free_shipping_threshold' => '50',
            'sitewide_discount_percent' => '0',
            'tax_mode' => 'cart_total',
            'tax_rate' => '0',
            'tax_label' => 'TVA',
            'tax_label_en' => 'VAT',
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Settings')->tabs([

                Forms\Components\Tabs\Tab::make('Brand')->icon('heroicon-o-identification')->schema([
                    Forms\Components\TextInput::make('brand_name')->required(),
                    Forms\Components\TextInput::make('tagline'),
                    Forms\Components\TextInput::make('google_analytics_id')->label('Google Analytics ID')->placeholder('G-XXXXXXXX'),
                    Forms\Components\Toggle::make('maintenance_mode')->label('Maintenance Mode'),
                ]),

                Forms\Components\Tabs\Tab::make('Color Scheme')->icon('heroicon-o-swatch')->schema([
                    Forms\Components\Section::make('Website Color Palette')
                        ->description('These colors control the live website appearance. Changes take effect immediately.')
                        ->schema([
                            Forms\Components\Grid::make(5)->schema([
                                Forms\Components\ColorPicker::make('color_primary')->label('Primary (sb-green)'),
                                Forms\Components\ColorPicker::make('color_secondary')->label('Secondary (sb-black)'),
                                Forms\Components\ColorPicker::make('color_accent')->label('Accent (cream)'),
                                Forms\Components\ColorPicker::make('color_text')->label('Body Text'),
                                Forms\Components\ColorPicker::make('color_background')->label('Background'),
                            ]),
                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('reset_colors')
                                    ->label('Reset to Defaults')
                                    ->icon('heroicon-o-arrow-path')
                                    ->color('warning')
                                    ->action(fn() => $this->resetColors()),
                            ]),
                        ]),
                ]),

                Forms\Components\Tabs\Tab::make('Promotions')->icon('heroicon-o-tag')->schema([
                    Forms\Components\Section::make('Sitewide Discount')->schema([
                        Forms\Components\Toggle::make('sitewide_discount_enabled')->label('Enable Sitewide Discount'),
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('sitewide_discount_percent')->numeric()->suffix('%')->label('Discount %'),
                            Forms\Components\TextInput::make('sitewide_discount_label')->label('Banner Label (FR)'),
                        ]),
                    ]),
                    Forms\Components\Section::make('Free Shipping')->schema([
                        Forms\Components\Toggle::make('free_shipping_enabled')->label('Enable Free Shipping Promo'),
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('free_shipping_threshold')->numeric()->prefix('€')->label('Free above'),
                            Forms\Components\TextInput::make('free_shipping_label')->label('Label'),
                        ]),
                    ]),
                    Forms\Components\Section::make('Promo Banner')->schema([
                        Forms\Components\Toggle::make('promo_banner_enabled')->label('Show Promo Banner'),
                        Forms\Components\TextInput::make('promo_banner_text')->label('Banner Text'),
                    ]),
                ]),

                Forms\Components\Tabs\Tab::make('Checkout')->icon('heroicon-o-shopping-cart')->schema([
                    Forms\Components\Toggle::make('checkout_guest_checkout')->label('Allow Guest Checkout'),
                    Forms\Components\Toggle::make('checkout_require_phone')->label('Require Phone Number'),
                    Forms\Components\TextInput::make('checkout_order_prefix')->label('Order Number Prefix'),
                ]),

                Forms\Components\Tabs\Tab::make('Tax')->icon('heroicon-o-calculator')->schema([
                    Forms\Components\Section::make('Tax Configuration')->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Toggle::make('tax_enabled')
                                ->label('Enable Tax')
                                ->helperText('Enable tax calculation at checkout'),
                            Forms\Components\Toggle::make('tax_inclusive')
                                ->label('Prices Include Tax')
                                ->helperText('If enabled, listed prices already include tax (tax-inclusive pricing)'),
                        ]),
                        Forms\Components\Select::make('tax_mode')
                            ->label('Tax Mode')
                            ->options([
                                'cart_total'  => 'Apply tax to entire cart total',
                                'per_product' => 'Apply tax per product',
                            ])
                            ->helperText('Determines how tax is calculated at checkout'),
                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\TextInput::make('tax_rate')
                                ->label('Tax Rate (%)')->numeric()->suffix('%')
                                ->helperText('Global tax rate, e.g. 21 for 21%'),
                            Forms\Components\TextInput::make('tax_label')
                                ->label('Tax Label (FR)')->placeholder('TVA 21%')
                                ->helperText('Displayed on invoices and checkout (French)'),
                            Forms\Components\TextInput::make('tax_label_en')
                                ->label('Tax Label (EN)')->placeholder('VAT 21%')
                                ->helperText('Displayed on invoices and checkout (English)'),
                        ]),
                    ]),
                ]),

            ])->columnSpanFull(),
        ])->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        foreach ($data as $key => $value) {
            Setting::setValue($key, $value);
        }
        Notification::make()->title('Settings saved successfully!')->success()->send();
    }

    public function resetColors(): void
    {
        $defaults = [
            'color_primary'    => '#3C7A58',
            'color_secondary'  => '#111111',
            'color_accent'     => '#F5F0E8',
            'color_text'       => '#111111',
            'color_background' => '#FFFFFF',
        ];
        foreach ($defaults as $key => $value) {
            Setting::setValue($key, $value);
            $this->data[$key] = $value;
        }
        $this->form->fill($this->data);
        Notification::make()->title('Colors reset to defaults!')->warning()->send();
    }
}
