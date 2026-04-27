<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use App\Models\Empleado;

class table_EmpleadosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Registro principal (ejemplo)
        Empleado::create([
            'nombre_empleado' => 'Administrador',
            'apellido_paterno' => 'AdminPaterno',
            'apellido_materno' => 'AdminMaterno',
            'email_empleado' => 'admin@email.com',
            'telefono_empleado' => '3311223344',
            'genero' => 'Masculino',
            'fecha_nacimiento' => '1990-01-01',
            'estatus_activo' => true,
            'fecha_alta' => now(),
            'fecha_baja' => null,
            'foto_empleado' => 'fotosEmpleados/defaultProfile.png',
            'firma_movimientos' => Hash::make('firma_movimientos'),
            'id_departamento' => 1 // Administración
        ]);
    }
}
