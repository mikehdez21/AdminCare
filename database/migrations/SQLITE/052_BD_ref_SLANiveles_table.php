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
        // Crear la tabla de niveles de SLA dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableRef_SLANiveles'), function (Blueprint $table) {
            // Identificador único del nivel de SLA (clave primaria)
            $table->bigIncrements('id_sla_nivel');

            // Prioridad asociada al nivel de SLA (obligatorio y único)
            $table->unsignedBigInteger('id_prioridad_ticket');

            // Tiempo de respuesta en horas
            $table->decimal('tiempo_respuesta_horas', 6, 2);

            // Tiempo de resolución en horas
            $table->decimal('tiempo_resolucion_horas', 6, 2);

            // Descripción del SLA (opcional)
            $table->string('descripcion_sla', 255)->nullable();

            // Estatus activo o inactivo (booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at
            $table->timestamps();

            // Clave foránea: prioridad del ticket
            $table->foreign('id_prioridad_ticket')->references('id_prioridad_ticket')->on(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->onDelete('cascade');

            // Restricción única: una sola configuración de SLA por prioridad
            $table->unique('id_prioridad_ticket', 'uk_sla_prioridad');
        });

        // Resolver dinámicamente los IDs de las prioridades
        $idBaja = DB::table(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->where('nombre_prioridad', 'Baja')->value('id_prioridad_ticket');
        $idMedia = DB::table(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->where('nombre_prioridad', 'Media')->value('id_prioridad_ticket');
        $idAlta = DB::table(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->where('nombre_prioridad', 'Alta')->value('id_prioridad_ticket');
        $idCritica = DB::table(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->where('nombre_prioridad', 'Crítica')->value('id_prioridad_ticket');

        // Insertar los niveles de SLA iniciales
        DB::table(SchemaTable::helpdesk('tableRef_SLANiveles'))->insert([
            ['id_prioridad_ticket' => $idBaja, 'tiempo_respuesta_horas' => 24, 'tiempo_resolucion_horas' => 72, 'descripcion_sla' => 'SLA prioridad Baja', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id_prioridad_ticket' => $idMedia, 'tiempo_respuesta_horas' => 8, 'tiempo_resolucion_horas' => 48, 'descripcion_sla' => 'SLA prioridad Media', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id_prioridad_ticket' => $idAlta, 'tiempo_respuesta_horas' => 4, 'tiempo_resolucion_horas' => 24, 'descripcion_sla' => 'SLA prioridad Alta', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id_prioridad_ticket' => $idCritica, 'tiempo_respuesta_horas' => 1, 'tiempo_resolucion_horas' => 4, 'descripcion_sla' => 'SLA prioridad Crítica', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de niveles de SLA
        Schema::dropIfExists(SchemaTable::helpdesk('tableRef_SLANiveles'));
    }
};
