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

        Schema::create('almacengeneral.tableRef_DescuentoProveedor', function (Blueprint $table) {
            $table->bigIncrements('id_descuento_proveedor')->primary();
            $table->string('descripcion_descuentoproveedor')->unique();
            $table->timestamps();
        });

        // Insertar los descuentos iniciales
        DB::table('almacengeneral.tableRef_DescuentoProveedor')->insert([
            ['descripcion_descuentoproveedor' => 'Descuento por pronto pago', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_descuentoproveedor' => 'Descuento por volumen de compra', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_descuentoproveedor' => 'Descuento promocional', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_descuentoproveedor' => 'Descuento por fidelidad', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_descuentoproveedor' => 'Descuento estacional', 'created_at' => now(), 'updated_at' => now()],

        ]);
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_DescuentoProveedor');
    }
};
