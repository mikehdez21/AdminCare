<?php

namespace App\Http\Controllers\AdminControllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;

class PermissionsController extends Controller
{
    // Obtener todos los permisos
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $permissions = Permission::all([
                'id',
                'name',
                'guard_name',
                'created_at',
                'updated_at',
            ]);

            if ($permissions->isEmpty()) {
                $response['message'] = 'No se encontraron permisos.';
            } else {
                $response['success'] = true;
                $response['data'] = $permissions;
            }
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible obtener los permisos.', $e);
        }

        return response()->json($response, 200);
    }

    // Crear permiso
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
            $permission = Permission::create($request->all());

            $response['success'] = true;
            $response['message'] = 'Permiso registrado exitosamente!';
            $response['data'] = $permission;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear el permiso.', $e);
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar permiso
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'guard_name' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $permission = Permission::findOrFail($id);
            $permission->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Permiso actualizado exitosamente.';
            $response['data'] = $permission;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Permiso no encontrado.';
            return response()->json($response, 404);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar el permiso.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar permiso
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            Permission::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Permiso eliminado exitosamente.';
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Permiso no encontrado.';
            return response()->json($response, 404);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar el permiso.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
