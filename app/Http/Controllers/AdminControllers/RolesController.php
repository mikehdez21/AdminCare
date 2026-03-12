<?php

namespace App\Http\Controllers\AdminControllers;


use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;

class RolesController extends Controller
{

    // Obtener Todos los Roles
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];


        try {

            $roles = Role::all([
                'id',
                'name',
                'guard_name',
                'created_at',
                'updated_at',

            ]);


            if ($roles->isEmpty()) {
                $response['message'] = 'No se encontraron roles.';
            } else {
                $response['success'] = true;
                $response['data'] = $roles;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los roles: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }



    /// STORE (crear Rol)
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'guard_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {

            $input = $request->all();

            // Crear el rol con los datos del request
            $role = Role::create($input);


            $response["success"] = true;
            $response['message'] = 'Rol registrado exitosamente!';
            $response['data'] = $role;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el rol: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }


    // Obtener un ROL por ID
    public function show($id) {}


    // Actualizar ROL
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $rol = Role::findOrFail($id);
            $rol->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Rol actualizado exitosamente.';
            $response['data'] = $rol;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el rol: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un ROL
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            Role::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Rol eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el rol: ' . $e->getMessage();
        }



        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
