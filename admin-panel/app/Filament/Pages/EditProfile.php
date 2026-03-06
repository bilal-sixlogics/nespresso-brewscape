<?php

namespace App\Filament\Pages;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Pages\Auth\EditProfile as BaseEditProfile;

class EditProfile extends BaseEditProfile
{
    public function form(Form $form): Form
    {
        return $form
            ->schema([
                $this->getNameFormComponent(),
                $this->getEmailFormComponent(),

                Select::make('locale')
                    ->label('Interface Language')
                    ->options([
                        'fr' => '🇫🇷 Français',
                        'en' => '🇬🇧 English',
                        'de' => '🇩🇪 Deutsch',
                        'ru' => '🇷🇺 Русский',
                        'nl' => '🇳🇱 Nederlands',
                    ])
                    ->required()
                    ->live()
                    ->helperText('The admin panel will use this language on your next page load.'),

                TextInput::make('phone')
                    ->label('Phone')
                    ->tel(),

                FileUpload::make('avatar_path')
                    ->label('Profile Photo')
                    ->image()
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('1:1')
                    ->imageResizeTargetWidth('200')
                    ->imageResizeTargetHeight('200')
                    ->disk('public')
                    ->directory('avatars')
                    ->maxSize(2048),

                $this->getPasswordFormComponent(),
                $this->getPasswordConfirmationFormComponent(),
            ]);
    }
}
