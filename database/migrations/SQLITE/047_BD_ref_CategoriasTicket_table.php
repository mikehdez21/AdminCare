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
        // Crear la tabla de categorías de tickets dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableRef_CategoriasTicket'), function (Blueprint $table) {
            // Identificador único de la categoría (clave primaria)
            $table->bigIncrements('id_categoria_ticket');

            // Nombre de la categoría (obligatorio)
            $table->string('nombre_categoria', 150);

            // Descripción de la categoría (opcional)
            $table->text('descripcion_categoria')->nullable();

            // Departamento responsable de atender la categoría (opcional)
            $table->unsignedBigInteger('id_departamento_default')->nullable();

            // Estatus activo o inactivo (booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at
            $table->timestamps();

            // Clave foránea: departamento responsable de la categoría
            $table->foreign('id_departamento_default')->references('id_departamento')->on('tableDepartamentos')->onDelete('set null');

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_categoria', 'idx_categoria_nombre');
            $table->index('estatus_activo', 'idx_categoria_estatus');
        });

        // Resolver dinámicamente los IDs de los departamentos responsables.
        // Se busca primero el nombre exacto y luego por prefijo (LIKE) porque en
        // el entorno el nombre real puede diferir del catálogo base
        // (ej: 'Sistemas' existe como 'Sistemas e Informática Administrativa').
        $departamentoId = function (string $nombre): ?int {
            $id = DB::table('tableDepartamentos')
                ->where('nombre_departamento', $nombre)
                ->value('id_departamento');

            if ($id === null) {
                $id = DB::table('tableDepartamentos')
                    ->where('nombre_departamento', 'like', $nombre.'%')
                    ->value('id_departamento');
            }

            return $id === null ? null : (int) $id;
        };

        $idSistemas = $departamentoId('Sistemas');
        $idServiciosGenerales = $departamentoId('Servicios Generales');
        $idMantenimiento = $departamentoId('Mantenimiento');
        $idBiomedica = $departamentoId('Biomedica');

        // Insertar las categorías iniciales: una por departamento responsable
        DB::table(SchemaTable::helpdesk('tableRef_CategoriasTicket'))->insert([
            [
                'nombre_categoria' => 'Sistemas',
                'descripcion_categoria' => 'Soporte de sistemas, hardware y tecnología de la información',
                'id_departamento_default' => $idSistemas,
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_categoria' => 'Servicios Generales',
                'descripcion_categoria' => 'Servicios generales de limpieza, orden y mantenimiento menor',
                'id_departamento_default' => $idServiciosGenerales,
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_categoria' => 'Mantenimiento',
                'descripcion_categoria' => 'Reparaciones y mantenimiento de equipo e instalaciones',
                'id_departamento_default' => $idMantenimiento,
                'estatus_activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_categoria' => 'Biomédica',
                'descripcion_categoria' => 'Soporte y mantenimiento de equipo biomédico',
                'id_departamento_default' => $idBiomedica,
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
        // Eliminar la tabla de categorías de tickets
        Schema::dropIfExists(SchemaTable::helpdesk('tableRef_CategoriasTicket'));
    }
};
