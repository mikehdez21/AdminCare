<?php

namespace Database\Seeders;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\User;
use App\Support\SchemaTable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Datos sintéticos del Helpdesk para la demo.
 *
 * Corre después de `DemoSeeder`: usa los departamentos, empleados y usuarios
 * base que ese seeder deja creados. Inserta con `DB` en vez de los servicios
 * para fijar fechas y estados históricos sin disparar correos ni observer.
 */
class DemoHelpdeskSeeder extends Seeder
{
    public function run(): void
    {
        if ($this->yaSembrado()) {
            return;
        }

        $roles = $this->sembrarRoles();
        $departamentos = $this->sembrarDepartamentos();
        $empleados = $this->sembrarEmpleados($departamentos);
        $usuarios = $this->sembrarUsuarios($departamentos, $empleados, $roles);

        $this->enlazarCategorias($departamentos);

        $proveedorDemo = $this->sembrarProveedorDemo($departamentos['Sistemas']->id_departamento);

        $this->sembrarTickets($usuarios, $empleados, $proveedorDemo);
    }

    private function yaSembrado(): bool
    {
        $tabla = SchemaTable::helpdesk('tableMA_Tickets');

        $sembrados = DB::table($tabla)
            ->where('folio_ticket', 'like', 'TK-2026-%')
            ->count();

        if ($sembrados >= 12) {
            return true;
        }

        // Una corrida anterior pudo quedar a medias. Se limpian solo los folios
        // demo para poder reintentar el seeder sin duplicarlos.
        if ($sembrados > 0) {
            DB::table($tabla)
                ->where('folio_ticket', 'like', 'TK-2026-%')
                ->delete();
        }

        return false;
    }

    /**
     * @return array<string, Role>
     */
    private function sembrarRoles(): array
    {
        $base = [
            'helpdesk.mis_tickets.lectura',
            'helpdesk.mis_tickets.escritura',
            'catalogos.ubicaciones.lectura',
            'catalogos.empleados.lectura',
        ];

        $tecnico = [
            'helpdesk.tickets.lectura',
            'helpdesk.tickets.escritura',
            ...$base,
        ];

        $roles = [
            'sol' => $this->rol('UsuarioBase', $base),
            'tecnico' => $this->rol('TecnicoHelpdesk', $tecnico),
            'jefatura' => $this->rol('JefaturaHelpdesk', [
                ...$tecnico,
                'helpdesk.reportes.lectura',
            ]),
        ];

        return $roles;
    }

    /**
     * @param  array<int, string>  $permisos
     */
    private function rol(string $nombre, array $permisos): Role
    {
        $rol = Role::firstOrCreate(['name' => $nombre, 'guard_name' => 'web']);

        $rol->syncPermissions(
            Permission::query()
                ->whereIn('name', $permisos)
                ->where('guard_name', 'web')
                ->get()
                ->all()
        );

        return $rol;
    }

    /**
     * @return array<string, Departamento>
     */
    private function sembrarDepartamentos(): array
    {
        $definiciones = [
            'Sistemas' => 'Soporte de sistemas, hardware y tecnología de la información',
            'Servicios Generales' => 'Limpieza, orden y mantenimiento menor de las áreas',
            'Mantenimiento' => 'Reparaciones y mantenimiento de equipos e instalaciones',
            'Biomédica' => 'Soporte y mantenimiento de equipo biomédico',
        ];

        $departamentos = [];

        foreach ($definiciones as $nombre => $descripcion) {
            $departamentos[$nombre] = Departamento::updateOrCreate(
                ['nombre_departamento' => $nombre],
                [
                    'descripcion' => $descripcion,
                    'atiende_pacientes' => false,
                    'atiende_helpdesk' => true,
                    'estatus_activo' => true,
                ]
            );
        }

        return $departamentos;
    }

