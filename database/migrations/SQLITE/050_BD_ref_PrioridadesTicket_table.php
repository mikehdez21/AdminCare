<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear la tabla de prioridades de tickets dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableRef_PrioridadesTicket'), function (Blueprint $table) {
            // Identificador único de la prioridad (clave primaria)
            $table->bigIncrements('id_prioridad_ticket');

            // Nombre de la prioridad (obligatorio y único)
            $table->string('nombre_prioridad', 50)->unique();

            // Qué significa la prioridad, para que el solicitante sepa clasificar
            // su ticket en el formulario de alta (opcional)
            $table->text('descripcion_prioridad')->nullable();

            // Nivel de prioridad (1=Baja, 4=Crítica)
            $table->smallInteger('nivel_prioridad');

            // Color hex de la prioridad para la interfaz (opcional)
            $table->string('color', 7)->nullable();

            // Estatus activo o inactivo (booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at
            $table->timestamps();
        });

        // Insertar las prioridades iniciales
        DB::table(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->insert([
            [
                'nombre_prioridad' => 'Baja',
                'descripcion_prioridad' => 'Molestia o solicitud menor que no impide trabajar. Afecta a una sola persona y tiene una solución temporal o no es urgente.',
                'nivel_prioridad' => 1,
                'color' => '#28A745',
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_prioridad' => 'Media',
                'descripcion_prioridad' => 'Afecta a varias personas o a un área, pero el trabajo continúa con interrupciones o con una solución temporal.',
                'nivel_prioridad' => 2,
                'color' => '#FFC107',
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_prioridad' => 'Alta',
                'descripcion_prioridad' => 'Impide realizar una actividad importante del área. No hay solución temporal y requiere atención prioritaria.',
                'nivel_prioridad' => 3,
                'color' => '#FD7E14',
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_prioridad' => 'Crítica',
                'descripcion_prioridad' => 'Detiene la operación completa de un área o de la empresa. Afecta a muchos usuarios o a un servicio esencial y requiere atención inmediata.',
                'nivel_prioridad' => 4,
                'color' => '#DC3545',
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de prioridades de tickets
        Schema::dropIfExists(SchemaTable::helpdesk('tableRef_PrioridadesTicket'));
    }
};
