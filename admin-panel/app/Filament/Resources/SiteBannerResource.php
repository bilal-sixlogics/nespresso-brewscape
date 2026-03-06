<?php
namespace App\Filament\Resources;
use App\Models\SiteBanner;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\SiteBannerResource\Pages;

class SiteBannerResource extends Resource {
    protected static ?string $model = SiteBanner::class;
    protected static ?string $navigationIcon = 'heroicon-o-megaphone';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Site Banners';

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('message')->required()->label('Message (FR)'),
                    Forms\Components\TextInput::make('message_en')->label('Message (EN)'),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('cta_label')->label('CTA Label (FR)'),
                    Forms\Components\TextInput::make('cta_label_en')->label('CTA Label (EN)'),
                ]),
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('cta_url')->url()->label('CTA URL'),
                    Forms\Components\ColorPicker::make('bg_color')->label('Background Color')->default('#3C7A58'),
                    Forms\Components\ColorPicker::make('text_color')->label('Text Color')->default('#FFFFFF'),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                    Forms\Components\Toggle::make('is_active')->default(true),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ColorColumn::make('bg_color')->label('Color'),
            Tables\Columns\TextColumn::make('message')->searchable()->limit(60),
            Tables\Columns\TextColumn::make('cta_label')->label('CTA'),
            Tables\Columns\ToggleColumn::make('is_active'),
            Tables\Columns\TextColumn::make('sort_order')->sortable(),
        ])
        ->reorderable('sort_order')
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListSiteBanners::route('/'),
            'create' => Pages\CreateSiteBanner::route('/create'),
            'edit'   => Pages\EditSiteBanner::route('/{record}/edit'),
        ];
    }
}
