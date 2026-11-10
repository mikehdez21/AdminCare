<?php

use App\Support\SchemaTable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Limpia los proveedores y sistemas de ejemplo que sembraba la migración 062.
 *
 * La 062 ya no los inserta en bases nuevas; esta limpieza cubre las bases demo
 * que se migraron antes. Solo borra las filas sin tickets asociados para no
 * romper el histórico si alguien ya capturó un error de proveedor.
 *
 * Es idempotente: si no hay datos de ejemplo, no hace nada.
 */
return new class extends Migration
{
    private const PROVEEDORES = ['Reliv', 'Vayver', 'Eden', 'HSS'];

    public function up(): void
    {
        $proveedores = SchemaTable::helpdesk('tableMA_ProveedoresError');
        $sistemas = SchemaTable::helpdesk('tableMA_SistemasProveedor');
        $errores = SchemaTable::helpdesk('tableMA_ErroresProveedor');

        if (! Schema::hasTable($proveedores) || ! Schema::hasTable($sistemas) || ! Schema::hasTable($errores)) {
            return;
        }

        DB::transaction(function () use ($proveedores, $sistemas, $errores): void {
            $sinUso = DB::table($proveedores)
                ->whereIn('nombre_proveedor_error', self::PROVEEDORES)
                ->whereNotExists(function ($query) use ($errores, $proveedores) {
                    $query->select(DB::raw(1))
                        ->from($errores)
                        ->where(function ($relacion) use ($errores, $proveedores) {
                            $relacion->whereColumn($errores.'.id_proveedor_error', $proveedores.'.id_proveedor_error')
                                ->orWhereColumn($errores.'.id_soluciona_error', $proveedores.'.id_proveedor_error');
                        });
                })
                ->pluck('id_proveedor_error');

            if ($sinUso->isEmpty()) {
                return;
            }

            $sistemasSinUso = DB::table($sistemas)
                ->whereIn('id_proveedor_error', $sinUso)
                ->whereNotExists(function ($query) use ($errores, $sistemas) {
                    $query->select(DB::raw(1))
                        ->from($errores)
                        ->whereColumn($errores.'.id_sistema', $sistemas.'.id_sistema_proveedor');
                })
                ->pluck('id_sistema_proveedor');

            DB::table($sistemas)->whereIn('id_sistema_proveedor', $sistemasSinUso)->delete();
            DB::table($proveedores)->whereIn('id_proveedor_error', $sinUso)->delete();
        });
    }

    public function down(): void
    {
        // No se restauran datos de ejemplo.
    }
};
