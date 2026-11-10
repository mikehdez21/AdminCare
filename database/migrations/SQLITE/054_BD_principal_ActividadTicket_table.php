<?php

use App\Support\SchemaTable;

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
        // Crear la tabla de actividad (historial) de tickets dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableMA_ActividadTicket'), function (Blueprint $table) {
            // Identificador único de la actividad (clave primaria)
            $table->bigIncrements('id_actividad_ticket');

            // Ticket al que pertenece la actividad (obligatorio)
            $table->unsignedBigInteger('id_ticket');

            // Usuario que realizó la actividad (opcional)
            $table->unsignedBigInteger('id_usuario_actor')->nullable();

            // Tipo de actividad (creacion, cambio_estado, asignacion, etc.)
            $table->string('tipo_actividad', 50);

            // Valor anterior del cambio (opcional)
            $table->text('valor_anterior')->nullable();

            // Valor nuevo del cambio (opcional)
            $table->text('valor_nuevo')->nullable();

            // Descripción de la actividad (opcional)
            $table->text('descripcion_actividad')->nullable();

            // Fecha de creación (inmutable, sin updated_at)
            $table->timestamp('created_at')->useCurrent();

            // Claves foráneas
            $table->foreign('id_ticket')->references('id_ticket')->on(SchemaTable::helpdesk('tableMA_Tickets'))->onDelete('cascade');
            $table->foreign('id_usuario_actor')->references('id_usuario')->on('tableUsuarios')->onDelete('set null');

            // Índices para mejorar el rendimiento de las consultas
            $table->index('id_ticket');
            $table->index('id_usuario_actor');
            $table->index('tipo_actividad');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de actividad de tickets
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_ActividadTicket'));
    }
};
