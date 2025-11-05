<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {

        // Crear la tabla de tipos de movimientos de activos fijos dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_TiposMovimientosAF', function (Blueprint $table) {
            // Identificador único del tipo de movimiento (clave primaria)
            $table->bigIncrements('id_tipomovimientoaf')->primary();

            // Nombre del tipo de movimiento (cadena de texto, obligatorio)
            $table->string('nombre_tipomovimientoaf')->notNull();

            // Descripción del tipo de movimiento (cadena de texto, opcional)
            $table->string('descripcion_tipomovimiento')->nullable();

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

        });

        DB::table('almacengeneral.tableRef_TiposMovimientosAF')->insert([
            ['nombre_tipomovimientoaf' => 'Asignación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipomovimientoaf' => 'Devolución Almacén', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipomovimientoaf' => 'Reubicación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipomovimientoaf' => 'Mantenimiento', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipomovimientoaf' => 'Baja', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_tipomovimientoaf' => 'Otros', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('almacengeneral.tableRef_TiposMovimientosAF');
        // Opcional: eliminar el esquema 'almacengeneral' y todas sus tablas
        DB::statement('DROP SCHEMA IF EXISTS almacengeneral CASCADE');
    }
};
