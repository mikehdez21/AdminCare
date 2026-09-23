<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Crear la tabla intermedia para la relación muchos a muchos entre usuarios y departamentos
        Schema::create('tableInter_usuariosDepartamentos', function (Blueprint $table) {
            // Claves foráneas
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_departamento');

            // Definir las relaciones
            $table->foreign('id_usuario')->references('id_usuario')->on('tableUsuarios')->onDelete('cascade');
            $table->foreign('id_departamento')->references('id_departamento')->on('tableDepartamentos')->onDelete('cascade');

            // Clave primaria compuesta
            $table->primary(['id_usuario', 'id_departamento']);
        });
    }

    public function down(): void
    {
        // Eliminar la tabla intermedia si la migración es revertida
        Schema::dropIfExists('table_usuariosdepartamentos');
    }
};


/*
Relación Muchos a Muchos entre Usuarios y Departamentos:
    Si un usuario puede estar asociado a múltiples departamentos (por ejemplo, un usuario que trabaja en varios departamentos).
    Si un departamento puede estar asociado a múltiples usuarios (por ejemplo, un departamento que tiene varios usuarios compartidos).
*/