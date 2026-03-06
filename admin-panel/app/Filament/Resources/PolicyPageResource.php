<?php
namespace App\Filament\Resources;

use App\Filament\Resources\PolicyPageResource\Pages;
use App\Models\PolicyPage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PolicyPageResource extends Resource
{
    protected static ?string $model = PolicyPage::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 12;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('policy_page_tabs')
                ->tabs([
                    Forms\Components\Tabs\Tab::make('FR')
                        ->schema([
                            Forms\Components\TextInput::make('title_fr')
                                ->label('Title (FR)')
                                ->required()
                                ->maxLength(255),
                            Forms\Components\RichEditor::make('content_fr')
                                ->label('Content (FR)')
                                ->toolbarButtons([
                                    'attachFiles',
                                    'bold',
                                    'bulletList',
                                    'codeBlock',
                                    'h2',
                                    'h3',
                                    'italic',
                                    'link',
                                    'orderedList',
                                    'redo',
                                    'strike',
                                    'underline',
                                    'undo',
                                    'blockquote',
                                ])
                                ->columnSpanFull(),
                        ]),
                    Forms\Components\Tabs\Tab::make('EN')
                        ->schema([
                            Forms\Components\TextInput::make('title_en')
                                ->label('Title (EN)')
                                ->maxLength(255),
                            Forms\Components\RichEditor::make('content_en')
                                ->label('Content (EN)')
                                ->toolbarButtons([
                                    'attachFiles',
                                    'bold',
                                    'bulletList',
                                    'codeBlock',
                                    'h2',
                                    'h3',
                                    'italic',
                                    'link',
                                    'orderedList',
                                    'redo',
                                    'strike',
                                    'underline',
                                    'undo',
                                    'blockquote',
                                ])
                                ->columnSpanFull(),
                        ]),
                    Forms\Components\Tabs\Tab::make('Info')
                        ->schema([
                            Forms\Components\TextInput::make('key')
                                ->label('Page Key')
                                ->disabled()
                                ->dehydrated(false),
                            Forms\Components\DateTimePicker::make('last_updated_at')
                                ->label('Last Updated At')
                                ->default(now()),
                        ]),
                ])
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->badge()
                    ->color('gray')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('title_fr')
                    ->label('Title (FR)')
                    ->searchable()
                    ->limit(60),
                Tables\Columns\TextColumn::make('last_updated_at')
                    ->label('Last Updated')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Modified')
                    ->since()
                    ->sortable(),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPolicyPages::route('/'),
            'edit'  => Pages\EditPolicyPage::route('/{record}/edit'),
        ];
    }
}
