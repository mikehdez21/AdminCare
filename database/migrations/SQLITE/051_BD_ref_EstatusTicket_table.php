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
        // Crear la tabla de estatus de tickets dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableRef_EstatusTicket'), function (Blueprint $table) {
            // Identificador único del estatus (clave primaria)
            $table->bigIncrements('id_estatus_ticket');

            // Nombre del estatus (obligatorio y único)
            $table->string('nombre_estatus', 50)->unique();

            // Descripción del estatus (opcional)
            $table->string('descripcion_estatus', 255)->nullable();

            // Indica si es un estado final del flujo (booleano, por defecto false)
            $table->boolean('es_estado_final')->default(false);

            // Orden dentro del flujo de atención
            $table->smallInteger('orden_flujo');

            // Color hex del estatus para la interfaz (opcional)
            $table->string('color', 7)->nullable();

            // Campos de control: created_at y updated_at
            $table->timestamps();
        });

        // Insertar los estatus iniciales
        DB::table(SchemaTable::helpdesk('tableRef_EstatusTicket'))->insert([
            ['nombre_estatus' => 'Abierto', 'descripcion_estatus' => 'Ticket recién creado, sin asignar', 'es_estado_final' => false, 'orden_flujo' => 1, 'color' => '#a628c4', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_estatus' => 'Asignado', 'descripcion_estatus' => 'Ticket asignado a un técnico o departamento', 'es_estado_final' => false, 'orden_flujo' => 2, 'color' => '#0088ff', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_estatus' => 'En Proceso', 'descripcion_estatus' => 'El técnico está trabajando en la solución', 'es_estado_final' => false, 'orden_flujo' => 3, 'color' => '#ffa200', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_estatus' => 'Pendiente', 'descripcion_estatus' => 'En espera de información o recursos', 'es_estado_final' => false, 'orden_flujo' => 4, 'color' => '#fbff00', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_estatus' => 'Resuelto', 'descripcion_estatus' => 'Se ha dado solución al ticket', 'es_estado_final' => false, 'orden_flujo' => 5, 'color' => '#00ff2a', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_estatus' => 'Cerrado', 'descripcion_estatus' => 'Ticket cerrado definitivamente', 'es_estado_final' => true, 'orden_flujo' => 6, 'color' => '#6C757D', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de estatus de tickets
        Schema::dropIfExists(SchemaTable::helpdesk('tableRef_EstatusTicket'));
    }
};
