<?php
namespace App\Filament\Resources;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\CategoryResource\Pages;
use Illuminate\Support\Str;

class CategoryResource extends Resource {
    protected static ?string $model = Category::class;
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('name')->required()->maxLength(100)
                        ->live(onBlur: true)->afterStateUpdated(fn($s, $set) => $set('slug', Str::slug($s))),
                    Forms\Components\TextInput::make('name_en')->label('Name (EN)')->maxLength(100),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('slug')->required()->unique(Category::class, 'slug', ignoreRecord: true),
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\Textarea::make('description')->label('Description (FR)')->rows(3),
                    Forms\Components\Textarea::make('description_en')->label('Description (EN)')->rows(3),
                ]),
                Forms\Components\FileUpload::make('image_path')->label('Category Image')
                    ->image()->imageEditor()->directory('categories')->maxSize(2048),
                Forms\Components\Toggle::make('is_active')->default(true),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ImageColumn::make('image_path')->label('')->circular(),
            Tables\Columns\TextColumn::make('name')->searchable()->sortable()->weight('bold'),
            Tables\Columns\TextColumn::make('name_en')->label('EN Name')->searchable(),
            Tables\Columns\TextColumn::make('products_count')->label('Products')
                ->counts('products')->badge()->color('gray'),
            Tables\Columns\TextColumn::make('sort_order')->sortable(),
            Tables\Columns\ToggleColumn::make('is_active')->label('Active'),
            Tables\Columns\TextColumn::make('updated_at')->since()->sortable(),
        ])
        ->reorderable('sort_order')
        ->filters([Tables\Filters\TernaryFilter::make('is_active')])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'edit'   => Pages\EditCategory::route('/{record}/edit'),
        ];
    }
}
