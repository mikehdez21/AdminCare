<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmpleadoController extends Controller
{
    use Paginable;

    // INDEX (Obtener Todos los Empleados)
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                Empleado::with('departamento')
                    ->orderBy('id_empleado', 'asc')
                    ->select([
                        'id_empleado',
                        'nombre_empleado',
                        'apellido_paterno',
                        'apellido_materno',
                        'genero',
                        'fecha_nacimiento',
                        'estatus_activo',
                        'jefatura_empleado',
                        'fecha_alta',
                        'fecha_baja',
                        'foto_empleado',
                        'created_at',
                        'updated_at',
                        'id_departamento',
                    ]),
                ['nombre_empleado', 'id_empleado']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron empleados.';
            } else {
                $empleadosTransformados = $items->map(function ($empleado) {
                    $urlFoto = $empleado->foto_empleado
                        ? asset('storage/'.$empleado->foto_empleado)
                        : asset('build/img/profile_users/perfilAdmin.png');

                    return [
                        'id_empleado' => $empleado->id_empleado,
                        'nombre_empleado' => $empleado->nombre_empleado,
                        'apellido_paterno' => $empleado->apellido_paterno,
                        'apellido_materno' => $empleado->apellido_materno,
                        'genero' => $empleado->genero,
                        'fecha_nacimiento' => $empleado->fecha_nacimiento,
                        'estatus_activo' => $empleado->estatus_activo,
                        'jefatura_empleado' => $empleado->jefatura_empleado,
                        'fecha_alta' => $empleado->fecha_alta,
                        'fecha_baja' => $empleado->fecha_baja,
                        'foto_empleado' => $urlFoto,
                        'created_at' => $empleado->created_at,
                        'updated_at' => $empleado->updated_at,
                        'id_departamento' => $empleado->id_departamento,
                    ];
                });

                $response['success'] = true;
                $response['data'] = $empleadosTransformados;
            }

            // En modo paginado se incluye siempre el meta y success=true
            if ($resultado['meta'] !== null) {
                $response['success'] = true;
                $response['meta'] = $resultado['meta'];
            }
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible obtener los empleados.', $e);
        }

        return response()->json($response, 200);
    }

    // STORE ( crear Empleado)
    // Crear Empleado
    public function store(Request $request)
    {
        if (config('app.demo_mode') && $request->hasFile('foto_empleado')) {
            return response()->json(['success' => false, 'message' => 'La carga de archivos no está disponible en la demo.'], 501);
        }
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $request->validate([
                'nombre_empleado' => 'required|string|max:255',
                'apellido_paterno' => 'required|string|max:255',
                'apellido_materno' => 'required|string|max:255',
                'genero' => 'required|in:Masculino,Femenino',
                'fecha_nacimiento' => 'required|date',
                'estatus_activo' => 'required|boolean',
                'jefatura_empleado' => 'nullable|boolean',
                'fecha_alta' => 'required|date',
                'fecha_baja' => 'nullable|date',
                'foto_empleado' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'id_departamento' => 'required|exists:tableDepartamentos,id_departamento',
            ]);

            $path = 'fotosEmpleados/perfilAdmin.png'; // Ruta por defecto

            if ($request->hasFile('foto_empleado')) {
                $file = $request->file('foto_empleado');
                // nombre_empleado si tiene espacios, se reemplazan por guiones bajos para evitar problemas en la ruta
                $request->merge(['nombre_empleado' => str_replace(' ', '_', $request->nombre_empleado)]);
                $filename = $request->nombre_empleado.'_'.$request->apellido_paterno.'_'.$request->apellido_materno.'.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('fotosEmpleados', $filename, 'public');
            }

            $empleado = Empleado::create([
                'nombre_empleado' => $request->nombre_empleado,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'genero' => $request->genero,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus_activo' => $request->estatus_activo,
                'jefatura_empleado' => $request->jefatura_empleado,
                'fecha_alta' => $request->fecha_alta,
                'fecha_baja' => $request->fecha_baja,
                'foto_empleado' => $path,
                'id_departamento' => $request->id_departamento,
            ]);

            $response['success'] = true;
            $response['message'] = 'Empleado creado exitosamente.';
            $response['data'] = $empleado;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear el empleado.', $e);
        }

        return response()->json($response, 201);
    }

    // UPDATE (Actualizar Empleado)
    // Actualizar Empleado
    public function update(Request $request, $id_empleado)
    {
        if (config('app.demo_mode') && $request->hasFile('foto_empleado')) {
            return response()->json(['success' => false, 'message' => 'La carga de archivos no está disponible en la demo.'], 501);
        }
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            // Buscar empleado
            $empleado = Empleado::findOrFail($id_empleado);

            // Asegura que 'estatus_activo' sea un booleano
            if ($request->has('estatus_activo')) {
                $rawStatus = $request->input('estatus_activo');
                $request->merge(['estatus_activo' => filter_var($rawStatus, FILTER_VALIDATE_BOOLEAN)]);
            }
            // Asegura que 'jefatura_empleado' sea un booleano
            if ($request->has('jefatura_empleado')) {
                $rawJefatura = $request->input('jefatura_empleado');
                $request->merge(['jefatura_empleado' => filter_var($rawJefatura, FILTER_VALIDATE_BOOLEAN)]);
            }
            // Asegura que 'id_departamento' sea un entero
            if ($request->has('id_departamento')) {
                $request->merge(['id_departamento' => (int) $request->input('id_departamento')]);
            }
            // Asegura que 'fecha_baja' sea null si está vacía
            if ($request->has('fecha_baja') && $request->input('fecha_baja') === '') {
                $request->merge(['fecha_baja' => null]);
            }

            // Validación de los datos
            $validatedData = $request->validate([
                'nombre_empleado' => 'required|string|max:255',
                'apellido_paterno' => 'required|string|max:255',
                'apellido_materno' => 'required|string|max:255',
                'genero' => 'required|in:Masculino,Femenino',
                'fecha_nacimiento' => 'required|date',
                'estatus_activo' => 'required|boolean',
                'jefatura_empleado' => 'nullable|boolean',
                'fecha_alta' => 'required|date',
                'fecha_baja' => 'nullable|date',
                'foto_empleado' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'id_departamento' => 'required',
            ]);

            // Obtener la foto actual del empleado
            // Si en el request viene una nueva foto, se reemplaza la anterior
            // path se mantiene igual, tanto en BD como en el storage, lo que cambia es el contenido del archivo
            // el archivo nuevo reemplaza al anterior, pero la ruta sigue siendo la misma

            $path = $empleado->foto_empleado; // Mantener la foto actual por defecto

            if ($request->hasFile('foto_empleado')) {
                // Eliminar la foto anterior si no es la predeterminada
                if ($empleado->foto_empleado && $empleado->foto_empleado !== 'fotosEmpleados/perfilAdmin.png') {
                    Storage::disk('public')->delete($empleado->foto_empleado);
                }

                // Guardar la nueva foto
                $file = $request->file('foto_empleado');
                // nombre_empleado si tiene espacios, se reemplazan por guiones bajos para evitar problemas en la ruta
                $formatNombre = str_replace(' ', '_', $validatedData['nombre_empleado']);

                $filename = $formatNombre.'_'.$validatedData['apellido_paterno'].'_'.$validatedData['apellido_materno'].'.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('fotosEmpleados', $filename, 'public');
            }

            // Actualizar empleado
            $empleado->update([
                'nombre_empleado' => $validatedData['nombre_empleado'],
                'apellido_paterno' => $validatedData['apellido_paterno'] ?? null,
                'apellido_materno' => $validatedData['apellido_materno'] ?? null,
                'genero' => $validatedData['genero'] ?? null,
                'fecha_nacimiento' => $validatedData['fecha_nacimiento'],
                'estatus_activo' => $validatedData['estatus_activo'],
                'jefatura_empleado' => $validatedData['jefatura_empleado'] ?? false,
                'fecha_alta' => $validatedData['fecha_alta'],
                'fecha_baja' => $validatedData['fecha_baja'] ?? null,
                'foto_empleado' => $path,
                'id_departamento' => $validatedData['id_departamento'],
            ]);

            // Respuesta exitosa
            $response['success'] = true;
            $response['message'] = 'Empleado actualizado exitosamente.';
            $response['data'] = [
                'empleado' => $empleado,
                'foto_empleado' => $path ? asset('storage/'.$path) : null,
            ];
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar el empleado.', $e);
        }

        return response()->json($response);
    }

    public function updateBajaEmpleado(Request $request, $id_empleado)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $validatedData = $request->validate([
                'estatus_activo' => 'required|boolean',
                'fecha_baja' => 'nullable|date',
            ]);

            $empleado = Empleado::findOrFail($id_empleado);

            $empleado->update([
                'estatus_activo' => $validatedData['estatus_activo'],
                'fecha_baja' => $validatedData['fecha_baja'] ?? null,
            ]);

            $response['success'] = true;
            $response['message'] = 'Estatus actualizado correctamente.';
            $response['data'] = $empleado;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar el empleado.', $e);
        }

        return response()->json($response);
    }
}
