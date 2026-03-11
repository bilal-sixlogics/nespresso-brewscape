<?php
namespace App\Filament\Resources;
use App\Models\BlogPost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\BlogPostResource\Pages;
use Illuminate\Support\Str;

class BlogPostResource extends Resource {
    protected static ?string $model = BlogPost::class;
    protected static ?string $navigationIcon = 'heroicon-o-newspaper';
    protected static ?string $navigationGroup = 'Content';
    protected static ?string $navigationLabel = 'Brew Journals';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Grid::make(3)->schema([
                Forms\Components\Group::make()->schema([
                    Forms\Components\Section::make('Content (FR)')->schema([
                        Forms\Components\TextInput::make('title')->required()
                            ->live(onBlur: true)->afterStateUpdated(fn($state, $set) => $set('slug', Str::slug($state))),
                        Forms\Components\Textarea::make('excerpt')->rows(3),
                        Forms\Components\RichEditor::make('body')->toolbarButtons([
                            'bold','italic','underline','strike','h2','h3','bulletList',
                            'orderedList','blockquote','codeBlock','link','undo','redo',
                        ])->label('Body (FR)'),
                    ]),
                    Forms\Components\Section::make('Content (EN)')->schema([
                        Forms\Components\TextInput::make('title_en')->label('Title (EN)'),
                        Forms\Components\Textarea::make('excerpt_en')->label('Excerpt (EN)')->rows(3),
                        Forms\Components\RichEditor::make('body_en')->toolbarButtons([
                            'bold','italic','underline','strike','h2','h3','bulletList',
                            'orderedList','blockquote','link','undo','redo',
                        ])->label('Body (EN)'),
                    ]),
                ])->columnSpan(2),
                Forms\Components\Group::make()->schema([
                    Forms\Components\Section::make('Settings')->schema([
                        Forms\Components\TextInput::make('slug')->required()
                            ->unique(BlogPost::class, 'slug', ignoreRecord: true),
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('category')->placeholder('Espresso'),
                            Forms\Components\TextInput::make('category_en'),
                        ]),
                        Forms\Components\TextInput::make('external_url')->url()->nullable()
                            ->label('External URL (optional)'),
                        Forms\Components\DateTimePicker::make('published_at'),
                        Forms\Components\Toggle::make('is_published')->label('Published'),
                        Forms\Components\FileUpload::make('image_path')
                            ->image()->imageEditor()->directory('blog')->maxSize(5120)->label('Cover Image'),
                    ]),
                ])->columnSpan(1),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ImageColumn::make('image_path')->label(''),
            Tables\Columns\TextColumn::make('title')->searchable()->sortable()->limit(50),
            Tables\Columns\TextColumn::make('category')->badge()->color('gray'),
            Tables\Columns\IconColumn::make('is_published')->label('Published')->boolean(),
            Tables\Columns\TextColumn::make('published_at')->label('Published At')->dateTime()->sortable(),
            Tables\Columns\TextColumn::make('updated_at')->since()->sortable(),
        ])
        ->filters([
            Tables\Filters\TernaryFilter::make('is_published'),
            Tables\Filters\TrashedFilter::make(),
        ])
        ->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
            Tables\Actions\RestoreAction::make(),
        ])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([
            Tables\Actions\DeleteBulkAction::make(),
            Tables\Actions\RestoreBulkAction::make(),
        ])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListBlogPosts::route('/'),
            'create' => Pages\CreateBlogPost::route('/create'),
            'edit'   => Pages\EditBlogPost::route('/{record}/edit'),
        ];
    }
}