    /**
     * @param  array<string, Departamento>  $departamentos
     * @return array<string, Empleado>
     */
    private function sembrarEmpleados(array $departamentos): array
    {
        $operaciones = Departamento::where('nombre_departamento', 'Operaciones')->firstOrFail();

        $definiciones = [
            'sol' => ['Solicitante Demo', $operaciones, 'Femenino', '1992-04-18'],
            'tecnico' => ['Tecnico Demo', 'Sistemas', 'Masculino', '1991-06-12'],
            'mantenimiento' => ['Tecnico Mantenimiento', 'Mantenimiento', 'Masculino', '1990-02-20'],
            'servicios' => ['Tecnico Servicios Generales', 'Servicios Generales', 'Femenino', '1993-09-08'],
            'biomedica' => ['Tecnico Biomedica', 'Biomédica', 'Masculino', '1989-11-30'],
        ];

        $empleados = [];

        foreach ($definiciones as $llave => [$nombre, $departamento, $genero, $nacimiento]) {
            $empleados[$llave] = Empleado::updateOrCreate(
                ['nombre_empleado' => $nombre],
                [
                    'apellido_paterno' => 'Demo',
                    'apellido_materno' => 'Helpdesk',
                    'genero' => $genero,
                    'fecha_nacimiento' => $nacimiento,
                    'estatus_activo' => true,
                    'jefatura_empleado' => false,
                    'fecha_alta' => '2025-01-15 09:00:00',
                    'fecha_baja' => null,
                    'foto_empleado' => null,
                    'id_departamento' => $departamento instanceof Departamento
                        ? $departamento->id_departamento
                        : $departamentos[$departamento]->id_departamento,
                ]
            );
        }

        return $empleados;
    }

    /**
     * @param  array<string, Departamento>  $departamentos
     * @param  array<string, Empleado>  $empleados
     * @param  array<string, Role>  $roles
     * @return array<string, User>
     */
    private function sembrarUsuarios(array $departamentos, array $empleados, array $roles): array
    {
        $operaciones = Departamento::where('nombre_departamento', 'Operaciones')->firstOrFail();

        $solicitante = User::updateOrCreate(
            ['nombre_usuario' => 'DEMOSOL'],
            [
                'email_usuario' => 'demo.solicitante@example.invalid',
                'password' => Hash::make('demosol'),
                'estatus_activo' => true,
                'fecha_baja' => null,
                'usuario_compartido' => false,
                'atiende_helpdesk' => false,
                'id_empleado' => $empleados['sol']->id_empleado,
                'id_departamento' => $operaciones->id_departamento,
            ]
        );
        $solicitante->syncRoles([$roles['sol']]);

        $tecnico = User::updateOrCreate(
            ['nombre_usuario' => 'DEMOTEC'],
            [
                'email_usuario' => 'demo.tecnico@example.invalid',
                'password' => Hash::make('demotec'),
                'estatus_activo' => true,
                'fecha_baja' => null,
                'usuario_compartido' => false,
                'atiende_helpdesk' => true,
                'id_empleado' => $empleados['tecnico']->id_empleado,
                'id_departamento' => $departamentos['Sistemas']->id_departamento,
            ]
        );
        $tecnico->syncRoles([$roles['tecnico']]);

        return [
            'sol' => $solicitante->fresh(),
            'tec' => $tecnico->fresh(),
            'admin' => User::where('nombre_usuario', 'DEMOADMIN')->firstOrFail(),
            'almacen' => User::where('nombre_usuario', 'DEMOALMACEN')->firstOrFail(),
        ];
    }

    /**
     * @param  array<string, Departamento>  $departamentos
     */
    private function enlazarCategorias(array $departamentos): void
    {
        $categorias = [
            'Sistemas' => 'Sistemas',
            'Servicios Generales' => 'Servicios Generales',
            'Mantenimiento' => 'Mantenimiento',
            'Biomédica' => 'Biomédica',
        ];

        foreach ($categorias as $categoria => $departamento) {
            DB::table(SchemaTable::helpdesk('tableRef_CategoriasTicket'))
                ->where('nombre_categoria', $categoria)
                ->update([
                    'id_departamento_default' => $departamentos[$departamento]->id_departamento,
                    'updated_at' => now(),
                ]);
        }
    }

    private function sembrarProveedorDemo(int $idDepartamento): int
    {
        $tabla = SchemaTable::helpdesk('tableMA_ProveedoresError');

        $existente = DB::table($tabla)
            ->where('nombre_proveedor_error', 'Soporte Externo Demo')
            ->value('id_proveedor_error');

        if ($existente !== null) {
            return (int) $existente;
        }

        return (int) DB::table($tabla)->insertGetId([
            'nombre_proveedor_error' => 'Soporte Externo Demo',
            'id_departamento' => $idDepartamento,
            'requiere_sistema' => false,
            'estatus_activo' => true,
            'created_at' => '2026-01-15 09:00:00',
            'updated_at' => '2026-01-15 09:00:00',
        ], 'id_proveedor_error');
    }

