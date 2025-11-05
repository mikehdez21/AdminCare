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
            'nombre_empleado' => 'TestName',
            'apellido_paterno' => 'TestPaterno',
            'apellido_materno' => 'TestMaterno',
            'email_empleado' => 'test@email.com',
            'telefono_empleado' => '3311223344',
            'genero' => 'Masculino',
            'fecha_nacimiento' => '1990-01-01',
            'estatus_activo' => true,
            'fecha_alta' => now(),
            'fecha_baja' => null,
            'foto_empleado' => 'ruta/foto.jpg',
            'firma_movimientos' => Hash::make('firma_movimientos'),
            'id_departamento' => 1 // Administración
        ]);

        // Lista de empleados distribuidos por departamento
        $empleados = [
            [
                'nombre_empleado' => 'Carlos',
                'apellido_paterno' => 'Méndez',
                'apellido_materno' => 'López',
                'email_empleado' => 'carlos.mendez@example.com',
                'telefono_empleado' => '3322334455',
                'genero' => 'Masculino',
                'fecha_nacimiento' => '1988-05-15',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/carlos.jpg',
                'firma_movimientos' => Hash::make('firma_001'),
                'id_departamento' => 2 // Sistemas
            ],
            [
                'nombre_empleado' => 'Ana',
                'apellido_paterno' => 'Martínez',
                'apellido_materno' => 'García',
                'email_empleado' => 'ana.martinez@example.com',
                'telefono_empleado' => '3344556677',
                'genero' => 'Femenino',
                'fecha_nacimiento' => '1992-08-22',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/ana.jpg',
                'firma_movimientos' => Hash::make('firma_002'),
                'id_departamento' => 3 // Recursos Humanos
            ],
            [
                'nombre_empleado' => 'Luis',
                'apellido_paterno' => 'Hernández',
                'apellido_materno' => 'Pérez',
                'email_empleado' => 'luis.hernandez@example.com',
                'telefono_empleado' => '3355667788',
                'genero' => 'Masculino',
                'fecha_nacimiento' => '1985-03-10',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/luis.jpg',
                'firma_movimientos' => Hash::make('firma_003'),
                'id_departamento' => 4 // Contabilidad
            ],
            [
                'nombre_empleado' => 'María',
                'apellido_paterno' => 'Castro',
                'apellido_materno' => 'Ramírez',
                'email_empleado' => 'maria.castro@example.com',
                'telefono_empleado' => '3366778899',
                'genero' => 'Femenino',
                'fecha_nacimiento' => '1995-11-30',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/maria.jpg',
                'firma_movimientos' => Hash::make('firma_004'),
                'id_departamento' => 5 // Almacén
            ],
            [
                'nombre_empleado' => 'Javier',
                'apellido_paterno' => 'Luna',
                'apellido_materno' => 'Sánchez',
                'email_empleado' => 'javier.luna@example.com',
                'telefono_empleado' => '3377889900',
                'genero' => 'Masculino',
                'fecha_nacimiento' => '1987-07-25',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/javier.jpg',
                'firma_movimientos' => Hash::make('firma_005'),
                'id_departamento' => 6 // Mantenimiento
            ],
            [
                'nombre_empleado' => 'Sofía',
                'apellido_paterno' => 'Ortega',
                'apellido_materno' => 'Flores',
                'email_empleado' => 'sofia.ortega@example.com',
                'telefono_empleado' => '3388990011',
                'genero' => 'Femenino',
                'fecha_nacimiento' => '1993-09-12',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/sofia.jpg',
                'firma_movimientos' => Hash::make('firma_006'),
                'id_departamento' => 7 // Servicio Médico
            ],
            [
                'nombre_empleado' => 'Pedro',
                'apellido_paterno' => 'Rojas',
                'apellido_materno' => 'Jiménez',
                'email_empleado' => 'pedro.rojas@example.com',
                'telefono_empleado' => '3399001122',
                'genero' => 'Masculino',
                'fecha_nacimiento' => '1989-04-18',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/pedro.jpg',
                'firma_movimientos' => Hash::make('firma_007'),
                'id_departamento' => 8 // Enfermería
            ],
            [
                'nombre_empleado' => 'Laura',
                'apellido_paterno' => 'Vargas',
                'apellido_materno' => 'Mendoza',
                'email_empleado' => 'laura.vargas@example.com',
                'telefono_empleado' => '3300112233',
                'genero' => 'Femenino',
                'fecha_nacimiento' => '1991-06-05',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/laura.jpg',
                'firma_movimientos' => Hash::make('firma_008'),
                'id_departamento' => 9 // Auditoría
            ],
            [
                'nombre_empleado' => 'Diego',
                'apellido_paterno' => 'Silva',
                'apellido_materno' => 'Castillo',
                'email_empleado' => 'diego.silva@example.com',
                'telefono_empleado' => '3311224455',
                'genero' => 'Masculino',
                'fecha_nacimiento' => '1986-12-14',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/diego.jpg',
                'firma_movimientos' => Hash::make('firma_009'),
                'id_departamento' => 2 // Sistemas
            ],
            [
                'nombre_empleado' => 'Elena',
                'apellido_paterno' => 'Cruz',
                'apellido_materno' => 'Navarro',
                'email_empleado' => 'elena.cruz@example.com',
                'telefono_empleado' => '3322335566',
                'genero' => 'Femenino',
                'fecha_nacimiento' => '1994-02-28',
                'estatus_activo' => true,
                'fecha_alta' => now(),
                'fecha_baja' => null,
                'foto_empleado' => 'fotos/elena.jpg',
                'firma_movimientos' => Hash::make('firma_010'),
                'id_departamento' => 5 // Almacén
            ],
        ];

        foreach ($empleados as $empleado) {
            Empleado::create($empleado);
        }
    }
}
