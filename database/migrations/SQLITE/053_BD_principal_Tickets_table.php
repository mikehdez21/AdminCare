<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla principal de tickets.
 *
 * Concentra aquí el esquema definitivo. Las migraciones `058` (agregaba
 * `titulo_ticket`, `id_ubicacion` e `id_activo_fijo`), `059` (volvía anulables tres
 * referencias con `ON DELETE SET NULL` y hacía backfill del snapshot) y `060`
 * (daba de baja `id_activo_fijo`) quedaron eliminadas: el módulo todavía no está
 * en producción, así que su historia de correcciones no aporta nada y solo
 * obligaría a aplicar un esquema distinto al que se documenta.
 *
 * Lo que esas tres migraciones dejaron, ya incorporated desde el origen:
 *
 *  - `titulo_ticket` nace NOT NULL y sin default. La 058 lo creo con
 *    `default('')` y sin backfill, lo que dejaba los tickets antiguos con el
 *    snapshot vacío y las busquedas por titulo sin encontrarlos. En una tabla
 *    nueva no hay tickets antiguos que rellenar: `TicketService` siempre lo
 *    escribe con `forceFill`, asi que no hace falta default ni backfill.
 *
 *  - `id_subcategoria_ticket` e `id_titulo_ticket` nacen anulables. Las 2 declaran
 *    `ON DELETE SET NULL`, que es una promesa que PostgreSQL no puede cumplir si la
 *    columna es NOT NULL: borrar el padre fallaba por violacion de not-null en vez
 *    de dejar la referencia nula.
 *
 *  - `id_departamento_asignado` no existe. Nacio para resolver "quien atiende esto":
 *    se derivaba de la categoria y se podia reasignar a mano. Con las dos premisas
 *    actuales sobra, porque el solicitante ya trae su departamento en
 *    `tableUsuarios.id_departamento` y la categoria ya declara el departamento
 *    responsable que atiende. Mantener la columna hacia que las dos cosas
 *    significaran lo mismo con nombres distintos y se desincronizaran: un ticket
 *    abierto por alguien de Administracion con la categoria "Sistemas" quedaba en
 *    Administracion y el tecnico de Sistemas no lo veia. El modelo lo resuelve con
 *    `Ticket::departamento()`, un `hasOneThrough` al solicitante.
 *
 *  - `id_activo_fijo` no existe. Se agrego en la 058 y se dio de baja en la 060
 *    porque el Helpdesk no lo usa; el formulario, el payload, la validacion, el
 *    `$fillable` del modelo y la relacion `activoFijo` ya no lo mencionan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create(SchemaTable::helpdesk('tableMA_Tickets'), function (Blueprint $table) {
            $table->bigIncrements('id_ticket');

            // Folio unico del ticket (ej: TK-2026-0001)
            $table->string('folio_ticket', 20);

            // Snapshot del nombre del titulo de catalogo elige el solicitante. Es NOT
            // NULL a proposito: se escribe siempre al crear el ticket, y congelarlo
            // aqui es lo que hace que busquedas y reportes no dependan de cambios
            // posteriores en el catalogo.
            $table->string('titulo_ticket', 255);

            $table->text('descripcion_ticket');

            // Clasificacion. Los tres referencian con ON DELETE SET NULL, asi que
            // admiten NULL; ver el docblock.
            $table->unsignedBigInteger('id_categoria_ticket');
            $table->unsignedBigInteger('id_subcategoria_ticket')->nullable();
            $table->unsignedBigInteger('id_titulo_ticket')->nullable();

            $table->unsignedBigInteger('id_prioridad_ticket');
            $table->unsignedBigInteger('id_estatus_ticket')->default(1);

            $table->unsignedBigInteger('id_usuario_solicitante');
            // Empleado en cuyo nombre se levanta el ticket. Las cuentas normales lo
            // heredan de su usuario; las compartidas (sin empleado) lo eligen de la
            // lista de su departamento al crear el ticket.
            $table->unsignedBigInteger('id_empleado_solicitante');
            // Responsable de atender el ticket. Es un empleado (CORR-023) y el único
            // que manda: dispara el auto-estatus, el filtro y la visibilidad. Los
            // colaboradores viven en `tableInter_ticketsTecnicos` y son informativos.
            $table->unsignedBigInteger('id_responsable')->nullable();

            // Donde ocurrio el problema
            $table->unsignedBigInteger('id_ubicacion')->nullable();

            // Error de proveedor. La bandera es la que filtra en la mesa y la que
            // enciende la seccion "Errores de Proveedor" del detalle. El detalle del
            // error (proveedor, quien resuelve, sistema, no. de ticket externo,
            // modulo y personal SAC) vive en `helpdesk.tableMA_ErroresProveedor`.
            $table->boolean('error_proveedor')->default(false);

            // Ciclo de vida
            $table->timestamp('fecha_primer_respuesta')->nullable();
            $table->timestamp('fecha_resolucion')->nullable();
            $table->timestamp('fecha_cierre')->nullable();
            $table->timestamp('fecha_limite_respuesta')->nullable();
            $table->timestamp('fecha_limite_resolucion')->nullable();

            $table->boolean('ticket_reapertura')->default(false);
            $table->timestamp('fecha_reapertura')->nullable();

            $table->timestamps();

            $table->foreign('id_categoria_ticket')->references('id_categoria_ticket')->on(SchemaTable::helpdesk('tableRef_CategoriasTicket'))->onDelete('restrict');
            $table->foreign('id_subcategoria_ticket')->references('id_subcategoria_ticket')->on(SchemaTable::helpdesk('tableRef_SubcategoriasTicket'))->onDelete('set null');
            $table->foreign('id_titulo_ticket')->references('id_titulo_ticket')->on(SchemaTable::helpdesk('tableRef_TitulosTicket'))->onDelete('set null');
            $table->foreign('id_prioridad_ticket')->references('id_prioridad_ticket')->on(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->onDelete('restrict');
            $table->foreign('id_estatus_ticket')->references('id_estatus_ticket')->on(SchemaTable::helpdesk('tableRef_EstatusTicket'))->onDelete('restrict');
            $table->foreign('id_usuario_solicitante')->references('id_usuario')->on('tableUsuarios')->onDelete('restrict');
            $table->foreign('id_empleado_solicitante')->references('id_empleado')->on('tableEmpleados')->onDelete('restrict');
            // El responsable es un empleado, no un usuario: varios usuarios pueden
            // compartir un empleado (el jefe y la cuenta compartida de Mantenimiento
            // son dos usuarios, un solo empleado que atiende).
            $table->foreign('id_responsable')->references('id_empleado')->on('tableEmpleados')->onDelete('set null');
            $table->foreign('id_ubicacion')->references('id_ubicacion')->on('tableUbicaciones')->onDelete('set null');

            $table->unique('folio_ticket', 'uk_folio_ticket');
            $table->index('id_categoria_ticket');
            $table->index('id_subcategoria_ticket');
            $table->index('id_titulo_ticket');
            $table->index('id_prioridad_ticket');
            $table->index('id_estatus_ticket');
            $table->index('id_usuario_solicitante');
            $table->index('id_empleado_solicitante');
            $table->index('id_responsable');
            $table->index('error_proveedor');
            $table->index('id_ubicacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_Tickets'));
    }
};
