<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RolesController extends Controller
{
    use Paginable;

    // Obtener Todos los Roles
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                Role::with('permissions')
                    ->orderBy('id', 'asc')
                    ->select([
                        'id',
                        'name',
                        'guard_name',
                        'created_at',
                        'updated_at',
                    ]),
                ['name']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron roles.';
            } else {
                $response['success'] = true;
                $response['data'] = $items;
            }

            // En modo paginado se incluye siempre el meta y success=true
            if ($resultado['meta'] !== null) {
                $response['success'] = true;
                $response['meta'] = $resultado['meta'];
            }
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible obtener los roles.', $e);
        }

        return response()->json($response, 200);
    }

    // / STORE (crear Rol)
    public function store(Request $request)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'guard_name' => 'required|string|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => [
                'integer',
                Rule::exists('permissions', 'id'),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {

            $input = $request->only(['name', 'guard_name']);

            // Crear el rol con los datos del request
            $role = Role::create($input);

            if ($request->has('permissions')) {
                $permisos = $this->expandirPermisosConBase($request->input('permissions', []));
                $role->syncPermissions($permisos);
            }

            $response['success'] = true;
            $response['message'] = 'Rol registrado exitosamente!';
            $response['data'] = $role->load('permissions');
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear el rol.', $e);
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Obtener un ROL por ID
    public function show($id)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $role = Role::with('permissions')->findOrFail($id);

            $response['success'] = true;
            $response['data'] = $role;
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';

            return response()->json($response, 404);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible obtener el rol.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Actualizar ROL
    public function update(Request $request, $id)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $rol = Role::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'guard_name' => 'required|string|max:255',
                'permissions' => 'sometimes|array',
                'permissions.*' => [
                    'integer',
                    Rule::exists('permissions', 'id'),
                ],
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            $rol->update($request->only(['name', 'guard_name']));

            if ($request->has('permissions')) {
                $permisos = $this->expandirPermisosConBase($request->input('permissions', []));
                $rol->syncPermissions($permisos);
            }

            $response['success'] = true;
            $response['message'] = 'Rol actualizado exitosamente.';
            $response['data'] = $rol->load('permissions');
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';
        } catch (ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar el rol.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    public function asignarPermisosRole(Request $request, $id)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => [
                'integer',
                Rule::exists('permissions', 'id'),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            $role = Role::findOrFail($id);
            $permisos = $this->expandirPermisosConBase($request->input('permissions', []));
            $role->syncPermissions($permisos);

            $response['success'] = true;
            $response['message'] = 'Permisos del rol sincronizados exitosamente.';
            $response['data'] = $role->load('permissions');
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';

            return response()->json($response, 404);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible sincronizar los permisos del rol.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    /**
     * Asegura que un rol reciba el permiso base de cada módulo cuando se
     * selecciona alguna de sus acciones (modulo.lectura|escritura|control).
     */
    private function expandirPermisosConBase(array $permissionIds): array
    {
        $permisos = Permission::whereIn('id', $permissionIds)->pluck('name', 'id');

        $nombresBase = [];
        foreach ($permisos as $name) {
            if (preg_match('/^(.+)\.(lectura|escritura|control)$/', $name, $coincidencias)) {
                $nombresBase[] = $coincidencias[1];
            }
        }

        if ($nombresBase === []) {
            return $permissionIds;
        }

        $baseIds = Permission::whereIn('name', array_unique($nombresBase))
            ->pluck('id')
            ->all();

        return array_values(array_unique(array_merge($permissionIds, $baseIds)));
    }

    // Eliminar un ROL
    public function destroy($id)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            Role::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Rol eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar el rol.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
