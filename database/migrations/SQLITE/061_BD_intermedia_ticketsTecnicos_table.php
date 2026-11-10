<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Personas que atienden un ticket: una fila por ticket, con el responsable
 * espejado de `tableMA_Tickets.id_responsable` y hasta cuatro colaboradores.
 *
 * El tope es de cinco personas por ticket (responsable + cuatro colaboradores).
 * El caso normal es que el ticket tenga solo responsable; la fila existe para
 * dejar el hueco de los colaboradores sin cambiar la forma en que se filtra y
 * se autoriza, que sigue leyendo `Tickets.id_responsable`.
 *
 * Solo el responsable manda: dispara el auto-estatus, el filtro de la mesa y
 * `Ticket::esAtendientePor`. Los colaboradores son información de apoyo.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create(SchemaTable::helpdesk('tableInter_ticketsTecnicos'), function (Blueprint $table) {
            $table->bigIncrements('id_ticket_tecnico');

            $table->unsignedBigInteger('id_ticket');

            // Espejo de `Tickets.id_responsable`: `TicketService` escribe el mismo
            // valor en las dos tablas al asignar, y ambas columnas son nullable
            // para que el `ON DELETE SET NULL` del empleado se vea igual en las dos.
            $table->unsignedBigInteger('id_responsable')->nullable();

            // Colaboradores, en orden de captura. Todos opcionales.
            $table->unsignedBigInteger('id_tecnico_dos')->nullable();
            $table->unsignedBigInteger('id_tecnico_tres')->nullable();
            $table->unsignedBigInteger('id_tecnico_cuatro')->nullable();
            $table->unsignedBigInteger('id_tecnico_cinco')->nullable();

            $table->timestamps();

            $table->foreign('id_ticket')->references('id_ticket')->on(SchemaTable::helpdesk('tableMA_Tickets'))->onDelete('cascade');
            $table->foreign('id_responsable')->references('id_empleado')->on('tableEmpleados')->onDelete('set null');
            $table->foreign('id_tecnico_dos')->references('id_empleado')->on('tableEmpleados')->onDelete('set null');
            $table->foreign('id_tecnico_tres')->references('id_empleado')->on('tableEmpleados')->onDelete('set null');
            $table->foreign('id_tecnico_cuatro')->references('id_empleado')->on('tableEmpleados')->onDelete('set null');
            $table->foreign('id_tecnico_cinco')->references('id_empleado')->on('tableEmpleados')->onDelete('set null');

            // Una fila por ticket.
            $table->unique('id_ticket', 'uk_tecnicos_ticket');

            // Índices para resolver "tickets en los que participa alguien".
            $table->index('id_responsable', 'idx_tecnicos_responsable');
            $table->index('id_tecnico_dos', 'idx_tecnicos_dos');
            $table->index('id_tecnico_tres', 'idx_tecnicos_tres');
            $table->index('id_tecnico_cuatro', 'idx_tecnicos_cuatro');
            $table->index('id_tecnico_cinco', 'idx_tecnicos_cinco');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(SchemaTable::helpdesk('tableInter_ticketsTecnicos'));
    }
};
