<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;

class table_RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'Admin',             // Tiene todos los permisos
            'Jefatura de Almacén',   // Gestiona inventario, aprueba solicitudes
            'Empleado de Almacén', // Registra entradas/salidas de productos
            'Jefatura de Sistemas', // Supervisa solicitudes de su área
            'Empleado de Sistemas', // Registra entradas/salidas de productos
            'Jefatura de Contabilidad',      // Ver reportes, auditoría de inventario
            'Jefatura de Recursos Humanos',  // Gestiona empleados, usuarios
            'Auditor',           // Solo lectura, sin cambios
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
        }
    }
}
