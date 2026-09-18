<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('demo:seed-if-empty', function () {
    if (! config('app.demo_mode', false) || DB::getDriverName() !== 'sqlite') {
        $this->error('Demo seed aborted: DEMO_MODE=true and SQLite are both required.');

        return 1;
    }

    $tableExists = static fn (string $table): bool => DB::selectOne(
        "select 1 from sqlite_master where type = 'table' and name = ? limit 1",
        [$table],
    ) !== null;

    $requiredTables = [
        'tableUsuarios', 'tableDepartamentos', 'tableEmpleados', 'tableUbicaciones',
        'tableRef_FormasPago', 'tableRef_ClasificacionesAF', 'tableRef_DescuentoProveedor',
        'tableRef_TiposProveedor', 'tableRef_RegimenFiscales', 'tableRef_TiposFacturacion',
        'tableRef_TiposMovimientosAF', 'tableRef_TiposFacturasAF', 'tableRef_EstatusAF',
        'tableRef_TiposMonedas', 'tableRef_EstatusDepreciacionAF', 'tableRef_MetodosDepreciacion',
        'tableAF_Proveedores', 'tableAF_Facturas', 'tableAF_ActivosFijos',
        'tableInter_FacturaActivos', 'tableAF_MovimientosActivos', 'tableAF_DepreciacionActivo',
    ];

    $requiredData = [...$requiredTables, 'roles', 'permissions', 'model_has_roles', 'role_has_permissions'];

    $hasDemoMarker = false;
    if ($tableExists('demo_database_marker')) {
        try {
            $hasDemoMarker = DB::table('demo_database_marker')
                ->where('id', 1)
                ->where('marker', 'admincare-demo-v1')
                ->exists();
        } catch (Throwable) {
            $hasDemoMarker = false;
        }
    }

    // This signature supports databases seeded before the persistent marker was
    // introduced. It requires several synthetic values, not just SQLite.
    $hasLegacyDemoSignature = $tableExists('tableUsuarios')
        && $tableExists('tableAF_Proveedores')
        && $tableExists('tableAF_ActivosFijos')
        && DB::table('tableUsuarios')->where('email_usuario', 'demo.admin@example.invalid')->exists()
        && DB::table('tableAF_Proveedores')->where('rfc', 'DEMO000000XXX')->exists()
        && DB::table('tableAF_ActivosFijos')->where('codigo_unico', 'DEMO-AF-001')->exists();

    $isKnownDemo = $hasDemoMarker || $hasLegacyDemoSignature;

    $missingTables = collect($requiredTables)
        ->reject($tableExists)
        ->values();
    $missingData = collect($requiredData)
        ->filter(fn (string $table): bool => $tableExists($table) && DB::table($table)->count() === 0)
        ->values();

    if ($missingTables->isEmpty() && $missingData->isEmpty() && $isKnownDemo) {
        if ($hasLegacyDemoSignature && ! $hasDemoMarker) {
            if ($tableExists('demo_database_marker')) {
                DB::table('demo_database_marker')->updateOrInsert(
                    ['id' => 1],
                    ['marker' => 'admincare-demo-v1', 'updated_at' => now()],
                );
            }
        }

        $this->info('Demo database contains the complete base dataset; seed skipped.');

        return 0;
    }

    if (! $isKnownDemo && ! config('app.demo_database_allow_reset', false)) {
        $this->error(
            'Demo seed aborted: the database is not identified as AdminCare demo. '
            .'Set DEMO_DATABASE_ALLOW_RESET=true only for the intended empty demo database, '
            .'then run the command again.'
        );

        return 1;
    }

    $this->warn('Incomplete demo dataset detected; rebuilding the synthetic base dataset.');
    $this->call('migrate:fresh', ['--seed' => true, '--force' => true]);

    return 0;
})->purpose('Ensure the complete demo dataset exists without resetting non-demo databases.');
