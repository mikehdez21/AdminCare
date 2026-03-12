<?php

namespace App\Http\Controllers\AdminControllers;


use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class UserController extends Controller
{

    // Obtener Todos los Usuarios
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $users = User::with('departamento', 'roles')
                ->get([
                    'id_usuario',
                    'nombre_usuario',
                    'email_usuario',
                    'password',
                    'estatus_activo',
                    'usuario_compartido',
                    'fecha_baja',
                    'id_empleado',
                    'id_departamento',
                    'created_at',
                    'updated_at',
                ]);

            if ($users->isEmpty()) {
                $response['message'] = 'No se encontraron usuarios.';
            } else {

                $response['success'] = true;
                $response['data'] = $users;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los usuarios: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // STORE ( crear Usuario)
    // Crear Usuario
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $request->validate([
                'nombre_usuario' => 'required|string|max:255',
                'email_usuario' => 'required|string|max:255',
                'password' => 'required|string|max:255',
                'estatus_activo' => 'required|boolean',
                'fecha_baja' => 'nullable|date',
                'usuario_compartido' => 'required|boolean',

                'roles' => 'required|array', // Ahora es un arreglo
                'roles.*' => 'string|exists:roles,name', // Cada rol en el arreglo debe existir en la tabla roles

                'id_empleado' => 'nullable',
                'id_departamento' => 'required',

            ]);

            $user = User::create([
                'nombre_usuario' => $request->nombre_usuario,
                'email_usuario' => $request->email_usuario,
                'password' => bcrypt($request->password),
                'estatus_activo' => $request->estatus_activo,
                'fecha_baja' => $request->fecha_baja,
                'usuario_compartido' => $request->usuario_compartido,
                'id_empleado' => $request->id_empleado,
                'id_departamento' => $request->id_departamento,


            ]);

            // Asignar múltiples roles
            $user->syncRoles($request->roles);

            $response['success'] = true;
            $response['message'] = 'Usuario creado exitosamente y rol asignado.';
            $response['data'] = [
                'user' => $user,
                'roles' => $user->roles->pluck('name'), // Incluye los nombres de los roles asignados
            ];
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el usuario: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar Usuario
    public function update(Request $request, $id_usuario)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {

            // Validar los datos de entrada
            $validatedData = $request->validate([
                'nombre_usuario' => 'required|string|max:255',
                'email_usuario' => 'required|email|max:255', // Permitir el mismo email del usuario actual
                'password' => 'nullable|string|min:8', // No obligatorio, solo si se proporciona
                'estatus_activo' => 'required|boolean',
                'fecha_baja' => 'nullable|date',
                'usuario_compartido' => 'required|boolean',
                'roles' => 'required|array', // Validación como arreglo
                'id_empleado'  => 'required',
                'id_departamento' => 'required',
            ]);

            // Buscar el usuario por ID 
            $user = User::findOrFail($id_usuario);

            // Actualizar campos básicos
            $user->update([
                'nombre_usuario' => $validatedData['nombre_usuario'],
                'email_usuario' => $validatedData['email_usuario'],
                'password' => !empty($validatedData['password']) ? bcrypt($validatedData['password']) : $user->password,
                'estatus_activo' => $validatedData['estatus_activo'],
                'fecha_baja' => $validatedData['fecha_baja'] ?? null,
                'usuario_compartido' => $validatedData['usuario_compartido'],
                'id_empleado' => $validatedData['id_empleado'],
                'id_departamento' => $validatedData['id_departamento'],

            ]);

            // Sincronizar múltiples roles
            $user->syncRoles($validatedData['roles']);

            // Cargar relaciones para incluir en la respuesta
            $response['success'] = true;
            $response['message'] = 'Usuario actualizado exitosamente.';
            $response['data'] = $user->load('roles', 'departamento');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Usuario no encontrado.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el usuario: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }


    // Baja de un Usuario       
    public function updateBajaUsuario(Request $request, $id_usuario)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validatedData = $request->validate([
                'estatus_activo' => 'required|boolean',
                'fecha_baja' => 'nullable|date',
            ]);

            $usuario = User::findOrFail($id_usuario);

            $usuario->update([
                'estatus_activo' => $validatedData['estatus_activo'],
                'fecha_baja' => $validatedData['fecha_baja'] ?? null,
            ]);

            $response['success'] = true;
            $response['message'] = "Estatus actualizado correctamente.";
            $response['data'] = $usuario;
        } catch (\Exception $e) {
            $response['message'] = "Error: " . $e->getMessage();
        }

        return response()->json($response);
    }


    // Others Functions

    // Obtener un Usuario por ID
    public function show($id_usuario)
    {
        try {
            $user = User::with('departamento', 'roles')
                ->findOrFail($id_usuario, [
                    'id_usuario',
                    'nombre_usuario',
                    'email_usuario',
                    'estatus_activo',
                    'foto_perfil',
                    'created_at',
                    'updated_at',
                    'id_empleado',
                    'id_departamento',
                ]);

            return response()->json($user, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Usuario no encontrado: ' . $e->getMessage()], 404);
        }
    }


    /*
    public function UsersByRol(Request $request)
    {
        $roleId = $request->input('role_id', 2);

        $data = User::whereHas('roles', function ($q) use ($roleId) {
            $q->where("id", $roleId);
        })
            ->with('roles', 'departamentos')
            ->get([
                "id_usuario", 
                "nombre_usuario", 
                "nombre_empleado", 
                "apellidos_empleado", 
                "email", 
                "ultimo_acceso", 
                "id_departamento", 
                "is_active"
            ])
            ->map(function ($user) {
                return [
                    'ID' => $user->id_usuario,
                    'Usuario' => $user->nombre_usuario,
                    'Nombre' => $user->nombre_empleado . ' ' . $user->apellidos_empleado,
                    'Email' => $user->email,
                    'Ultima Conexion' => $user->ultimo_acceso,
                    'Rol' => $user->roles->pluck('name')->first(),
                    'Departamento' => $user->departamentos->nombre_departamento,
                    'Cuenta Activa?' => $user->is_active,
                ];
            });
        return response()->json($data, 200);
    }
    */
}
