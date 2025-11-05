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
        Schema::create('almacengeneral.tableRef_TipoBajaAF', function (Blueprint $table) {
            // ID de la baja del activo (Clave primaria autoincremental)
            $table->bigIncrements('id_tipo_baja')->primary();

            // Descripción del tipo de baja del activo
            $table->string('descripcion_tipo_baja')->notNull();

            // Campos de timestamps para registrar la fecha de creación y actualización de la baja del activo
            $table->timestamps();

        });

        // Insertar los tipos de baja iniciales
        DB::table('almacengeneral.tableRef_TipoBajaAF')->insert([
            ['descripcion_tipo_baja' => 'Venta'],
            ['descripcion_tipo_baja' => 'Donación'],
            ['descripcion_tipo_baja' => 'Destrucción'],
            ['descripcion_tipo_baja' => 'Pérdida'],
            ['descripcion_tipo_baja' => 'Robo'],
            ['descripcion_tipo_baja' => 'Intercambio'],
            ['descripcion_tipo_baja' => 'Entrega a empleado'],
            ['descripcion_tipo_baja' => 'Devolución por empleado'],
        ]);
    }

    public function down()
    {
        // Eliminar la tabla 'tableRef_TipoBajaAF' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableRef_TipoBajaAF');
    }
};