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

        Schema::create('almacengeneral.tableRef_TiposMonedas', function (Blueprint $table) {
            $table->bigIncrements('id_tipomoneda')->primary();
            $table->string('descripcion_tipomoneda')->unique();
            $table->timestamps();

        });

        // Insertar los tipos de moneda iniciales
        DB::table('almacengeneral.tableRef_TiposMonedas')->insert([
            ['descripcion_tipomoneda' => 'Peso Mexicano (MXN)', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_tipomoneda' => 'Dólar Estadounidense (USD)', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_tipomoneda' => 'Euro (EUR)', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_tipomoneda' => 'Dólar Canadiense (CAD)', 'created_at' => now(), 'updated_at' => now()],

        ]);
        
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_TiposMonedas');
    }
};
