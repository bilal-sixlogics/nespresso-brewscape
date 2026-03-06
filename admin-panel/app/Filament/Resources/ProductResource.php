<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Tabs::make('Product')->tabs([

                // ── Tab 1: General ──────────────────────────────────────
                Tab::make('General')->icon('heroicon-o-information-circle')->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Name (FR)')->required()->maxLength(255),
                        Forms\Components\TextInput::make('name_en')
                            ->label('Name (EN)')->maxLength(255),
                        Forms\Components\TextInput::make('name_part2')
                            ->label('Name Part 2 (FR)')->maxLength(255),
                        Forms\Components\TextInput::make('name_part2_en')
                            ->label('Name Part 2 (EN)')->maxLength(255),
                    ]),
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')->required()->unique(Product::class, 'slug', ignoreRecord: true)
                            ->helperText('Auto-generated from name if left blank'),
                        Forms\Components\Select::make('category_id')
                            ->label('Category')->relationship('category', 'name')
                            ->searchable()->preload()->createOptionForm([
                                Forms\Components\TextInput::make('name')->required(),
                                Forms\Components\TextInput::make('slug')->required(),
                            ]),
                    ]),
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\Select::make('brand_id')
                            ->label('Brand')->relationship('brand', 'name')
                            ->searchable()->preload()->nullable(),
                        Forms\Components\TextInput::make('price')
                            ->label('Price (€)')->numeric()->required()->prefix('€'),
                    ]),
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('original_price')
                            ->label('Original Price (€)')->numeric()->prefix('€')->nullable()
                            ->helperText('Leave blank if no discount'),
                        Forms\Components\TextInput::make('weight')
                            ->label('Weight')->maxLength(50)->placeholder('250g'),
                    ]),
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('tagline')
                            ->label('Tagline (FR)')->maxLength(255),
                        Forms\Components\TextInput::make('tagline_en')
                            ->label('Tagline (EN)')->maxLength(255),
                    ]),
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\Textarea::make('description')
                            ->label('Description (FR)')->rows(4),
                        Forms\Components\Textarea::make('description_en')
                            ->label('Description (EN)')->rows(4),
                    ]),
                    Forms\Components\Grid::make(3)->schema([
                        Forms\Components\TextInput::make('origin')
                            ->label('Origin')->maxLength(100),
                        Forms\Components\Select::make('roast_level')
                            ->label('Roast Level')
                            ->options(['light' => 'Light', 'medium' => 'Medium', 'dark' => 'Dark', 'espresso' => 'Espresso']),
                        Forms\Components\TextInput::make('processing_method')
                            ->label('Processing Method')->maxLength(100),
                    ]),
                    Forms\Components\Grid::make(3)->schema([
                        Forms\Components\TextInput::make('intensity')
                            ->label('Intensity (0–13)')->numeric()->minValue(0)->maxValue(13)->nullable(),
                        Forms\Components\TextInput::make('average_rating')
                            ->label('Avg. Rating (read-only)')->numeric()->disabled()->dehydrated(false),
                        Forms\Components\TextInput::make('review_count')
                            ->label('Review Count (read-only)')->numeric()->disabled()->dehydrated(false),
                    ]),
                    Forms\Components\Grid::make(4)->schema([
                        Forms\Components\Toggle::make('is_featured')->label('Featured')->inline(false),
                        Forms\Components\Toggle::make('is_new')->label('New')->inline(false),
                        Forms\Components\Toggle::make('in_stock')->label('In Stock')->inline(false)->default(true),
                        Forms\Components\Toggle::make('is_active')->label('Active')->inline(false)->default(true),
                    ]),
                ]),

                // ── Tab 2: Images ──────────────────────────────────────
                Tab::make('Images')->icon('heroicon-o-photo')->schema([
                    Forms\Components\Repeater::make('images')
                        ->relationship()
                        ->schema([
                            Forms\Components\FileUpload::make('path')
                                ->label('Image')->image()->imageEditor()
                                ->directory('products')->maxSize(5120)
                                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                ->required(),
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\Toggle::make('is_primary')->label('Primary Image'),
                                Forms\Components\TextInput::make('sort_order')->numeric()->default(0)->label('Sort Order'),
                            ]),
                        ])
                        ->columns(1)
                        ->addActionLabel('Add Image')
                        ->reorderable('sort_order')
                        ->collapsible(),
                ]),

                // ── Tab 3: Sale Units ──────────────────────────────────────
                Tab::make('Sale Units')->icon('heroicon-o-currency-euro')->schema([
                    Forms\Components\Repeater::make('saleUnits')
                        ->relationship()
                        ->schema([
                            Forms\Components\Section::make('Basic Info')->schema([
                                Forms\Components\Grid::make(3)->schema([
                                    Forms\Components\TextInput::make('sku_code')
                                        ->label('SKU Code')->required()
                                        ->unique('product_sale_units', 'sku_code', ignoreRecord: true),
                                    Forms\Components\TextInput::make('label')
                                        ->label('Label (FR)')->required()->placeholder('1 kg'),
                                    Forms\Components\TextInput::make('label_en')
                                        ->label('Label (EN)')->placeholder('1 kg'),
                                ]),
                                Forms\Components\Grid::make(3)->schema([
                                    Forms\Components\TextInput::make('price')
                                        ->label('Price (€)')->numeric()->required()->prefix('€'),
                                    Forms\Components\TextInput::make('original_price')
                                        ->label('Original Price (€)')->numeric()->prefix('€')->nullable(),
                                    Forms\Components\TextInput::make('quantity')
                                        ->label('Quantity')->numeric()->default(1)->required(),
                                ]),
                                Forms\Components\Grid::make(2)->schema([
                                    Forms\Components\Toggle::make('is_default')->label('Default Unit'),
                                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0)->label('Sort Order'),
                                ]),
                            ]),

                            Forms\Components\Section::make('Base Unit & Hierarchy')
                                ->description('Define the base unit (e.g. kg) and how many base units this sale unit contains. For bundle/set packs, select a parent unit.')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Grid::make(3)->schema([
                                        Forms\Components\TextInput::make('base_unit')
                                            ->label('Base Unit')->placeholder('kg, g, ml, pack')
                                            ->helperText('e.g. "kg" means this unit contains X kg'),
                                        Forms\Components\TextInput::make('base_quantity')
                                            ->label('Base Quantity')->numeric()->placeholder('1.0')
                                            ->helperText('How many base units (e.g. 10 for a 10kg pack)'),
                                        Forms\Components\TextInput::make('weight_kg')
                                            ->label('Gross Weight (kg)')->numeric()->placeholder('1.2')
                                            ->helperText('For shipping calculation'),
                                    ]),
                                    Forms\Components\Grid::make(2)->schema([
                                        Forms\Components\Select::make('parent_sale_unit_id')
                                            ->label('Parent Sale Unit (for bundles)')
                                            ->options(fn() => \App\Models\ProductSaleUnit::whereNull('parent_sale_unit_id')
                                                ->get()->pluck('label', 'id'))
                                            ->searchable()->nullable()
                                            ->helperText('e.g. select "Pack 10kg" then set bundle count to 6 for "Set of 6 packs"'),
                                        Forms\Components\TextInput::make('bundle_count')
                                            ->label('Bundle Count')->numeric()->nullable()
                                            ->helperText('How many of the parent unit are in this bundle (e.g. 6)'),
                                    ]),
                                ]),

                            Forms\Components\Section::make('Discounts')
                                ->description('Per-unit discount settings. Takes priority over product-level discount.')
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Grid::make(2)->schema([
                                        Forms\Components\TextInput::make('discount_percent')
                                            ->label('Discount %')->numeric()->suffix('%')->nullable()
                                            ->helperText('e.g. 10 = 10% off this unit'),
                                        Forms\Components\TextInput::make('discount_amount')
                                            ->label('Fixed Discount (€)')->numeric()->prefix('€')->nullable()
                                            ->helperText('Fixed euro amount off. Used instead of % if both set.'),
                                    ]),
                                    Forms\Components\Grid::make(2)->schema([
                                        Forms\Components\Toggle::make('inherit_product_discount')
                                            ->label('Inherit Product-Level Discount')->default(true)
                                            ->helperText('Uncheck to exclude this unit from any product-level sale'),
                                        Forms\Components\DateTimePicker::make('discount_expires_at')
                                            ->label('Discount Expires At')->nullable(),
                                    ]),
                                ]),
                        ])
                        ->columns(1)
                        ->addActionLabel('Add Sale Unit')
                        ->reorderable('sort_order')
                        ->collapsible()
                        ->defaultItems(1),
                ]),

                // ── Tab 4: Coffee Profile ──────────────────────────────
                Tab::make('Coffee Profile')->icon('heroicon-o-beaker')->schema([
                    Forms\Components\Section::make('Taste Profile (1–5)')->schema([
                        Forms\Components\Grid::make(5)->schema([
                            Forms\Components\TextInput::make('tasteProfile.bitterness')->label('Bitterness')->numeric()->minValue(1)->maxValue(5)->default(3),
                            Forms\Components\TextInput::make('tasteProfile.acidity')->label('Acidity')->numeric()->minValue(1)->maxValue(5)->default(3),
                            Forms\Components\TextInput::make('tasteProfile.roastiness')->label('Roastiness')->numeric()->minValue(1)->maxValue(5)->default(3),
                            Forms\Components\TextInput::make('tasteProfile.body')->label('Body')->numeric()->minValue(1)->maxValue(5)->default(3),
                            Forms\Components\TextInput::make('tasteProfile.sweetness')->label('Sweetness')->numeric()->minValue(1)->maxValue(5)->default(3),
                        ]),
                    ]),
                    Forms\Components\Section::make('Aromatic Notes')->schema([
                        Forms\Components\Repeater::make('notes')
                            ->relationship()
                            ->schema([
                                Forms\Components\TextInput::make('note_text')->label('Note')->required()->placeholder('Chocolate, Caramel…'),
                            ])
                            ->columns(1)
                            ->addActionLabel('Add Note')
                            ->simple(Forms\Components\TextInput::make('note_text')->required()),
                    ]),
                    Forms\Components\Section::make('Brew Sizes')->schema([
                        Forms\Components\CheckboxList::make('brewSizes')
                            ->relationship('brewSizes', 'brew_size')
                            ->options(['Espresso' => 'Espresso', 'Ristretto' => 'Ristretto', 'Lungo' => 'Lungo', 'Americano' => 'Americano', 'Cappuccino' => 'Cappuccino', 'Latte' => 'Latte'])
                            ->columns(3),
                    ]),
                    Forms\Components\Section::make('Allergens')->schema([
                        Forms\Components\Repeater::make('allergens')
                            ->relationship()
                            ->schema([
                                Forms\Components\Grid::make(2)->schema([
                                    Forms\Components\TextInput::make('allergen_text')->label('Allergen (FR)')->required(),
                                    Forms\Components\TextInput::make('allergen_text_en')->label('Allergen (EN)'),
                                ]),
                            ])
                            ->addActionLabel('Add Allergen')
                            ->collapsible(),
                    ]),
                ]),

                // ── Tab 5: Features (Accordion) ────────────────────────
                Tab::make('Features')->icon('heroicon-o-list-bullet')->schema([
                    Forms\Components\Repeater::make('features')
                        ->relationship()
                        ->schema([
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('title')->label('Section Title (FR)')->required(),
                                Forms\Components\TextInput::make('title_en')->label('Section Title (EN)'),
                            ]),
                            Forms\Components\Repeater::make('items')
                                ->relationship()
                                ->schema([
                                    Forms\Components\Grid::make(2)->schema([
                                        Forms\Components\TextInput::make('item_text')->label('Item (FR)')->required(),
                                        Forms\Components\TextInput::make('item_text_en')->label('Item (EN)'),
                                    ]),
                                ])
                                ->addActionLabel('Add Item')
                                ->reorderable('sort_order')
                                ->columns(1),
                        ])
                        ->addActionLabel('Add Feature Section')
                        ->reorderable('sort_order')
                        ->collapsible(),
                ]),

                // ── Tab 6: Tags ────────────────────────────────────────
                Tab::make('Tags')->icon('heroicon-o-tag')->schema([
                    Forms\Components\CheckboxList::make('tagValues')
                        ->label('Product Tags')
                        ->options([
                            'Best Seller'  => 'Best Seller',
                            'Nouveau'      => 'Nouveau / New',
                            'Eco'          => 'Eco',
                            'Vegan'        => 'Vegan',
                            'Bio'          => 'Bio',
                            'Limited'      => 'Limited Edition',
                            'Award Winner' => 'Award Winner',
                            'Staff Pick'   => 'Staff Pick',
                        ])
                        ->columns(3)
                        ->helperText('Tags are stored in product_tags table'),
                ]),

                // ── Tab 7: Inventory ───────────────────────────────────
                Tab::make('Inventory')->icon('heroicon-o-archive-box')->schema([
                    Forms\Components\Placeholder::make('inventory_note')
                        ->label('')
                        ->content('Inventory levels are managed per sale unit. Use the Inventory section in the sidebar for full stock management and history.'),
                ]),

                // ── Tab 8: Pricing & Tax ───────────────────────────────────
                Tab::make('Pricing & Tax')->icon('heroicon-o-calculator')->schema([
                    Forms\Components\Section::make('Product-Level Sale')->schema([
                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\Toggle::make('is_on_sale')
                                ->label('On Sale')->inline(false)
                                ->helperText('Applies sale_discount_percent to all units unless overridden'),
                            Forms\Components\TextInput::make('sale_discount_percent')
                                ->label('Sale Discount %')->numeric()->suffix('%')->nullable()
                                ->helperText('Applied to all sale units that have inherit_product_discount=true'),
                            Forms\Components\DateTimePicker::make('sale_ends_at')
                                ->label('Sale Ends At')->nullable(),
                        ]),
                    ]),
                    Forms\Components\Section::make('Tax Override')->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('tax_rate_override')
                                ->label('Tax Rate Override (%)')->numeric()->suffix('%')->nullable()
                                ->helperText('Leave blank to use global tax rate from settings'),
                            Forms\Components\Toggle::make('is_tax_exempt')
                                ->label('Tax Exempt')->inline(false)
                                ->helperText('If checked, no tax applied to this product regardless of global settings'),
                        ]),
                    ]),
                ]),

            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('images.path')
                    ->label('')->circular()->stacked()->limit(1)
                    ->getStateUsing(fn($record) => $record->images->where('is_primary', true)->first()?->path
                        ?? $record->images->first()?->path),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Category')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('brand.name')
                    ->label('Brand')->badge()->color('info'),
                Tables\Columns\TextColumn::make('price')
                    ->label('Price')->money('EUR')->sortable(),
                Tables\Columns\IconColumn::make('in_stock')
                    ->label('Stock')->boolean(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')->boolean(),
                Tables\Columns\TextColumn::make('average_rating')
                    ->label('Rating')->numeric(2)->sortable()
                    ->formatStateUsing(fn($state) => $state > 0 ? "⭐ $state" : '—'),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active')->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Updated')->since()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Category')->relationship('category', 'name'),
                Tables\Filters\SelectFilter::make('brand_id')
                    ->label('Brand')->relationship('brand', 'name'),
                Tables\Filters\TernaryFilter::make('is_featured')->label('Featured'),
                Tables\Filters\TernaryFilter::make('in_stock')->label('In Stock'),
                Tables\Filters\TernaryFilter::make('is_active')->label('Active'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label('Activate Selected')
                        ->icon('heroicon-o-check-circle')
                        ->action(fn($records) => $records->each->update(['is_active' => true])),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('Deactivate Selected')
                        ->icon('heroicon-o-x-circle')
                        ->action(fn($records) => $records->each->update(['is_active' => false])),
                ]),
            ])
            ->defaultSort('updated_at', 'desc')
            ->modifyQueryUsing(fn(Builder $query) => $query->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]));
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'view'   => Pages\ViewProduct::route('/{record}'),
            'edit'   => Pages\EditProduct::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->withTrashed();
    }
}
