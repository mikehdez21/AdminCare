<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Errores de proveedor, normalizados en cuatro tablas siguiendo el patrón de la
 * clasificación de tickets: catálogos de referencia (`tableRef_*`-like) y una
 * principal que los relaciona.
 *
 * - `tableMA_ProveedoresError`: catálogo de proveedores. `requiere_sistema` es el
 *   switch que decide si al capturar el error se piden sistema, no. de ticket,
 *   módulo y personal SAC. `id_departamento` dice qué área lo administra.
 * - `tableMA_SistemasProveedor`: los sistemas de un proveedor. Cada proveedor
 *   puede tener los suyos; la demo arranca sin registros.
 * - `tableMA_ModulosSIHO`: catálogo de módulos del sistema, para el desplegable.
 * - `tableMA_ErroresProveedor`: el error de un ticket. Una fila por ticket (1:1).
 *   `id_soluciona_error` apunta al mismo catálogo de proveedores: quien reporta
 *   y quien resuelve salen de la misma lista.
 *
 * La bandera que enciende la sección en el detalle sigue en `Tickets.error_proveedor`;
 * los demás campos dejaron de ser columnas del ticket.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create(SchemaTable::helpdesk('tableMA_ProveedoresError'), function (Blueprint $table) {
            $table->bigIncrements('id_proveedor_error');

            $table->string('nombre_proveedor_error', 100);

            // Área que administra a ese proveedor.
            $table->unsignedBigInteger('id_departamento')->nullable();

            // Switch del catálogo: si está encendido, capturar el error de este
            // proveedor pide sistema, no. de ticket, módulo y personal SAC.
            $table->boolean('requiere_sistema')->default(false);

            $table->boolean('estatus_activo')->default(true);
            $table->timestamps();

            $table->foreign('id_departamento')->references('id_departamento')->on('tableDepartamentos')->onDelete('set null');

            $table->unique('nombre_proveedor_error', 'uk_proveedor_error_nombre');
            $table->index('id_departamento', 'idx_proveedor_error_departamento');
            $table->index('estatus_activo', 'idx_proveedor_error_estatus');
        });

        Schema::create(SchemaTable::helpdesk('tableMA_SistemasProveedor'), function (Blueprint $table) {
            $table->bigIncrements('id_sistema_proveedor');

            $table->unsignedBigInteger('id_proveedor_error');
            $table->string('nombre_sistema_proveedor', 100);

            $table->boolean('estatus_activo')->default(true);
            $table->timestamps();

            $table->foreign('id_proveedor_error')->references('id_proveedor_error')->on(SchemaTable::helpdesk('tableMA_ProveedoresError'))->onDelete('cascade');

            $table->unique(['id_proveedor_error', 'nombre_sistema_proveedor'], 'uk_sistema_proveedor_nombre');
            $table->index('id_proveedor_error', 'idx_sistema_proveedor');
            $table->index('estatus_activo', 'idx_sistema_proveedor_estatus');
        });

        Schema::create(SchemaTable::helpdesk('tableMA_ModulosSIHO'), function (Blueprint $table) {
            $table->bigIncrements('id_modulo_siho');

            $table->string('nombre_modulo', 150);

            $table->boolean('estatus_activo')->default(true);
            $table->timestamps();

            $table->unique('nombre_modulo', 'uk_modulo_siho_nombre');
            $table->index('estatus_activo', 'idx_modulo_siho_estatus');
        });

        Schema::create(SchemaTable::helpdesk('tableMA_ErroresProveedor'), function (Blueprint $table) {
            $table->bigIncrements('id_error_proveedor');

            $table->unsignedBigInteger('id_ticket');

            // Quién causó el error y quién lo resuelve. Ambos salen del mismo
            // catálogo.
            $table->unsignedBigInteger('id_proveedor_error');
            $table->unsignedBigInteger('id_soluciona_error')->nullable();

            // Solo se llenan cuando el proveedor trae `requiere_sistema`.
            $table->unsignedBigInteger('id_sistema')->nullable();
            $table->string('no_ticket_externo', 60)->nullable();
            $table->unsignedBigInteger('id_modulo_sistema')->nullable();
            $table->boolean('personal_sac')->nullable();

            $table->timestamps();

            $table->foreign('id_ticket')->references('id_ticket')->on(SchemaTable::helpdesk('tableMA_Tickets'))->onDelete('cascade');
            $table->foreign('id_proveedor_error')->references('id_proveedor_error')->on(SchemaTable::helpdesk('tableMA_ProveedoresError'))->onDelete('restrict');
            $table->foreign('id_soluciona_error')->references('id_proveedor_error')->on(SchemaTable::helpdesk('tableMA_ProveedoresError'))->onDelete('set null');
            $table->foreign('id_sistema')->references('id_sistema_proveedor')->on(SchemaTable::helpdesk('tableMA_SistemasProveedor'))->onDelete('set null');
            $table->foreign('id_modulo_sistema')->references('id_modulo_siho')->on(SchemaTable::helpdesk('tableMA_ModulosSIHO'))->onDelete('set null');

            // Una fila por ticket: el detalle muestra un error, no una lista.
            $table->unique('id_ticket', 'uk_error_proveedor_ticket');
            $table->index('id_proveedor_error', 'idx_error_proveedor');
            $table->index('id_soluciona_error', 'idx_error_soluciona');
        });

        // Los catálogos se capturan desde Configuración: la demo arranca vacía.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hijas primero: la principal referencia a las tres.
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_ErroresProveedor'));
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_ModulosSIHO'));
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_SistemasProveedor'));
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_ProveedoresError'));
    }
};
