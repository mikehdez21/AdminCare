<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {

    public function up()
    {
        // Crear el esquema 'almacengeneral' si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        // Crear la tabla 'af_bajasactivos' dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableAF_BajasActivos', function (Blueprint $table) {
            // ID de la baja del activo (Clave primaria autoincremental)
            $table->bigIncrements('id_baja_activo')->primary();

            // Clave foránea que referencia a la tabla de activos fijos en 'almacengeneral'
            $table->foreignId('id_activo_fijo')->constrained('almacengeneral.tableAF_ActivosFijos', 'id_activo_fijo')->onDelete('restrict');

            // Fecha de la solicitud de baja del activo
            $table->date('fecha_solicitud')->notNull();

            // Fecha de la aprobación de la baja del activo
            $table->date('fecha_aprobacion')->nullable();

            // Motivo de la baja del activo
            $table->string('motivo_baja_af', 255)->notNull();

            // Clave Foránea que referencia al tipo de baja de activo
            $table->foreignId('id_tipo_baja')->constrained('almacengeneral.tableRef_TipoBajaAF', 'id_tipo_baja')->onDelete('restrict');

            // Clave Foránea que referencia al tipo de estatus de la baja del activo
            $table->foreignId('id_estatus_baja')->constrained('almacengeneral.tableRef_EstatusBajaAF', 'id_estatus_baja')->default(1)->onDelete('restrict');
            
            // Clave Foránea que referencia al empleado que solicita la baja del activo
            $table->foreignId('id_solicitante')->notNull()->constrained('tableEmpleados', 'id_empleado')->onDelete('restrict');

            // Clave Foránea que referencia al empleado que aprueba la baja del activo
            $table->foreignId('id_aprobador')->nullable()->constrained('tableEmpleados', 'id_empleado')->onDelete('restrict');

            // Observaciones adicionales sobre la baja del activo
            $table->text('observaciones_bajaaf')->nullable();

            // Fecha de registro de la baja del activo en el sistema
            $table->date('fecha_registro_bajaaf')->notNull();

            // Campos de timestamps para registrar la fecha de creación y actualización de la baja del activo
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('fecha_registro_bajaaf', 'idx_fecha_registro_bajaaf');
            $table->index(['id_tipo_baja', 'id_estatus_baja'], 'idx_tipo_estatus');        });
    }

    public function down()
    {
        // Eliminar la tabla 'tableBD_BajasActivos' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableBD_BajasActivos');
    }
};