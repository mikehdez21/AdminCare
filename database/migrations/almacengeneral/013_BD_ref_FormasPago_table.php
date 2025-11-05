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

        Schema::create('almacengeneral.tableRef_FormasPago', function (Blueprint $table) {
            $table->bigIncrements('id_formapago')->primary();
            $table->string('descripcion_formaspago')->unique();
            $table->timestamps();
        });

        DB::table('almacengeneral.tableRef_FormasPago')->insert([
            ['descripcion_formaspago' => 'Efectivo', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_formaspago' => 'Tarjeta de crédito', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_formaspago' => 'Transferencia bancaria', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_formaspago' => 'Cheque', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_formaspago' => 'Pago en línea', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_formaspago' => 'Crédito a proveedores', 'created_at' => now(), 'updated_at' => now()],

        ]);
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_FormasPago');
    }
};
