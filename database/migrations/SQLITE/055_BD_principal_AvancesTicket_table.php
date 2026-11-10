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
        // Bitácora de avances del ticket. Solo la crea el usuario que atiende
        // (técnico asignado o del departamento) y es de solo lectura para el
        // solicitante. El solicitante solo escribe al reabrir (motivo, que vive
        // en helpdesk.tableMA_ActividadTicket) y al cerrar (satisfacción, en
        // helpdesk.tableMA_EncuestaSatisfaccion).
        Schema::create(SchemaTable::helpdesk('tableMA_AvancesTicket'), function (Blueprint $table) {
            // Identificador único del avance (clave primaria)
            $table->bigIncrements('id_avance_ticket');

            // Ticket al que pertenece el avance (obligatorio)
            $table->unsignedBigInteger('id_ticket');

            // Usuario que atiende y escribe el avance (obligatorio)
            $table->unsignedBigInteger('id_usuario_autor');

            // Texto del avance (obligatorio)
            $table->text('contenido_avance');

            // true = nota interna solo para técnicos (el solicitante no la ve).
            // false = avance visible para el solicitante.
            $table->boolean('es_interno')->default(false);

            // Soft delete: fecha en que se eliminó el avance (opcional)
            $table->timestamp('fecha_eliminado')->nullable();

            // Campos de control: created_at y updated_at
            $table->timestamps();

            // Claves foráneas
            $table->foreign('id_ticket')->references('id_ticket')->on(SchemaTable::helpdesk('tableMA_Tickets'))->onDelete('cascade');
            $table->foreign('id_usuario_autor')->references('id_usuario')->on('tableUsuarios')->onDelete('restrict');

            // Índices para mejorar el rendimiento de las consultas
            $table->index('id_ticket', 'idx_avance_ticket');
            $table->index('id_usuario_autor', 'idx_avance_autor');
            $table->index('es_interno', 'idx_avance_es_interno');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de avances del ticket
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_AvancesTicket'));
    }
};