    /**
     * @param  array<string, User>  $usuarios
     * @param  array<string, Empleado>  $empleados
     */
    private function sembrarTickets(array $usuarios, array $empleados, int $proveedorDemo): void
    {
        $titulos = $this->mapaTitulos();
        $estatus = DB::table(SchemaTable::helpdesk('tableRef_EstatusTicket'))->pluck('id_estatus_ticket', 'nombre_estatus');
        $prioridades = DB::table(SchemaTable::helpdesk('tableRef_PrioridadesTicket'))->pluck('id_prioridad_ticket', 'nombre_prioridad');
        $slas = DB::table(SchemaTable::helpdesk('tableRef_SLANiveles').' as s')
            ->join(SchemaTable::helpdesk('tableRef_PrioridadesTicket').' as p', 'p.id_prioridad_ticket', '=', 's.id_prioridad_ticket')
            ->get(['p.nombre_prioridad', 's.tiempo_respuesta_horas', 's.tiempo_resolucion_horas'])
            ->keyBy('nombre_prioridad');
        $etiquetas = DB::table(SchemaTable::helpdesk('tableMA_Etiquetas'))->pluck('id_etiqueta', 'nombre_etiqueta');
        $ubicacion = DB::table('tableUbicaciones')->value('id_ubicacion');

        $tickets = [
            [
                'folio' => 'TK-2026-0001',
                'titulo' => ['Sistemas', 'SIHO (ERP interno)', 'No puedo facturar'],
                'descripcion' => 'Al intentar generar una factura en SIHO, el sistema muestra un error y no permite continuar con el proceso de facturación.',
                'prioridad' => 'Alta',
                'estatus' => 'Abierto',
                'solicitante' => 'sol',
                'responsable' => null,
                'fecha' => '2026-11-03 09:15:00',
                'etiquetas' => ['Urgente'],
            ],
            [
                'folio' => 'TK-2026-0002',
                'titulo' => ['Servicios Generales', 'Limpieza', 'Limpieza de baños'],
                'descripcion' => 'El baño del área de consulta externa requiere limpieza profunda y reposición de material.',
                'prioridad' => 'Baja',
                'estatus' => 'Abierto',
                'solicitante' => 'sol',
                'responsable' => null,
                'fecha' => '2026-11-05 11:40:00',
                'etiquetas' => ['Repetitivo'],
            ],
            [
                'folio' => 'TK-2026-0003',
                'titulo' => ['Mantenimiento', 'Correctiva', 'Fuga de agua'],
                'descripcion' => 'Se detectó una fuga de agua debajo del lavabo del baño de visitas. El piso permanece mojado.',
                'prioridad' => 'Media',
                'estatus' => 'Asignado',
                'solicitante' => 'sol',
                'responsable' => 'mantenimiento',
                'fecha' => '2026-10-28 08:30:00',
                'asignado_at' => '2026-10-28 09:00:00',
                'etiquetas' => ['Requiere compra'],
                'avances' => [
                    ['texto' => 'Se revisó la instalación y se solicitó el material necesario para la reparación.', 'interno' => true, 'fecha' => '2026-10-28 09:30:00', 'autor' => 'tec'],
                ],
            ],
            [
                'folio' => 'TK-2026-0004',
                'titulo' => ['Sistemas', 'ECE (Expediente Electronico Web Hospitalario)', 'No aparece el paciente'],
                'descripcion' => 'Al buscar un paciente en ECE no aparece en el listado, aunque el expediente existe en el sistema.',
                'prioridad' => 'Alta',
                'estatus' => 'En Proceso',
                'solicitante' => 'sol',
                'responsable' => 'tecnico',
                'fecha' => '2026-10-30 10:00:00',
                'asignado_at' => '2026-10-30 10:10:00',
                'primera_respuesta' => '2026-10-30 10:45:00',
                'etiquetas' => ['Urgente'],
                'avances' => [
                    ['texto' => 'Se reinició el servicio de búsqueda y se validó la conexión con la base de datos.', 'interno' => false, 'fecha' => '2026-10-30 11:00:00', 'autor' => 'tec'],
                    ['texto' => 'Se revisó el log y no hay errores de índice; se solicita prueba con otro usuario.', 'interno' => true, 'fecha' => '2026-10-30 11:20:00', 'autor' => 'tec'],
                ],
            ],
            [
                'folio' => 'TK-2026-0005',
                'titulo' => ['Biomédica', 'Correctiva', 'Equipo no enciende'],
                'descripcion' => 'El monitor de signos vitales de la sala de observación no enciende al conectarlo a la corriente.',
                'prioridad' => 'Crítica',
                'estatus' => 'En Proceso',
                'solicitante' => 'admin',
                'responsable' => 'biomedica',
                'fecha' => '2026-11-06 07:50:00',
                'asignado_at' => '2026-11-06 08:00:00',
                'primera_respuesta' => '2026-11-06 08:05:00',
                'etiquetas' => ['Urgente'],
                'avances' => [
                    ['texto' => 'Se revisó la fuente de alimentación y se canalizó con el proveedor del equipo.', 'interno' => false, 'fecha' => '2026-11-06 08:30:00', 'autor' => 'admin'],
                ],
            ],
            [
                'folio' => 'TK-2026-0006',
                'titulo' => ['Sistemas', 'Correctiva', 'Falla de Impresora'],
                'descripcion' => 'La impresora del área administrativa no responde y los documentos se quedan en la cola de impresión.',
                'prioridad' => 'Media',
                'estatus' => 'Pendiente',
                'solicitante' => 'sol',
                'responsable' => 'tecnico',
                'fecha' => '2026-10-20 14:10:00',
                'asignado_at' => '2026-10-20 14:20:00',
                'primera_respuesta' => '2026-10-20 15:00:00',
                'pendiente_at' => '2026-10-21 09:00:00',
                'avances' => [
                    ['texto' => 'Se solicita al área confirmar si la impresora tiene papel y tóner antes de agendar la visita.', 'interno' => true, 'fecha' => '2026-10-21 09:00:00', 'autor' => 'tec'],
                ],
            ],
            [
                'folio' => 'TK-2026-0007',
                'titulo' => ['Sistemas', 'SIHO (ERP interno)', 'Reporte no genera'],
                'descripcion' => 'El reporte de ventas del mes se queda cargando y no genera el archivo para descarga.',
                'prioridad' => 'Media',
                'estatus' => 'Resuelto',
                'solicitante' => 'sol',
                'responsable' => 'tecnico',
                'fecha' => '2026-09-15 09:00:00',
                'asignado_at' => '2026-09-15 09:10:00',
                'primera_respuesta' => '2026-09-15 09:30:00',
                'resolucion' => '2026-09-16 12:00:00',
                'etiquetas' => ['Garantía'],
                'avances' => [
                    ['texto' => 'Se identificó que el rango de fechas incluía un mes sin cierre contable.', 'interno' => false, 'fecha' => '2026-09-15 09:40:00', 'autor' => 'tec'],
                    ['texto' => 'Se ajustó la consulta y el reporte quedó disponible para el usuario.', 'interno' => false, 'fecha' => '2026-09-16 11:30:00', 'autor' => 'tec'],
                ],
            ],
            [
                'folio' => 'TK-2026-0008',
                'titulo' => ['Mantenimiento', 'Preventiva', 'Mantenimiento programado'],
                'descripcion' => 'Se requiere mantenimiento preventivo del sistema de aire acondicionado del área de espera.',
                'prioridad' => 'Baja',
                'estatus' => 'Cerrado',
                'solicitante' => 'sol',
                'responsable' => 'mantenimiento',
                'fecha' => '2026-08-12 10:00:00',
                'asignado_at' => '2026-08-12 10:10:00',
                'primera_respuesta' => '2026-08-12 10:30:00',
                'resolucion' => '2026-08-14 16:00:00',
                'cierre' => '2026-08-15 09:00:00',
                'etiquetas' => ['Requiere compra'],
                'avances' => [
                    ['texto' => 'Se realizó la limpieza de filtros y la revisión general del equipo.', 'interno' => false, 'fecha' => '2026-08-14 15:30:00', 'autor' => 'tec'],
                ],
                'encuesta' => ['calificacion' => 4, 'comentario' => 'Buen tiempo de respuesta y el área quedó en condiciones.', 'fecha' => '2026-08-15 10:00:00'],
            ],
            [
                'folio' => 'TK-2026-0009',
                'titulo' => ['Servicios Generales', 'Limpieza', 'Limpieza de áreas'],
                'descripcion' => 'El área de recepción requiere limpieza y retiro de basura después del horario de visitas.',
                'prioridad' => 'Media',
                'estatus' => 'Cerrado',
                'solicitante' => 'almacen',
                'responsable' => 'servicios',
                'fecha' => '2026-07-18 08:00:00',
                'asignado_at' => '2026-07-18 08:05:00',
                'primera_respuesta' => '2026-07-18 08:20:00',
                'resolucion' => '2026-07-18 13:00:00',
                'cierre' => '2026-07-19 09:00:00',
                'etiquetas' => ['Repetitivo'],
                'avances' => [
                    ['texto' => 'Se programó la limpieza con el turno de la tarde.', 'interno' => true, 'fecha' => '2026-07-18 08:10:00', 'autor' => 'admin'],
                    ['texto' => 'Se limpió el área y se retiraron los residuos.', 'interno' => false, 'fecha' => '2026-07-18 12:50:00', 'autor' => 'admin'],
                ],
                'encuesta' => ['calificacion' => 5, 'comentario' => 'Excelente limpieza y muy buen seguimiento.', 'fecha' => '2026-07-19 09:30:00'],
            ],
            [
                'folio' => 'TK-2026-0010',
                'titulo' => ['Sistemas', 'ECE (Expediente Electronico Web Hospitalario)', 'No guarda la nota'],
                'descripcion' => 'El personal médico reporta que la nota de evolución no se guarda y aparece un mensaje de error.',
                'prioridad' => 'Alta',
                'estatus' => 'En Proceso',
                'solicitante' => 'sol',
                'responsable' => 'tecnico',
                'fecha' => '2026-09-01 11:00:00',
                'primera_respuesta' => '2026-09-01 11:30:00',
                'fecha_reapertura' => '2026-09-10 09:00:00',
                'ticket_reapertura' => true,
                'etiquetas' => ['Urgente'],
                'avances' => [
                    ['texto' => 'Se reinició el servicio y se validó el guardado de notas en ambiente de prueba.', 'interno' => false, 'fecha' => '2026-09-01 11:45:00', 'autor' => 'tec'],
                    ['texto' => 'El usuario reporta que el error volvió a aparecer al cambiar de paciente.', 'interno' => false, 'fecha' => '2026-09-10 09:30:00', 'autor' => 'tec'],
                ],
                'historial' => [
                    ['tipo' => 'creacion', 'actor' => 'sol', 'anterior' => null, 'nuevo' => 'Abierto', 'descripcion' => 'Ticket creado.', 'fecha' => '2026-09-01 11:00:00'],
                    ['tipo' => 'asignacion_tecnico', 'actor' => 'admin', 'anterior' => null, 'nuevo' => 'Tecnico Demo', 'descripcion' => 'Ticket asignado a Tecnico Demo', 'fecha' => '2026-09-01 11:15:00'],
                    ['tipo' => 'cambio_estado', 'actor' => 'admin', 'anterior' => 'Abierto', 'nuevo' => 'Asignado', 'descripcion' => 'Asignación a Tecnico Demo', 'fecha' => '2026-09-01 11:15:00'],
                    ['tipo' => 'cambio_estado', 'actor' => 'tec', 'anterior' => 'Asignado', 'nuevo' => 'En Proceso', 'descripcion' => 'Se inició la revisión del error.', 'fecha' => '2026-09-01 11:30:00'],
                    ['tipo' => 'cambio_estado', 'actor' => 'tec', 'anterior' => 'En Proceso', 'nuevo' => 'Resuelto', 'descripcion' => 'Se aplicó una corrección temporal.', 'fecha' => '2026-09-02 17:00:00'],
                    ['tipo' => 'cambio_estado', 'actor' => 'tec', 'anterior' => 'Resuelto', 'nuevo' => 'Cerrado', 'descripcion' => 'Ticket cerrado.', 'fecha' => '2026-09-03 09:00:00'],
                    ['tipo' => 'reapertura', 'actor' => 'sol', 'anterior' => 'Cerrado', 'nuevo' => 'Abierto', 'descripcion' => 'El error volvió a aparecer al cambiar de paciente.', 'fecha' => '2026-09-10 09:00:00'],
                    ['tipo' => 'cambio_estado', 'actor' => 'tec', 'anterior' => 'Abierto', 'nuevo' => 'En Proceso', 'descripcion' => 'Se retomó la revisión del caso.', 'fecha' => '2026-09-10 09:20:00'],
                ],
                'updated_at' => '2026-09-10 09:20:00',
            ],
            [
                'folio' => 'TK-2026-0011',
                'titulo' => ['Sistemas', 'SIHO (ERP interno)', 'Corte de caja bloqueado'],
                'descripcion' => 'El corte de caja del turno matutino quedó bloqueado y no permite cerrar la caja para continuar operando.',
                'prioridad' => 'Crítica',
                'estatus' => 'Cerrado',
                'solicitante' => 'sol',
                'responsable' => 'tecnico',
                'fecha' => '2026-10-05 17:20:00',
                'asignado_at' => '2026-10-05 17:25:00',
                'primera_respuesta' => '2026-10-05 17:30:00',
                'resolucion' => '2026-10-05 20:00:00',
                'cierre' => '2026-10-06 09:00:00',
                'error_proveedor' => true,
                'etiquetas' => ['Externo'],
                'avances' => [
                    ['texto' => 'Se reportó el bloqueo al proveedor y se validó el estado de la caja.', 'interno' => false, 'fecha' => '2026-10-05 17:45:00', 'autor' => 'tec'],
                    ['texto' => 'El proveedor liberó el corte y se confirmó la operación de caja.', 'interno' => false, 'fecha' => '2026-10-06 08:50:00', 'autor' => 'tec'],
                ],
                'encuesta' => ['calificacion' => 3, 'comentario' => 'El proveedor resolvió, pero el tiempo de espera fue largo.', 'fecha' => '2026-10-06 09:30:00'],
            ],
            [
                'folio' => 'TK-2026-0012',
                'titulo' => ['Biomédica', 'Preventiva', 'Calibración programada'],
                'descripcion' => 'Se solicita la calibración programada del equipo de ultrasonido de la consulta externa.',
                'prioridad' => 'Media',
                'estatus' => 'Abierto',
                'solicitante' => 'admin',
                'responsable' => null,
                'fecha' => '2026-11-08 10:15:00',
                'etiquetas' => ['Garantía'],
            ],
        ];

        foreach ($tickets as $data) {
            $this->insertarTicket($data, $usuarios, $empleados, $titulos, $estatus, $prioridades, $slas, $etiquetas, $ubicacion, $proveedorDemo);
        }
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function mapaTitulos(): array
    {
        $filas = DB::table(SchemaTable::helpdesk('tableRef_TitulosTicket').' as t')
            ->join(SchemaTable::helpdesk('tableRef_SubcategoriasTicket').' as s', 's.id_subcategoria_ticket', '=', 't.id_subcategoria_ticket')
            ->join(SchemaTable::helpdesk('tableRef_CategoriasTicket').' as c', 'c.id_categoria_ticket', '=', 's.id_categoria_ticket')
            ->get([
                'c.nombre_categoria',
                's.nombre_subcategoria',
                't.nombre_titulo_ticket',
                't.id_titulo_ticket',
                't.id_subcategoria_ticket',
                'c.id_categoria_ticket',
            ]);

        return $filas->keyBy(
            fn ($fila) => $fila->nombre_categoria.'|'.$fila->nombre_subcategoria.'|'.$fila->nombre_titulo_ticket
        )->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, User>  $usuarios
     * @param  array<string, Empleado>  $empleados
     * @param  array<string, array<string, mixed>>  $titulos
     * @param  array<string, mixed>  $estatus
     * @param  array<string, mixed>  $prioridades
     * @param  array<string, mixed>  $slas
     * @param  array<string, mixed>  $etiquetas
     */
    private function insertarTicket(
        array $data,
        array $usuarios,
        array $empleados,
        array $titulos,
        $estatus,
        $prioridades,
        $slas,
        $etiquetas,
        ?int $ubicacion,
        int $proveedorDemo
    ): void {
        [$categoria, $subcategoria, $titulo] = $data['titulo'];
        $clave = $categoria.'|'.$subcategoria.'|'.$titulo;
        $catalogo = $titulos[$clave] ?? null;

        if ($catalogo === null) {
            throw new \RuntimeException('No se encontró el título de catálogo: '.$clave);
        }

        $creado = Carbon::parse($data['fecha']);
        $sla = $slas[$data['prioridad']];

        $responsable = $data['responsable'] === null
            ? null
            : $empleados[$data['responsable']];

        $ticketId = (int) DB::table(SchemaTable::helpdesk('tableMA_Tickets'))->insertGetId([
            'folio_ticket' => $data['folio'],
            'titulo_ticket' => $titulo,
            'descripcion_ticket' => $data['descripcion'],
            'id_categoria_ticket' => $catalogo->id_categoria_ticket,
            'id_subcategoria_ticket' => $catalogo->id_subcategoria_ticket,
            'id_titulo_ticket' => $catalogo->id_titulo_ticket,
            'id_prioridad_ticket' => $prioridades[$data['prioridad']],
            'id_estatus_ticket' => $estatus[$data['estatus']],
            'id_usuario_solicitante' => $usuarios[$data['solicitante']]->id_usuario,
            'id_empleado_solicitante' => $usuarios[$data['solicitante']]->id_empleado,
            'id_responsable' => $responsable?->id_empleado,
            'id_ubicacion' => $ubicacion,
            'error_proveedor' => (bool) ($data['error_proveedor'] ?? false),
            'fecha_primer_respuesta' => isset($data['primera_respuesta']) ? Carbon::parse($data['primera_respuesta']) : null,
            'fecha_resolucion' => isset($data['resolucion']) ? Carbon::parse($data['resolucion']) : null,
            'fecha_cierre' => isset($data['cierre']) ? Carbon::parse($data['cierre']) : null,
            'fecha_limite_respuesta' => $creado->copy()->addHours((float) $sla->tiempo_respuesta_horas),
            'fecha_limite_resolucion' => $creado->copy()->addHours((float) $sla->tiempo_resolucion_horas),
            'ticket_reapertura' => (bool) ($data['ticket_reapertura'] ?? false),
            'fecha_reapertura' => isset($data['fecha_reapertura']) ? Carbon::parse($data['fecha_reapertura']) : null,
            'created_at' => $creado,
            'updated_at' => isset($data['updated_at'])
                ? Carbon::parse($data['updated_at'])
                : Carbon::parse($data['cierre'] ?? $data['resolucion'] ?? $data['fecha_reapertura'] ?? $data['pendiente_at'] ?? $data['primera_respuesta'] ?? $data['asignado_at'] ?? $data['fecha']),
        ], 'id_ticket');

        if ($responsable !== null) {
            $asignado = Carbon::parse($data['asignado_at'] ?? $data['fecha']);

            DB::table(SchemaTable::helpdesk('tableInter_ticketsTecnicos'))->insert([
                'id_ticket' => $ticketId,
                'id_responsable' => $responsable->id_empleado,
                'id_tecnico_dos' => null,
                'id_tecnico_tres' => null,
                'id_tecnico_cuatro' => null,
                'id_tecnico_cinco' => null,
                'created_at' => $asignado,
                'updated_at' => $asignado,
            ]);
        }

        $this->sembrarHistorial($ticketId, $data, $usuarios, $responsable);

        foreach ($data['etiquetas'] ?? [] as $nombreEtiqueta) {
            if (isset($etiquetas[$nombreEtiqueta])) {
                DB::table(SchemaTable::helpdesk('tableInter_ticketsEtiquetas'))->insert([
                    'id_ticket' => $ticketId,
                    'id_etiqueta' => $etiquetas[$nombreEtiqueta],
                ]);
            }
        }

        foreach ($data['avances'] ?? [] as $avance) {
            $fecha = Carbon::parse($avance['fecha']);
            $autor = $usuarios[$avance['autor']];

            DB::table(SchemaTable::helpdesk('tableMA_AvancesTicket'))->insert([
                'id_ticket' => $ticketId,
                'id_usuario_autor' => $autor->id_usuario,
                'contenido_avance' => $avance['texto'],
                'es_interno' => (bool) $avance['interno'],
                'fecha_eliminado' => null,
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ]);

            $this->actividad(
                $ticketId,
                $autor->id_usuario,
                'avance_registrado',
                null,
                $avance['interno'] ? 'nota interna' : 'avance visible',
                'Avance registrado correctamente.',
                $fecha
            );
        }

        if (isset($data['encuesta'])) {
            $fecha = Carbon::parse($data['encuesta']['fecha']);

            DB::table(SchemaTable::helpdesk('tableMA_EncuestaSatisfaccion'))->insert([
                'id_ticket' => $ticketId,
                'calificacion' => $data['encuesta']['calificacion'],
                'comentario_satisfaccion' => $data['encuesta']['comentario'],
                'id_usuario_evaluador' => $usuarios[$data['solicitante']]->id_usuario,
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ]);
        }

        if ($data['error_proveedor'] ?? false) {
            $fecha = $creado->copy()->addMinutes(10);

            DB::table(SchemaTable::helpdesk('tableMA_ErroresProveedor'))->insert([
                'id_ticket' => $ticketId,
                'id_proveedor_error' => $proveedorDemo,
                'id_soluciona_error' => $proveedorDemo,
                'id_sistema' => null,
                'no_ticket_externo' => null,
                'id_modulo_sistema' => null,
                'personal_sac' => null,
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ]);

            $this->actividad(
                $ticketId,
                $usuarios['admin']->id_usuario,
                'error_proveedor',
                'No',
                'Sí',
                'Ticket marcado como error de proveedor.',
                $fecha
            );
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, User>  $usuarios
     */
    private function sembrarHistorial(int $ticketId, array $data, array $usuarios, ?Empleado $responsable): void
    {
        if (isset($data['historial'])) {
            foreach ($data['historial'] as $evento) {
                $this->actividad(
                    $ticketId,
                    $usuarios[$evento['actor']]->id_usuario,
                    $evento['tipo'],
                    $evento['anterior'],
                    $evento['nuevo'],
                    $evento['descripcion'],
                    Carbon::parse($evento['fecha'])
                );
            }

            return;
        }

        $creado = Carbon::parse($data['fecha']);
        $this->actividad(
            $ticketId,
            $usuarios[$data['solicitante']]->id_usuario,
            'creacion',
            null,
            'Abierto',
            'Ticket creado.',
            $creado
        );

        if ($data['estatus'] === 'Abierto') {
            return;
        }

        $asignado = isset($data['asignado_at'])
            ? Carbon::parse($data['asignado_at'])
            : $creado->copy()->addMinutes(30);

        if ($responsable !== null) {
            $nombre = trim($responsable->nombre_empleado.' '.$responsable->apellido_paterno);

            $this->actividad(
                $ticketId,
                $usuarios['admin']->id_usuario,
                'asignacion_tecnico',
                null,
                $nombre,
                'Ticket asignado a '.$nombre,
                $asignado
            );

            $this->actividad(
                $ticketId,
                $usuarios['admin']->id_usuario,
                'cambio_estado',
                'Abierto',
                'Asignado',
                'Asignación a '.$nombre,
                $asignado
            );
        }

        if (! in_array($data['estatus'], ['En Proceso', 'Pendiente', 'Resuelto', 'Cerrado'], true)) {
            return;
        }

        $enProceso = isset($data['primera_respuesta'])
            ? Carbon::parse($data['primera_respuesta'])
            : $asignado->copy()->addHour();

        $this->actividad(
            $ticketId,
            $responsable !== null ? $usuarios['tec']->id_usuario : $usuarios['admin']->id_usuario,
            'cambio_estado',
            'Asignado',
            'En Proceso',
            null,
            $enProceso
        );

        if ($data['estatus'] === 'Pendiente') {
            $this->actividad(
                $ticketId,
                $usuarios['tec']->id_usuario,
                'cambio_estado',
                'En Proceso',
                'Pendiente',
                'Se está a la espera de información del solicitante.',
                Carbon::parse($data['pendiente_at'] ?? $enProceso->copy()->addHours(2))
            );

            return;
        }

        if (! in_array($data['estatus'], ['Resuelto', 'Cerrado'], true)) {
            return;
        }

        $resolucion = Carbon::parse($data['resolucion']);

        $this->actividad(
            $ticketId,
            $usuarios['tec']->id_usuario,
            'cambio_estado',
            'En Proceso',
            'Resuelto',
            null,
            $resolucion
        );

        if ($data['estatus'] === 'Cerrado') {
            $this->actividad(
                $ticketId,
                $usuarios['tec']->id_usuario,
                'cambio_estado',
                'Resuelto',
                'Cerrado',
                'Ticket cerrado.',
                Carbon::parse($data['cierre'])
            );
        }
    }

    private function actividad(
        int $ticketId,
        ?int $actorId,
        string $tipo,
        ?string $anterior,
        ?string $nuevo,
        ?string $descripcion,
        Carbon $fecha
    ): void {
        DB::table(SchemaTable::helpdesk('tableMA_ActividadTicket'))->insert([
            'id_ticket' => $ticketId,
            'id_usuario_actor' => $actorId,
            'tipo_actividad' => $tipo,
            'valor_anterior' => $anterior,
            'valor_nuevo' => $nuevo,
            'descripcion_actividad' => $descripcion,
            'created_at' => $fecha,
        ]);
    }
}
