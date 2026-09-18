<?php

if (PHP_VERSION_ID < 80500) {
    exit(0);
}

$file = __DIR__ . '/../vendor/laravel/framework/config/database.php';

if (! file_exists($file)) {
    exit(0);
}

$contents = file_get_contents($file);

if (str_contains($contents, 'Pdo\\Mysql::ATTR_SSL_CA')) {
    exit(0);
}

$contents = str_replace(
    'PDO::MYSQL_ATTR_SSL_CA',
    '(PHP_VERSION_ID >= 80500 ? Pdo\\Mysql::ATTR_SSL_CA : PDO::MYSQL_ATTR_SSL_CA)',
    $contents,
);

file_put_contents($file, $contents);
