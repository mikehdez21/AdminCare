<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(
            <<<'SQL'
        CREATE OR REPLACE VIEW almacengeneral.vw_movimientosafcompletos AS 
        SELECT af.id_activo_fijo,
            af.codigo_unico,
            af.nombre_af,
            af.descripcion_af,
            af.modelo_af,
            af.marca_af,
            af.numero_serie_af,
            af.valor_compra_af,
            af.fecha_compra_af,
            af.fecha_registro_af,
            af.af_propio,
            af.observaciones_af,
            est.descripcion_estatusaf AS estado_actual,
            clas.nombre_clasificacion AS clasificacion,
            concat(emp_anterior.nombre_empleado, ' ', emp_anterior.apellido_paterno, ' ', emp_anterior.apellido_materno) AS responsable_anterior_completo,
            concat(emp_actual.nombre_empleado, ' ', emp_actual.apellido_paterno, ' ', emp_actual.apellido_materno) AS responsable_actual_completo,
            dep_actual.nombre_departamento AS departamento_actual,
            ub_anterior.nombre_ubicacion  AS ubicacion_anterior,
            ub_actual.nombre_ubicacion  AS ubicacion_actual,
            mov_actual.fecha_movimiento AS fecha_ultimo_movimiento,
            mov_actual.motivo_movimiento AS ultimo_motivo_movimiento,
            tipmov.nombre_tipomovimientoaf  AS tipo_movimiento
        FROM almacengeneral."tableAF_ActivosFijos" af
        LEFT JOIN almacengeneral."tableRef_EstatusAF" est ON af.id_estado_af = est.id_estatusaf
        LEFT JOIN almacengeneral."tableRef_ClasificacionesAF" clas ON af.id_clasificacion = clas.id_clasificacion
        LEFT JOIN LATERAL ( SELECT mov."id_movimientoAF",
                mov.id_activo_fijo,
                mov.id_tipo_movimiento,
                mov.motivo_movimiento,
                mov.fecha_movimiento,
                mov.id_responsable_anterior,
                mov.id_responsable_actual,
                mov.id_ubicacion_anterior,
                mov.id_ubicacion_actual,
                mov.created_at,
                mov.updated_at
            FROM almacengeneral."tableAF_MovimientosActivos" mov
            WHERE mov.id_activo_fijo = af.id_activo_fijo
            ORDER BY mov.fecha_movimiento DESC
            LIMIT 1) mov_actual ON true
        LEFT JOIN "tableEmpleados" emp_anterior ON mov_actual.id_responsable_anterior  = emp_anterior.id_empleado
        LEFT JOIN "tableEmpleados" emp_actual ON mov_actual.id_responsable_actual = emp_actual.id_empleado
        LEFT JOIN "tableDepartamentos" dep_actual ON emp_actual.id_departamento = dep_actual.id_departamento
        LEFT JOIN "tableUbicaciones" ub_anterior ON mov_actual.id_ubicacion_anterior  = ub_anterior.id_ubicacion
        LEFT JOIN "tableUbicaciones" ub_actual ON mov_actual.id_ubicacion_actual = ub_actual.id_ubicacion
        LEFT JOIN almacengeneral."tableRef_TiposMovimientosAF" tipmov ON mov_actual.id_tipo_movimiento  = tipmov.id_tipomovimientoaf 
        ORDER BY af.fecha_registro_af DESC;
        SQL
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la vista
        DB::statement('DROP VIEW IF EXISTS almacengeneral.vw_movimientosafcompletos;');
    }
};
