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

        // Crear la tabla de Tipos de Formas de Facturación dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_TiposFacturacion', function (Blueprint $table) {
            // identificador único del tipo de proveedor (clave primaria)
            $table->bigIncrements('id_tipofacturacion')->primary();

            // Descripción del Tipo de Facturación (Cadena de Texto, Obligatorio)
            $table->string('descripcion_tipofacturacion');

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();
        });

        DB::table('almacengeneral.tableRef_TiposFacturacion')->insert([
            ['descripcion_tipofacturacion' => 'Gravada'],
            ['descripcion_tipofacturacion' => 'Exenta']


        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de tipos de facturacion
        Schema::dropIfExists('almacengeneral.tableRef_TiposFacturacion');
    }
};
