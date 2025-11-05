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

        // Crear la tabla 'tableRef_CondicionesAF' dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_CondicionesAF', function (Blueprint $table) {
            // ID de la condición del activo (Clave primaria autoincremental)
            $table->bigIncrements('id_condicion_af')->primary();

            // Descripción de la condición del activo
            $table->string('descripcion_condicion_af')->notNull();

            // Campos de timestamps para registrar la fecha de creación y actualización de la condición del activo
            $table->timestamps();

        });

        // Insertar datos iniciales en la tabla 'tableRef_CondicionesAF'
        DB::table('almacengeneral.tableRef_CondicionesAF')->insert([
            ['descripcion_condicion_af' => 'Nuevo'],
            ['descripcion_condicion_af' => 'Bueno'],
            ['descripcion_condicion_af' => 'Regular'],
            ['descripcion_condicion_af' => 'Dañado'],
            ['descripcion_condicion_af' => 'Reparación Necesaria']
        ]);
    }

    public function down()
    {
        // Eliminar la tabla 'tableRef_CondicionesAF' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableRef_CondicionesAF');
    }
};