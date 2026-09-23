<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Crear la tabla intermedia para la relación muchos a muchos entre usuarios y empleados
        Schema::create('tableInter_usuariosEmpleados', function (Blueprint $table) {
            // Claves foráneas
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_empleado');

            // Definir las relaciones
            $table->foreign('id_usuario')->references('id_usuario')->on('tableUsuarios')->onDelete('cascade');
            $table->foreign('id_empleado')->references('id_empleado')->on('tableEmpleados')->onDelete('cascade');

            // Clave primaria compuesta
            $table->primary(['id_usuario', 'id_empleado']);
        });
    }

    public function down(): void
    {
        // Eliminar la tabla intermedia si la migración es revertida
        Schema::dropIfExists('table_usuariosempleados');
    }
};

/*
Relación Muchos a Muchos entre Usuarios y Empleados:
    Si un usuario puede estar asociado a múltiples empleados (por ejemplo, un usuario que es jefe de varios empleados).
    Si un empleado puede estar asociado a múltiples usuarios (por ejemplo, un empleado que tiene acceso a varias cuentas de usuario).
*/