<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Override de alcance por rol.
 *
 * Responde "¿sobre qué registros?" cuando el alcance no se deriva de los
 * atributos del usuario. Lo consume `AlcanceService::para()` con esta
 * precedencia: usuario > rol (el más amplio) > atributos.
 *
 * La llenan `table_AlcancesSeeder` (Admin/Dirección/Subdirección en `global`)
 * y `permisos:renombrar` (roles que tenían `helpdesk_navbar_*.control`).
 * `global` nunca se deriva solo: exige una fila aquí o en la tabla de usuarios.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tableInter_rolesAlcances', function (Blueprint $table) {
            $table->unsignedBigInteger('id_rol');
            $table->string('recurso', 80);
            $table->string('alcance', 20);

            $table->foreign('id_rol')
                ->references('id')
                ->on('roles')
                ->onDelete('cascade');

            $table->primary(['id_rol', 'recurso']);
            $table->index('recurso');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tableInter_rolesAlcances');
    }
};
