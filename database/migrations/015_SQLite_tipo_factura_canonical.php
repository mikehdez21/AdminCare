<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Repair databases created with the original SQLite demo schema.
     *
     * The fresh-install schema is canonical already; this migration makes
     * existing demo databases safe to upgrade as well.
     */
    public function up(): void
    {
        if (! Schema::hasTable('tableRef_TiposFacturasAF')) {
            return;
        }

        if (Schema::hasColumn('tableRef_TiposFacturasAF', 'descripcion_tipofacturaaf')
            && ! Schema::hasColumn('tableRef_TiposFacturasAF', 'nombre_tipofactura')) {
            Schema::table('tableRef_TiposFacturasAF', function (Blueprint $table): void {
                $table->renameColumn('descripcion_tipofacturaaf', 'nombre_tipofactura');
            });
        }

        if (! Schema::hasColumn('tableRef_TiposFacturasAF', 'descripcion_tipofactura')) {
            Schema::table('tableRef_TiposFacturasAF', function (Blueprint $table): void {
                $table->string('descripcion_tipofactura', 255)->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tableRef_TiposFacturasAF')
            && Schema::hasColumn('tableRef_TiposFacturasAF', 'nombre_tipofactura')
            && ! Schema::hasColumn('tableRef_TiposFacturasAF', 'descripcion_tipofacturaaf')) {
            Schema::table('tableRef_TiposFacturasAF', function (Blueprint $table): void {
                $table->renameColumn('nombre_tipofactura', 'descripcion_tipofacturaaf');
            });
        }
    }
};
