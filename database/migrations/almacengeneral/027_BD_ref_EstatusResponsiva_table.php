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

        Schema::create('almacengeneral.tableRef_EstatusResponsiva', function (Blueprint $table) {
            $table->bigIncrements('id_estatus_responsiva')->primary();
            $table->string('descripcion_estatus_responsiva')->unique();
            $table->timestamps();

            
        });

        // Insertar los estatus iniciales
        DB::table('almacengeneral.tableRef_EstatusResponsiva')->insert([
            ['descripcion_estatus_responsiva' => 'Activa', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_responsiva' => 'Cerrada', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_responsiva' => 'Anulada', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_responsiva' => 'Vencida', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_responsiva' => 'Pendiente Firma', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_EstatusResponsiva');
    }
};