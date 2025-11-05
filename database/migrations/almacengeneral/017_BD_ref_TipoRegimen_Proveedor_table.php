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

        // Crear la table de los Regimenes Fiscales del Proveedor dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_RegimenFiscales', function (Blueprint $table) {
            // identificador único del Tipo de Regimen Fiscal (clave primaria)
            $table->bigIncrements('id_regimenfiscal')->primary();

            // Descripción del Tipo de Regimen Fiscal (Cadena de Texto, Obligatorio)
            $table->string('descripcion_regimenfiscal');

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();
        });

        DB::table('almacengeneral.tableRef_RegimenFiscales')->insert([
            ['descripcion_regimenfiscal' => 'Moral'],
            ['descripcion_regimenfiscal' => 'Fisica']

        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de tipos de regimen fiscal
        Schema::dropIfExists('almacengeneral.tableRef_RegimenFiscales');
    }
};
