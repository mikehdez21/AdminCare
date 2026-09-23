<?php

declare(strict_types=1);

$databaseDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'database';
$databaseFile = $databaseDirectory . DIRECTORY_SEPARATOR . 'admincare-demo.db';

if (!is_dir($databaseDirectory) && !mkdir($databaseDirectory, 0775, true) && !is_dir($databaseDirectory)) {
    fwrite(STDERR, "Unable to create the database directory: {$databaseDirectory}" . PHP_EOL);
    exit(1);
}

if (file_exists($databaseFile)) {
    fwrite(STDOUT, "SQLite database already exists: {$databaseFile}" . PHP_EOL);
    exit(0);
}

$handle = fopen($databaseFile, 'x');
if ($handle === false) {
    fwrite(STDERR, "Unable to create the SQLite database: {$databaseFile}" . PHP_EOL);
    exit(1);
}

fclose($handle);
fwrite(STDOUT, "Created empty SQLite database: {$databaseFile}" . PHP_EOL);
