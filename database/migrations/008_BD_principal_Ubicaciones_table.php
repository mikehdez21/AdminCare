<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tableUbicaciones', function (Blueprint $table) {
            // Identificador único de la ubicación (clave primaria)
            $table->bigIncrements('id_ubicacion')->primary();

            // Nombre de la ubicación (Cadena de Texto, Obligatorio)
            $table->string('nombre_ubicacion');

            // Descripción de la ubicación (Cadena de Texto, Opcional)
            $table->string('descripcion_ubicacion')->nullable();

            // Estatus de la ubicación (Booleano, por defecto true)
            $table->boolean('estatus_ubicacion')->default(true);

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_ubicacion', 'idx_nombre_ubicacion');
        });

        DB::table('tableUbicaciones')->insert([
            ['nombre_ubicacion' => 'Recepción Gobierno', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => '1er Piso Gobierno', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Dirección', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Snack', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Lobby Admisión', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Lobby Caja', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Dirección Médica', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Lobby Pacientes', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Cuneros', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hospitalización 1', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hospitalización 2', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hospitalización 3', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Auditorio Principal', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Laboratorio', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Ambulatoria', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hemodinamia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Tocología', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Imagenologia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Urgencias Admisión', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Urgencias Observación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Urgencias Aislado', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'UTIA', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Noticia Familiar', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'UCIN', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Aula Capacitación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Quirófanos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'CEYE', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Descanso Médicos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Biomedicos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Comedor', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Mantenimiento', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Sistemas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Servicios Generales', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Seguridad Monitoreo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Farmacia Interna', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Abastecimientos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Almacén General', 'created_at' => now(), 'updated_at' => now()],

            ['nombre_ubicacion' => 'Consulta Externa', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Archivo Clínico', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Banco de Sangre', 'created_at' => now(), 'updated_at' => now()],

            ['nombre_ubicacion' => 'Otros', 'created_at' => now(), 'updated_at' => now()],

        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //Eliminar la tabla con CASCADE para eliminar también las dependencias
        DB::statement('DROP TABLE IF EXISTS tableUbicaciones CASCADE;');
    }
};
