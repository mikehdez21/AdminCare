<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Departamento;

class table_DepartamentosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departamentos = [
            ['nombre_departamento' => 'Administración', 'descripcion' => 'Encargado de la gestión administrativa general', 'atiende_pacientes' => false, 'estatus_activo' => true],
            ['nombre_departamento' => 'Sistemas', 'descripcion' => 'Responsable del manejo de sistemas y tecnología', 'atiende_pacientes' => false, 'estatus_activo' => true],
            ['nombre_departamento' => 'Recursos Humanos', 'descripcion' => 'Gestiona el personal y contrataciones', 'atiende_pacientes' => false, 'estatus_activo' => true],
            ['nombre_departamento' => 'Contabilidad', 'descripcion' => 'Manejo de finanzas y contabilidad', 'atiende_pacientes' => false, 'estatus_activo' => true],
            ['nombre_departamento' => 'Almacén', 'descripcion' => 'Encargado del control de inventario y suministros', 'atiende_pacientes' => false, 'estatus_activo' => true],
            ['nombre_departamento' => 'Mantenimiento', 'descripcion' => 'Soporte técnico y mantenimiento físico', 'atiende_pacientes' => false, 'estatus_activo' => true],
            ['nombre_departamento' => 'Servicio Médico', 'descripcion' => 'Área encargada de atención médica', 'atiende_pacientes' => true, 'estatus_activo' => true],
            ['nombre_departamento' => 'Enfermería', 'descripcion' => 'Personal encargado del cuidado de pacientes', 'atiende_pacientes' => true, 'estatus_activo' => true],
            ['nombre_departamento' => 'Auditoría', 'descripcion' => 'Control interno y revisión de procesos', 'atiende_pacientes' => false, 'estatus_activo' => true]
        ];

        foreach ($departamentos as $depto) {
            Departamento::firstOrCreate(
                ['nombre_departamento' => $depto['nombre_departamento']], // condición para evitar duplicados
                $depto // datos a insertar si no existe
            );
        }
    }
}
