<?php
namespace App\Filament\Resources;
use App\Models\FooterSection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\FooterSectionResource\Pages;

class FooterSectionResource extends Resource {
    protected static ?string $model = FooterSection::class;
    protected static ?string $navigationIcon = 'heroicon-o-bars-4';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Footer';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make('Section')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('title')->required(),
                    Forms\Components\TextInput::make('title_en')->label('Title (EN)'),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                    Forms\Components\Toggle::make('is_active')->default(true),
                ]),
            ]),
            Forms\Components\Section::make('Links')->schema([
                Forms\Components\Repeater::make('links')
                    ->relationship()
                    ->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('label')->required(),
                            Forms\Components\TextInput::make('label_en'),
                        ]),
                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\TextInput::make('url')->required()->url(),
                            Forms\Components\Toggle::make('is_external'),
                            Forms\Components\Toggle::make('is_active')->default(true),
                        ]),
                    ])
                    ->addActionLabel('Add Link')
                    ->reorderable('sort_order')
                    ->collapsible(),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('title')->sortable(),
            Tables\Columns\TextColumn::make('links_count')->label('Links')->counts('links')->badge(),
            Tables\Columns\ToggleColumn::make('is_active'),
            Tables\Columns\TextColumn::make('sort_order')->sortable(),
        ])
        ->reorderable('sort_order')
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListFooterSections::route('/'),
            'create' => Pages\CreateFooterSection::route('/create'),
            'edit'   => Pages\EditFooterSection::route('/{record}/edit'),
        ];
    }
}
