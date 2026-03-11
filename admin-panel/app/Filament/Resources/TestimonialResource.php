<?php
namespace App\Filament\Resources;
use App\Models\Testimonial;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\TestimonialResource\Pages;

class TestimonialResource extends Resource {
    protected static ?string $model = Testimonial::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('author_name')->required(),
                    Forms\Components\FileUpload::make('avatar_path')->label('Avatar')
                        ->image()->imageEditor()->directory('testimonials')->circular(),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('role')->placeholder('Coffee Enthusiast'),
                    Forms\Components\TextInput::make('role_en')->label('Role (EN)'),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\Textarea::make('review_text')->label('Review (FR)')->rows(4)->required(),
                    Forms\Components\Textarea::make('review_text_en')->label('Review (EN)')->rows(4),
                ]),
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\Select::make('rating')
                        ->options([1=>'★',2=>'★★',3=>'★★★',4=>'★★★★',5=>'★★★★★'])
                        ->default(5)->required(),
                    Forms\Components\Select::make('product_id')
                        ->label('Related Product')->relationship('product', 'name')->nullable()->searchable(),
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                ]),
                Forms\Components\Toggle::make('is_active')->default(true),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ImageColumn::make('avatar_path')->circular(),
            Tables\Columns\TextColumn::make('author_name')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('role')->searchable(),
            Tables\Columns\TextColumn::make('rating')
                ->formatStateUsing(fn($state) => str_repeat('★', (int) $state)),
            Tables\Columns\TextColumn::make('product.name')->label('Product')->badge()->color('gray'),
            Tables\Columns\TextColumn::make('review_text')->limit(60)->searchable(),
            Tables\Columns\ToggleColumn::make('is_active'),
            Tables\Columns\TextColumn::make('sort_order')->sortable(),
        ])
        ->reorderable('sort_order')
        ->filters([Tables\Filters\TernaryFilter::make('is_active')])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListTestimonials::route('/'),
            'create' => Pages\CreateTestimonial::route('/create'),
            'edit'   => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
