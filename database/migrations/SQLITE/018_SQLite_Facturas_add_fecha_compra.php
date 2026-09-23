<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Portable equivalent of the PostgreSQL migration 042 for SQLite.
     *
     * The fresh-install schema (012) already declares fecha_fac_compra and its
     * index. This repair migration upgrades existing demo databases safely:
     * it adds the column/index only when missing and backfills NULL values with
     * the date part of fecha_fac_recepcion (SQLite date() is the equivalent of
     * PostgreSQL's timestamp::date cast).
     */
    public function up(): void
    {
        if (! Schema::hasTable('tableAF_Facturas')) {
            return;
        }

        if (! Schema::hasColumn('tableAF_Facturas', 'fecha_fac_compra')) {
            Schema::table('tableAF_Facturas', function (Blueprint $table) {
                $table->date('fecha_fac_compra')->nullable();
                $table->index('fecha_fac_compra', 'idx_fecha_fac_compra');
            });
        }

        // Backfill: las facturas registradas antes del campo toman su fecha de
        // recepción como fecha de compra inicial. Idempotente vía whereNull.
        DB::table('tableAF_Facturas')
            ->whereNull('fecha_fac_compra')
            ->update(['fecha_fac_compra' => DB::raw('date(fecha_fac_recepcion)')]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('tableAF_Facturas')) {
            return;
        }

        if (Schema::hasIndex('tableAF_Facturas', 'idx_fecha_fac_compra')) {
            Schema::table('tableAF_Facturas', function (Blueprint $table) {
                $table->dropIndex('idx_fecha_fac_compra');
            });
        }

        if (Schema::hasColumn('tableAF_Facturas', 'fecha_fac_compra')) {
            Schema::table('tableAF_Facturas', function (Blueprint $table) {
                $table->dropColumn('fecha_fac_compra');
            });
        }
    }
};