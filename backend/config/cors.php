<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    | Allowed origins for the REST API. In production, restrict to your exact
    | frontend domain (e.g. https://cafrezzo.com). Never use '*' in production.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',   // Next.js dev server
        'http://localhost:3001',
        env('FRONTEND_URL', 'https://cafrezzo.com'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
