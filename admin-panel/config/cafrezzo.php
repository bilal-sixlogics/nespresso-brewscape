<?php

/**
 * Cafrezzo admin panel configuration.
 * Centralised config — add/remove locales here and the UI adapts automatically.
 */
return [

    /*
    |--------------------------------------------------------------------------
    | Supported Locales
    |--------------------------------------------------------------------------
    | Each entry: 'code' => ['flag' => emoji, 'label' => native name]
    | Add as many as needed — the locale switcher renders them in a dropdown,
    | so there is no UI overflow regardless of how many languages you support.
    */
    'locales' => [
        'fr' => ['flag' => '🇫🇷', 'label' => 'Français'],
        'en' => ['flag' => '🇬🇧', 'label' => 'English'],
        'de' => ['flag' => '🇩🇪', 'label' => 'Deutsch'],
        'ru' => ['flag' => '🇷🇺', 'label' => 'Русский'],
        'nl' => ['flag' => '🇳🇱', 'label' => 'Nederlands'],
    ],

];
