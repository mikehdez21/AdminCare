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

        Schema::create('almacengeneral.tableRef_EstatusAF', function (Blueprint $table) {
            $table->bigIncrements('id_estatusaf')->primary();
            $table->string('descripcion_estatusaf')->unique();
            $table->timestamps();

        });

        DB::table('almacengeneral.tableRef_EstatusAF')->insert([
            ['descripcion_estatusaf' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatusaf' => 'En Mantenimiento', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatusaf' => 'Dado de Baja', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatusaf' => 'En Revisión', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatusaf' => 'Perdido', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatusaf' => 'Prestado', 'created_at' => now(), 'updated_at' => now()],


        ]);
    }



    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_EstatusAF');
    }
};
