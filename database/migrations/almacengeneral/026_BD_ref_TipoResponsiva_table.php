<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Crear el esquema si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        Schema::create('almacengeneral.tableRef_TipoResponsiva', function (Blueprint $table) {
            $table->bigIncrements('id_tipo_responsiva')->primary();
            $table->string('descripcion_tipo_responsiva')->unique();
            $table->timestamps();
        });

        // Insertar los tipos de responsiva iniciales
        DB::table('almacengeneral.tableRef_TipoResponsiva')->insert([
            ['descripcion_tipo_responsiva' => 'Asignación', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_tipo_responsiva' => 'Temporal', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_tipo_responsiva' => 'Proyecto', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_tipo_responsiva' => 'Baja', 'created_at' => now(), 'updated_at' => now()],
            
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_TipoResponsiva');
    }
};