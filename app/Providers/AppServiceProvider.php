<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;
use Illuminate\Database\Migrations\Migrator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        date_default_timezone_set('America/Mexico_City');

        if (config('database.default') === 'sqlite' && ! extension_loaded('pdo_sqlite')) {
            throw new \RuntimeException('SQLite demo requires the PHP pdo_sqlite extension. sqlite3 alone is insufficient.');
        }

        if (config('database.default') === 'sqlite') {
            $database = config('database.connections.sqlite.database');
            if (is_string($database) && $database !== ':memory:' && ! file_exists($database)) {
                $databasePath = $this->resolveDatabasePath($database);
                $directory = dirname($databasePath);
                if (! is_dir($directory) || ! is_writable($directory) || ! touch($databasePath)) {
                    throw new \RuntimeException('SQLite demo database path is not writable: '.$databasePath);
                }
            }
        }

        // database/migrations/SQLITE is the canonical portable migration path
        // of the demo, so plain php artisan migrate discovers it automatically.
        if (config('database.default') === 'sqlite') {
            $this->callAfterResolving('migrator', function (Migrator $migrator): void {
                $migrator->path(database_path('migrations/SQLITE'));
            });

            // Defensive skip list: 008 (legacy PostgreSQL table) still lives in
            // the migrations root, and the historical almacengeneral/logs
            // subdirectories target PostgreSQL schemas. They are not part of
            // the portable SQLite build.
            $legacy = [database_path('migrations/008_BD_principal_Ubicaciones_table.php')];
            $legacy = array_merge($legacy, glob(database_path('migrations/almacengeneral/*.php')) ?: []);
            $legacy = array_merge($legacy, glob(database_path('migrations/logs/*.php')) ?: []);
            Migrator::withoutMigrations(array_map(
                static fn (string $path): string => pathinfo($path, PATHINFO_FILENAME),
                $legacy
            ));
        }

        $buildDirectory = config('app.asset_build_dir');

        if (!is_string($buildDirectory) || $buildDirectory === '') {
            if (file_exists(public_path('build-pruebas/manifest.json'))) {
                $buildDirectory = 'build-pruebas';
            } elseif (file_exists(public_path('build-produccion/manifest.json'))) {
                $buildDirectory = 'build-produccion';
            } else {
                $buildDirectory = 'build';
            }
        }

        Vite::useBuildDirectory($buildDirectory);
    }

    private function resolveDatabasePath(string $database): string
    {
        if (preg_match('/^(?:[A-Za-z]:[\\\\\/]|[\\\\\/])/', $database)) {
            return $database;
        }

        return base_path($database);
    }
}
