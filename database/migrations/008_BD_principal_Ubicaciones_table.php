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
        Schema::create('tableUbicaciones', function (Blueprint $table) {
            // Identificador único de la ubicación (clave primaria)
            $table->bigIncrements('id_ubicacion')->primary();

            // Nombre de la ubicación (Cadena de Texto, Obligatorio)
            $table->string('nombre_ubicacion');

            // Descripción de la ubicación (Cadena de Texto, Opcional)
            $table->string('descripcion_ubicacion')->nullable();

            // Estatus de la ubicación (Booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_ubicacion', 'idx_nombre_ubicacion');
        });

        DB::table('tableUbicaciones')->insert([
            ['nombre_ubicacion' => 'Recepción Gobierno', 'descripcion_ubicacion' => 'Área de Recepción Gobierno', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => '1er Piso Gobierno', 'descripcion_ubicacion' => 'Área de 1er Piso Gobierno', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Dirección', 'descripcion_ubicacion' => 'Área de Dirección', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Snack', 'descripcion_ubicacion' => 'Área de Snack', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Lobby Admisión', 'descripcion_ubicacion' => 'Área de Lobby Admisión', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Lobby Caja', 'descripcion_ubicacion' => 'Área de Lobby Caja', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Dirección Médica', 'descripcion_ubicacion' => 'Área de Dirección Médica', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Lobby Pacientes', 'descripcion_ubicacion' => 'Área de Lobby Pacientes', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Cuneros', 'descripcion_ubicacion' => 'Área de Cuneros', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hospitalización 1', 'descripcion_ubicacion' => 'Área de Hospitalización 1', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hospitalización 2', 'descripcion_ubicacion' => 'Área de Hospitalización 2', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hospitalización 3', 'descripcion_ubicacion' => 'Área de Hospitalización 3', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Auditorio Principal', 'descripcion_ubicacion' => 'Área de Auditorio Principal', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Laboratorio', 'descripcion_ubicacion' => 'Área de Laboratorio', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Ambulatoria', 'descripcion_ubicacion' => 'Área de Ambulatoria', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Hemodinamia', 'descripcion_ubicacion' => 'Área de Hemodinamia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Tocología', 'descripcion_ubicacion' => 'Área de Tocología', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Imagenologia', 'descripcion_ubicacion' => 'Área de Imagenologia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Urgencias Admisión', 'descripcion_ubicacion' => 'Área de Urgencias Admisión', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Urgencias Observación', 'descripcion_ubicacion' => 'Área de Urgencias Observación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Urgencias Aislado', 'descripcion_ubicacion' => 'Área de Urgencias Aislado', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'UTIA', 'descripcion_ubicacion' => 'Área de UTIA', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Noticia Familiar', 'descripcion_ubicacion' => 'Área de Noticia Familiar', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'UCIN', 'descripcion_ubicacion' => 'Área de UCIN', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Aula Capacitación', 'descripcion_ubicacion' => 'Área de Aula Capacitación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Quirófanos', 'descripcion_ubicacion' => 'Área de Quirófanos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'CEYE', 'descripcion_ubicacion' => 'Área de CEYE', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Descanso Médicos', 'descripcion_ubicacion' => 'Área de Descanso Médicos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Biomedicos', 'descripcion_ubicacion' => 'Área de Biomedicos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Comedor', 'descripcion_ubicacion' => 'Área de Comedor', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Mantenimiento', 'descripcion_ubicacion' => 'Área de Mantenimiento', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Sistemas', 'descripcion_ubicacion' => 'Área de Sistemas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Servicios Generales', 'descripcion_ubicacion' => 'Área de Servicios Generales', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Seguridad Monitoreo', 'descripcion_ubicacion' => 'Área de Seguridad Monitoreo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Farmacia Interna', 'descripcion_ubicacion' => 'Área de Farmacia Interna', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Abastecimientos', 'descripcion_ubicacion' => 'Área de Abastecimientos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Almacén General', 'descripcion_ubicacion' => 'Área de Almacén General', 'created_at' => now(), 'updated_at' => now()],

            ['nombre_ubicacion' => 'Consulta Externa', 'descripcion_ubicacion' => 'Área de Consulta Externa', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Archivo Clínico', 'descripcion_ubicacion' => 'Área de Archivo Clínico', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_ubicacion' => 'Banco de Sangre', 'descripcion_ubicacion' => 'Área de Banco de Sangre', 'created_at' => now(), 'updated_at' => now()],

            ['nombre_ubicacion' => 'Otros', 'descripcion_ubicacion' => 'Área de Otros', 'created_at' => now(), 'updated_at' => now()],

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
