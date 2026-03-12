<?php

namespace App\Http\Controllers\AdminControllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Empleado;

class EmpleadoController extends Controller
{
    // Obtener Todos los Empleados
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $empleados = Empleado::with('departamento')
                ->orderBy('id_empleado', 'asc')
                ->get([
                    'id_empleado',
                    'nombre_empleado',
                    'apellido_paterno',
                    'apellido_materno',
                    'email_empleado',
                    'telefono_empleado',
                    'genero',
                    'fecha_nacimiento',
                    'estatus_activo',
                    'fecha_alta',
                    'fecha_baja',
                    'foto_empleado',
                    'firma_movimientos',
                    'created_at',
                    'updated_at',
                    'id_departamento',
                ]);

            if ($empleados->isEmpty()) {
                $response['message'] = 'No se encontraron empleados.';
            } else {
                // Transformar los empleados para incluir la URL pública de la foto
                $empleadosTransformados = $empleados->map(function ($empleado) {
                    return [
                        'id_empleado' => $empleado->id_empleado,
                        'nombre_empleado' => $empleado->nombre_empleado,
                        'apellido_paterno' => $empleado->apellido_paterno,
                        'apellido_materno' => $empleado->apellido_materno,
                        'email_empleado' => $empleado->email_empleado,
                        'telefono_empleado' => $empleado->telefono_empleado,
                        'genero' => $empleado->genero,
                        'fecha_nacimiento' => $empleado->fecha_nacimiento,
                        'estatus_activo' => $empleado->estatus_activo,
                        'fecha_alta' => $empleado->fecha_alta,
                        'fecha_baja' => $empleado->fecha_baja,
                        'foto_empleado' => $empleado->foto_empleado
                            ? Storage::url($empleado->foto_empleado)
                            : asset('/storage/fotosEmpleados/defaultProfile.png'),
                        'firma_movimientos' => $empleado->firma_movimientos,
                        'created_at' => $empleado->created_at,
                        'updated_at' => $empleado->updated_at,
                        'id_departamento' => $empleado->id_departamento,
                    ];
                });

                $response['success'] = true;
                $response['data'] = $empleadosTransformados;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los empleados: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // STORE ( crear Empleado)
    // Crear Empleado
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $request->validate([
                'nombre_empleado' => 'required|string|max:255',
                'apellido_paterno' => 'nullable|string|max:255',
                'apellido_materno' => 'nullable|string|max:255',
                'email_empleado' => 'required|string|email|max:255|unique:tableEmpleados,email_empleado',
                'telefono_empleado' => 'nullable|string|max:20',
                'genero' => 'nullable|in:Masculino,Femenino',
                'fecha_nacimiento' => 'required|date',
                'estatus_activo' => 'required|boolean',
                'fecha_alta' => 'required|date',
                'fecha_baja' => 'nullable|date',
                'foto_empleado' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'firma_movimientos' => 'required|string|max:255',
                'id_departamento' => 'required|exists:tableDepartamentos,id_departamento',
            ]);

            $path = null;
            if ($request->hasFile('foto_empleado')) {
                $file = $request->file('foto_empleado');
                $filename = $request->nombre_empleado . '_' . $request->apellido_paterno . '_' . $request->apellido_materno . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('fotosEmpleados', $filename, 'public');
            }

            $empleado = Empleado::create([
                'nombre_empleado' => $request->nombre_empleado,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'email_empleado' => $request->email_empleado,
                'telefono_empleado' => $request->telefono_empleado,
                'genero' => $request->genero,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'estatus_activo' => $request->estatus_activo,
                'fecha_alta' => $request->fecha_alta,
                'fecha_baja' => $request->fecha_baja,
                'foto_empleado' => $path,
                'firma_movimientos' => bcrypt($request->firma_movimientos),
                'id_departamento' => $request->id_departamento,
            ]);

            $response['success'] = true;
            $response['message'] = "Empleado creado exitosamente.";
            $response['data'] = $empleado;
        } catch (\Exception $e) {
            $response['message'] = "Error al crear el empleado: " . $e->getMessage();
        }

        return response()->json($response, 201);
    }

    // UPDATE (Actualizar Empleado)
    // Actualizar Empleado
    public function update(Request $request, $id_empleado)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'nombre_empleado' => 'required|string|max:255',
                'apellido_paterno' => 'nullable|string|max:255',
                'apellido_materno' => 'nullable|string|max:255',
                'email_empleado' => 'required|string|email|max:255|unique:tableEmpleados,email_empleado,' . $id_empleado . ',id_empleado',
                'telefono_empleado' => 'nullable|string|max:20',
                'genero' => 'nullable|in:Masculino,Femenino',
                'fecha_nacimiento' => 'required|date',
                'estatus_activo' => 'required|boolean',
                'fecha_alta' => 'required|date',
                'fecha_baja' => 'nullable|date',
                'foto_empleado' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'firma_movimientos' => 'nullable|string|max:255',
                'id_departamento' => 'required',
            ]);

            // Buscar empleado
            $empleado = Empleado::findOrFail($id_empleado);

            // Manejo de la imagen
            $path = $empleado->foto_empleado; // Ruta actual por defecto

            if ($request->hasFile('foto_empleado')) {
                // Eliminar imagen anterior si existe
                if ($path && Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }

                // Guardar nueva imagen
                $file = $request->file('foto_empleado');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('fotosEmpleados', $filename, 'public');
            }

            // Actualizar firma solo si viene en la solicitud
            $firma = $empleado->firma_movimientos;
            if (!empty($validatedData['firma_movimientos'])) {
                $firma = Hash::make($validatedData['firma_movimientos']);
            }

            // Actualizar empleado
            $empleado->update([
                'nombre_empleado' => $validatedData['nombre_empleado'],
                'apellido_paterno' => $validatedData['apellido_paterno'] ?? null,
                'apellido_materno' => $validatedData['apellido_materno'] ?? null,
                'email_empleado' => $validatedData['email_empleado'],
                'telefono_empleado' => $validatedData['telefono_empleado'] ?? null,
                'genero' => $validatedData['genero'] ?? null,
                'fecha_nacimiento' => $validatedData['fecha_nacimiento'],
                'estatus_activo' => $validatedData['estatus_activo'],
                'fecha_alta' => $validatedData['fecha_alta'],
                'fecha_baja' => $validatedData['fecha_baja'] ?? null,
                'foto_empleado' => $path,
                'firma_movimientos' => $firma,
                'id_departamento' => $validatedData['id_departamento'],
            ]);

            // Respuesta exitosa
            $response['success'] = true;
            $response['message'] = "Empleado actualizado exitosamente.";
            $response['data'] = [
                'empleado' => $empleado,
                'foto_url' => $path ? asset('storage/' . $path) : null,
            ];
        } catch (\Exception $e) {
            $response['message'] = "Error al actualizar el empleado: " . $e->getMessage();
        }

        return response()->json($response);
    }

    public function updateBajaEmpleado(Request $request, $id_empleado)
    {
        $response = ["success" => false, "message" => "", "data" => []];

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
            $response['message'] = "Estatus actualizado correctamente.";
            $response['data'] = $empleado;
        } catch (\Exception $e) {
            $response['message'] = "Error: " . $e->getMessage();
        }

        return response()->json($response);
    }
}
