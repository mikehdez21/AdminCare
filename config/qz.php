<?php

return [
    'certificate_path' => env('QZ_CERTIFICATE_PATH', storage_path('app/qz/digital-certificate.txt')),
    'private_key_path' => env('QZ_PRIVATE_KEY_PATH', storage_path('app/qz/private-key.pem')),
    'private_key_passphrase' => env('QZ_PRIVATE_KEY_PASSPHRASE', null),
    'signature_algorithm' => env('QZ_SIGNATURE_ALGORITHM', 'SHA512'),
];
