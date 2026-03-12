<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class table_UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuario 1: Admin
        $user1 = User::create([
            'nombre_usuario' => 'HSSAdmin',
            'email_usuario' => 'hssadmin@hospitalsanserafin.com',
            'password' => Hash::make('12341234'),
            'estatus_activo' => true,
            'fecha_baja' => null,
            'usuario_compartido' => false,
            'id_departamento' => 1,
        ]);

        $roleAdmin = Role::where('name', 'Admin')->first();
        if ($roleAdmin) {
            $user1->assignRole($roleAdmin);
        }

        // Usuario 2: Jefatura de Almacén
        $user2 = User::create([
            'nombre_usuario' => 'JefaturaAlmacen',
            'email_usuario' => 'jefatura.almacen@hospitalsanserafin.com',
            'password' => Hash::make('12341234'),
            'estatus_activo' => true,
            'fecha_baja' => null,
            'usuario_compartido' => false,
            'id_departamento' => 2,
        ]);

        $roleJefeAlmacen = Role::where('name', 'Jefatura de Almacén')->first();
        if ($roleJefeAlmacen) {
            $user2->assignRole($roleJefeAlmacen);
        }

        // Usuario 3: Empleado de Sistemas
        $user3 = User::create([
            'nombre_usuario' => 'EmpleadoSistemas',
            'email_usuario' => 'empleado.sistemas@hospitalsanserafin.com',
            'password' => Hash::make('12341234'),
            'estatus_activo' => true,
            'fecha_baja' => null,
            'usuario_compartido' => false,
            'id_departamento' => 3,
        ]);

        $roleEmpleadoSistemas = Role::where('name', 'Empleado de Sistemas')->first();
        if ($roleEmpleadoSistemas) {
            $user3->assignRole($roleEmpleadoSistemas);
        }

        // Usuario 4: Jefatura de Contabilidad
        $user4 = User::create([
            'nombre_usuario' => 'JefaturaContabilidad',
            'email_usuario' => 'jefatura.contabilidad@hospitalsanserafin.com',
            'password' => Hash::make('12341234'),
            'estatus_activo' => true,
            'fecha_baja' => null,
            'usuario_compartido' => false,
            'id_departamento' => 4,
        ]);

        $roleJefeContabilidad = Role::where('name', 'Jefatura de Contabilidad')->first();
        if ($roleJefeContabilidad) {
            $user4->assignRole($roleJefeContabilidad);
        }

        // Usuario 5: Auditor
        $user5 = User::create([
            'nombre_usuario' => 'Auditor',
            'email_usuario' => 'auditor@hospitalsanserafin.com',
            'password' => Hash::make('12341234'),
            'estatus_activo' => true,
            'fecha_baja' => null,
            'usuario_compartido' => false,
            'id_departamento' => 5,
        ]);

        $roleAuditor = Role::where('name', 'Auditor')->first();
        if ($roleAuditor) {
            $user5->assignRole($roleAuditor);
        }
    }
}
