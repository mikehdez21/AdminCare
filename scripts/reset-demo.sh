#!/bin/sh
set -eu

# The reset must prove that this is the intended synthetic database before
# allowing migrate:fresh to run.
php artisan tinker --execute='
$tableExists = static fn (string $table): bool => DB::selectOne(
    "select 1 from sqlite_master where type = \"table\" and name = ? limit 1",
    [$table],
) !== null;

if (config("app.demo_mode", false) !== true
    || config("database.default") !== "sqlite"
    || DB::getDriverName() !== "sqlite") {
    fwrite(STDERR, "Refusing destructive demo reset: DEMO_MODE=true and SQLite are required.\n");
    exit(1);
}

if (config("app.demo_database_allow_reset", false) !== true) {
    fwrite(STDERR, "Refusing destructive demo reset: set DEMO_DATABASE_ALLOW_RESET=true explicitly.\n");
    exit(1);
}

$hasDemoMarker = $tableExists("demo_database_marker")
    && DB::table("demo_database_marker")
        ->where("id", 1)
        ->where("marker", "admincare-demo-v1")
        ->exists();

$hasLegacyDemoSignature = $tableExists("tableUsuarios")
    && $tableExists("tableAF_Proveedores")
    && $tableExists("tableAF_ActivosFijos")
    && DB::table("tableUsuarios")->where("email_usuario", "demo.admin@example.invalid")->exists()
    && DB::table("tableAF_Proveedores")->where("rfc", "DEMO000000XXX")->exists()
    && DB::table("tableAF_ActivosFijos")->where("codigo_unico", "DEMO-AF-001")->exists();

if (!$hasDemoMarker && !$hasLegacyDemoSignature) {
    fwrite(STDERR, "Refusing destructive demo reset: database marker or legacy demo signature not found.\n");
    exit(1);
}'

php artisan migrate:fresh --seed --force
