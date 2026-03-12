<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crear el esquema si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        // Crear la tabla de proveedores dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableAF_Proveedores', function (Blueprint $table) {
            // Identificador único del proveedor (clave primaria)
            $table->bigIncrements('id_proveedor')->primary();

            // Nombre del proveedor (cadena de texto, obligatorio)
            $table->string('nombre_proveedor');

            // Razón social del proveedor (cadena de texto, obligatorio)
            $table->string('razon_social');

            // Correo electrónico del proveedor (cadena de texto, único, obligatorio)
            $table->string('email_proveedor')->unique();

            // Número de teléfono del proveedor (cadena de texto, obligatorio)
            $table->string('telefono_proveedor');

            // Sitio web del proveedor (cadena de texto, opcional)
            $table->string('sitioWeb')->nullable();

            // RFC del proveedor (cadena de texto, obligatorio)
            $table->string('rfc');

            // Estatus Activo
            $table->boolean('estatus_activo')->default(true);

            // Moneda en la que opera el proveedor (cadena de texto, opcional)
            $table->foreignId('id_tipo_moneda')->constrained('almacengeneral.tableRef_TiposMonedas', 'id_tipomoneda')->onDelete('set null');

            // Clave foránea que relaciona el tipo de proveedor
            $table->foreignId('id_tipo_proveedor')->constrained('almacengeneral.tableRef_TiposProveedor', 'id_tipoproveedor')->onDelete('set null');

            // Clave foránea que relaciona la forma de pago proveedor
            $table->foreignId('id_forma_pago')->constrained('almacengeneral.tableRef_FormasPago', 'id_formapago')->onDelete('set null');

            // Clave foránea que relaciona el tipo de régimen del proveedor
            $table->foreignId('id_tipo_regimen')->constrained('almacengeneral.tableRef_RegimenFiscales', 'id_regimenfiscal')->onDelete('set null');

            // Clave foránea que relaciona el tipo de descuento del proveedor
            $table->foreignId('id_tipo_descuento')->constrained('almacengeneral.tableRef_DescuentoProveedor', 'id_descuento_proveedor')->onDelete('set null');

            // Clave foránea que relaciona el tipo de facturación del proveedor
            $table->foreignId('id_tipo_facturacion')->constrained('almacengeneral.tableRef_TiposFacturacion', 'id_tipofacturacion')->onDelete('set null');

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_proveedor'); // Índice para búsquedas por nombre
            $table->index('rfc'); // Índice para búsquedas por RFC
        });
    }

    public function down(): void
    {

        // Eliminar la tabla de clasificaciones
        Schema::dropIfExists('almacengeneral.tableAF_Proveedores');
    }
};
