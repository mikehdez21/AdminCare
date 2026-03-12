<?php

namespace Database\Seeders\AlmacenGeneral;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AlmacenGeneral\MovimientosActivos;

class table_MovimientosActivosSeeder extends Seeder
{
    public function run(): void
    {
        MovimientosActivos::create([
            'id_activo_fijo' => 1,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-01',
            'id_responsable_anterior' => 1,
            'id_responsable_actual' => 1,
            'id_ubicacion_anterior' => 1,
            'id_ubicacion_actual' => 1,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 2,
            'id_tipo_movimiento' => 3,
            'motivo_movimiento' => 'Movimiento 2 del activo fijo',
            'fecha_movimiento' => '2024-08-03',
            'id_responsable_anterior' => 2,
            'id_responsable_actual' => 3,
            'id_ubicacion_anterior' => 2,
            'id_ubicacion_actual' => 3,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 3,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-05',
            'id_responsable_anterior' => 3,
            'id_responsable_actual' => 4,
            'id_ubicacion_anterior' => 3,
            'id_ubicacion_actual' => 4,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 4,
            'id_tipo_movimiento' => 2,
            'motivo_movimiento' => 'Reasignación por cambio de departamento',
            'fecha_movimiento' => '2024-08-07',
            'id_responsable_anterior' => 4,
            'id_responsable_actual' => 5,
            'id_ubicacion_anterior' => 4,
            'id_ubicacion_actual' => 5,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 5,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-09',
            'id_responsable_anterior' => 5,
            'id_responsable_actual' => 1,
            'id_ubicacion_anterior' => 5,
            'id_ubicacion_actual' => 1,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 6,
            'id_tipo_movimiento' => 3,
            'motivo_movimiento' => 'Mantenimiento programado',
            'fecha_movimiento' => '2024-08-11',
            'id_responsable_anterior' => 1,
            'id_responsable_actual' => 2,
            'id_ubicacion_anterior' => 1,
            'id_ubicacion_actual' => 2,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 7,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-13',
            'id_responsable_anterior' => 2,
            'id_responsable_actual' => 3,
            'id_ubicacion_anterior' => 2,
            'id_ubicacion_actual' => 3,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 8,
            'id_tipo_movimiento' => 2,
            'motivo_movimiento' => 'Cambio de ubicación por reorganización',
            'fecha_movimiento' => '2024-08-15',
            'id_responsable_anterior' => 3,
            'id_responsable_actual' => 4,
            'id_ubicacion_anterior' => 3,
            'id_ubicacion_actual' => 4,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 9,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-17',
            'id_responsable_anterior' => 4,
            'id_responsable_actual' => 5,
            'id_ubicacion_anterior' => 4,
            'id_ubicacion_actual' => 5,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 10,
            'id_tipo_movimiento' => 3,
            'motivo_movimiento' => 'Actualización de software y hardware',
            'fecha_movimiento' => '2024-08-19',
            'id_responsable_anterior' => 5,
            'id_responsable_actual' => 1,
            'id_ubicacion_anterior' => 5,
            'id_ubicacion_actual' => 1,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 11,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-21',
            'id_responsable_anterior' => 1,
            'id_responsable_actual' => 2,
            'id_ubicacion_anterior' => 1,
            'id_ubicacion_actual' => 2,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 12,
            'id_tipo_movimiento' => 2,
            'motivo_movimiento' => 'Reasignación por nuevo proyecto',
            'fecha_movimiento' => '2024-08-23',
            'id_responsable_anterior' => 2,
            'id_responsable_actual' => 3,
            'id_ubicacion_anterior' => 2,
            'id_ubicacion_actual' => 3,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 13,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-25',
            'id_responsable_anterior' => 3,
            'id_responsable_actual' => 4,
            'id_ubicacion_anterior' => 3,
            'id_ubicacion_actual' => 4,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 14,
            'id_tipo_movimiento' => 3,
            'motivo_movimiento' => 'Mantenimiento correctivo',
            'fecha_movimiento' => '2024-08-27',
            'id_responsable_anterior' => 4,
            'id_responsable_actual' => 5,
            'id_ubicacion_anterior' => 4,
            'id_ubicacion_actual' => 5,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 15,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-08-29',
            'id_responsable_anterior' => 5,
            'id_responsable_actual' => 1,
            'id_ubicacion_anterior' => 5,
            'id_ubicacion_actual' => 1,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 16,
            'id_tipo_movimiento' => 2,
            'motivo_movimiento' => 'Cambio de responsable por promoción',
            'fecha_movimiento' => '2024-09-01',
            'id_responsable_anterior' => 1,
            'id_responsable_actual' => 2,
            'id_ubicacion_anterior' => 1,
            'id_ubicacion_actual' => 2,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 17,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-09-03',
            'id_responsable_anterior' => 2,
            'id_responsable_actual' => 3,
            'id_ubicacion_anterior' => 2,
            'id_ubicacion_actual' => 3,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 18,
            'id_tipo_movimiento' => 3,
            'motivo_movimiento' => 'Reubicación por remodelación de oficina',
            'fecha_movimiento' => '2024-09-05',
            'id_responsable_anterior' => 3,
            'id_responsable_actual' => 4,
            'id_ubicacion_anterior' => 3,
            'id_ubicacion_actual' => 4,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 19,
            'id_tipo_movimiento' => 1,
            'motivo_movimiento' => 'Asignación inicial del activo fijo',
            'fecha_movimiento' => '2024-09-07',
            'id_responsable_anterior' => 4,
            'id_responsable_actual' => 5,
            'id_ubicacion_anterior' => 4,
            'id_ubicacion_actual' => 5,
        ]);

        MovimientosActivos::create([
            'id_activo_fijo' => 20,
            'id_tipo_movimiento' => 2,
            'motivo_movimiento' => 'Transferencia por cierre de proyecto',
            'fecha_movimiento' => '2024-09-09',
            'id_responsable_anterior' => 5,
            'id_responsable_actual' => 1,
            'id_ubicacion_anterior' => 5,
            'id_ubicacion_actual' => 1,
        ]);

        // AL FINAL, agregar esto para resetear la secuencia:
        $maxId = DB::table('almacengeneral.tableAF_MovimientosActivos')->max('id_activo_fijo');
        DB::statement('SELECT setval(\'almacengeneral."tableAF_MovimientosActivos_id_movimientoAF_seq"\', ' . ($maxId + 1) . ')');
    }

}

