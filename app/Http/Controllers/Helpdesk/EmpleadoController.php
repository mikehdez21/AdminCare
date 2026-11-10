<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Illuminate\Http\Request;

/**
 * Empleados que el solicitante puede asociar al crear un ticket.
 *
 * No reutiliza `admin/empleados`: ese endpoint exige permisos de administración y
 * un solicitante normal recibía 403. Aquí solo se exponen los datos mínimos de
 * los empleados activos del departamento del usuario en sesión.
 */
class EmpleadoController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();

        $empleados = Empleado::query()
            ->where('estatus_activo', true)
            ->where('id_departamento', $usuario->id_departamento)
            ->orderBy('nombre_empleado')
            ->orderBy('apellido_paterno')
            ->get([
                'id_empleado',
                'nombre_empleado',
                'apellido_paterno',
                'apellido_materno',
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Empleados obtenidos correctamente.',
            'data' => $empleados,
        ], 200);
    }
}
