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

        Schema::create('almacengeneral.tableRef_EstatusDepreciacionAF', function (Blueprint $table) {
            $table->bigIncrements('id_estatus_depreciacion')->primary();
            $table->string('descripcion_estatus_depreciacion')->unique();
            $table->timestamps();
        });

        // Insertar los estatus iniciales
        DB::table('almacengeneral.tableRef_EstatusDepreciacionAF')->insert([
            ['descripcion_estatus_depreciacion' => 'Sin Depreciar', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_depreciacion' => 'En Depreciación', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_depreciacion' => 'Pausada', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_estatus_depreciacion' => 'Finalizada', 'created_at' => now(), 'updated_at' => now()]
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_EstatusDepreciacionAF');
    }
};
