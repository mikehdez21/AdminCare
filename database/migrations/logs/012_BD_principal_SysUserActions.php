<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Crear el esquema si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS logs');

        Schema::create('logs.tableLog_SysUserActions', function (Blueprint $table) {
            // Columnas de la tabla
            $table->id(); // Equivalente a 'id bigint primary key generated always as identity'
            $table->unsignedBigInteger('user_id')->nullable(false); // user_id bigint not null
            $table->unsignedBigInteger('empleado_id')->nullable(false); // empleado_id bigint not null
            $table->string('operation_type')->nullable(false); // operation_type text not null
            $table->text('operation_details')->nullable(); // operation_details text (permite NULL)
            $table->timestamp('timestamp')->useCurrent(); // timestamp with time zone default now()
            $table->string('signature')->nullable(false); // signature text not null

            // Claves foráneas
            $table->foreign('user_id')->references('id_usuario')->on('tableUsuarios')->onDelete('cascade');
            $table->foreign('empleado_id')->references('id_empleado')->on('tableEmpleados')->onDelete('cascade');

            // Opcional: Índices para mejorar el rendimiento
            $table->index('user_id');
            $table->index('empleado_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('logs.tableLog_SysUserActions');
        // Opcional: eliminar el esquema 'logs' y todas sus tablas
        DB::statement('DROP SCHEMA IF EXISTS logs CASCADE');
    }
};
