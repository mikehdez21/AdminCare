<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear el esquema si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        // Crear la tabla de Tipos de Proveedor dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_TiposProveedor', function (Blueprint $table) {
            // identificador único del tipo de proveedor (clave primaria)
            $table->bigIncrements('id_tipoproveedor')->primary();

            // Descripción del Tipo de Proveedor (Cadena de Texto, Obligatorio)
            $table->string('descripcion_tipoproveedor');

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();
        });

        DB::table('almacengeneral.tableRef_TiposProveedor')->insert([
            ['descripcion_tipoproveedor' => 'Productos'],
            ['descripcion_tipoproveedor' => 'Servicios'],
            ['descripcion_tipoproveedor' => 'Productos y Servicios']

        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de tipos de proveedor
        Schema::dropIfExists('almacengeneral.tableRef_TiposProveedor');
    }
};
