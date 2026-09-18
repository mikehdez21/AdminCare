<?php

$defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:8000',
];

$allowedOriginsFromEnv = env('CORS_ALLOWED_ORIGINS');

$allowedOrigins = $allowedOriginsFromEnv
    ? array_values(array_filter(array_map('trim', explode(',', $allowedOriginsFromEnv))))
    : $defaultAllowedOrigins;

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
