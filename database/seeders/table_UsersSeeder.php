<?php

namespace Database\Seeders;

use App\Models\User;
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
            'id_empleado' => 1,
            'id_departamento' => 1,
        ]);

        $roleAdmin = Role::where('name', 'Admin')->first();
        if ($roleAdmin) {
            $user1->assignRole($roleAdmin);
        }
    }
}
