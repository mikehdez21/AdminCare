<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Crear la tabla 'activosfijos'
        Schema::create('almacengeneral.tableAF_MovimientosActivos', function (Blueprint $table) {

            // Identificador único autoincremental
            $table->bigIncrements('id_movimientoAF')->primary();

            // Clave foránea que referencia al activo fijo en 'almacengeneral'
            $table->foreignId('id_activo_fijo')->constrained('almacengeneral.tableAF_ActivosFijos', 'id_activo_fijo')->onDelete('restrict');

            // Clave foránea que referencia el tipo de movimiento en 'almacengeneral'
            $table->foreignId('id_tipo_movimiento')->constrained('almacengeneral.tableRef_TiposMovimientosAF', 'id_tipomovimientoaf')->onDelete('restrict');

            // Motivo del movimiento (cadena de texto, opcional)
            $table->string('motivo_movimiento')->nullable();

            // fecha del movimiento (fecha y hora, obligatorio)
            $table->timestamp('fecha_movimiento')->useCurrent();

            // Clave foránea que referencia al responsable anterior (Empleado)
            $table->foreignId('id_responsable_anterior')->nullable()->constrained('tableEmpleados', 'id_empleado')->onDelete('set null');

            // Clave foránea que referencia al responsable actual (Empleado)
            $table->foreignId('id_responsable_actual')->nullable()->constrained('tableEmpleados', 'id_empleado')->onDelete('set null');

            // Clave foránea que referencia la ubicación del activo fijo anterior
            $table->foreignId('id_ubicacion_anterior')->nullable()->constrained('tableUbicaciones', 'id_ubicacion')->onDelete('set null');

            // Clave foránea que referencia la ubicación del activo fijo actual
            $table->foreignId('id_ubicacion_actual')->nullable()->constrained('tableUbicaciones', 'id_ubicacion')->onDelete('set null');

            // Campos de fecha de creación y actualización con zona horaria
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('fecha_movimiento', 'idx_fecha_movimiento');
            $table->index(['id_activo_fijo', 'fecha_movimiento'], 'idx_activo_fecha');
        });
    }

    // Método que elimina la tabla 'tableAF_MovimientosActivos' si se deshace la migración
    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableAF_MovimientosActivos');
        // Opcional: eliminar el esquema 'almacengeneral' y todas sus tablas
        DB::statement('DROP SCHEMA IF EXISTS almacengeneral CASCADE');
    }
};
