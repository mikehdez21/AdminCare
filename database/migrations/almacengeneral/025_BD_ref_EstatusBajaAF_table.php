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

        // Crear la tabla 'tableRef_TipoBajaAF' dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_EstatusBajaAF', function (Blueprint $table) {
            // ID de la baja del activo (Clave primaria autoincremental)
            $table->bigIncrements('id_estatus_baja')->primary();

            // Descripción del tipo de estatus para la baja del activo
            $table->string('descripcion_estatus_baja')->notNull();

            // Campos de timestamps para registrar la fecha de creación y actualización de la baja del activo
            $table->timestamps();

        });

        // Insertar los estatus iniciales
        DB::table('almacengeneral.tableRef_EstatusBajaAF')->insert([
            ['descripcion_estatus_baja' => 'Solicitado'],
            ['descripcion_estatus_baja' => 'Aprobado'],
            ['descripcion_estatus_baja' => 'Rechazado'],
            ['descripcion_estatus_baja' => 'En Proceso'],
            ['descripcion_estatus_baja' => 'Completado'],
            ['descripcion_estatus_baja' => 'Cancelado'],
        ]);
    }

    public function down()
    {
        // Eliminar la tabla 'tableRef_EstatusBajaAF' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableRef_EstatusBajaAF');
    }
};