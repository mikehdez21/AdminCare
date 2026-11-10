<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                    ->select([
                        'id',
                        'name',
                        'guard_name',
                        'created_at',
                        'updated_at',
                    ]),
                ['name'],
                10,
                [
                    'orden' => [
                        'id' => '"roles"."id"',
                        'nombre' => 'LOWER("roles"."name")',
                        'creado' => '"roles"."created_at"',
                        'modificado' => '"roles"."updated_at"',
                    ],
                    'orden_default' => ['id', 'asc'],
                    'filtros' => [
                        'id' => ['tipo' => 'texto', 'expresion' => '"roles"."id"'],
                        'nombre' => ['tipo' => 'texto', 'expresion' => '"roles"."name"'],
                        'creado' => ['tipo' => 'fecha', 'expresion' => 'roles.created_at'],
                        'modificado' => ['tipo' => 'fecha', 'expresion' => 'roles.updated_at'],
                    ],
                ]
            );

            $items = $resultado['items'];
            $this->cargarAlcances($items);

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
            $response['message'] = $this->safeError('Error al obtener los roles', $e);
        }

        return response()->json($response, 200);
    }

    /**
     * Catálogo de recursos que admiten alcance por rol.
     *
     * Lo consume la pantalla de Roles para pintar los selects. La fuente es
     * `config/permisos.php`; agregar un recurso allí lo hace aparecer aquí.
     */
    public function catalogoAlcances()
    {
        $data = [];

        foreach (config('permisos.alcances', []) as $recurso => $definicion) {
            $data[] = [
                'recurso' => $recurso,
                'etiqueta' => $definicion['etiqueta'],
                'valores' => $definicion['valores'],
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
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
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $alcances = $this->validarAlcances($request);

        try {
            $input = $request->only(['name', 'guard_name']);

            $role = DB::transaction(function () use ($request, $input, $alcances) {
                $role = Role::create($input);

                if ($request->has('permissions')) {
                    $role->syncPermissions($request->input('permissions', []));
                }

                $this->guardarAlcances($role, $alcances);

                return $role;
            });

            $role->load('permissions');
            $this->cargarAlcances(collect([$role]));

            $response['success'] = true;
            $response['message'] = 'Rol registrado exitosamente!';
            $response['data'] = $role;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('Error al crear el rol', $e);
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Obtener un ROL por ID
    public function show($id)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $role = Role::with('permissions')->findOrFail($id);
            $this->cargarAlcances(collect([$role]));

            $response['success'] = true;
            $response['data'] = $role;
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';

            return response()->json($response, 404);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('Error al obtener el rol', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Actualizar ROL
    public function update(Request $request, $id)
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
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $alcances = $this->validarAlcances($request);

        try {
            $rol = Role::findOrFail($id);
            $esAdmin = $rol->name === 'Admin';

            if ($esAdmin && $request->input('name') !== 'Admin') {
                throw ValidationException::withMessages([
                    'name' => 'El rol Admin no se puede renombrar.',
                ]);
            }

            DB::transaction(function () use ($request, $rol, $alcances, $esAdmin) {
                $rol->update($request->only(['name', 'guard_name']));

                if ($request->has('permissions')) {
                    $rol->syncPermissions($request->input('permissions', []));
                }

                $this->guardarAlcances($rol, $alcances, $esAdmin);
            });

            $rol->load('permissions');
            $this->cargarAlcances(collect([$rol]));

            $response['success'] = true;
            $response['message'] = 'Rol actualizado exitosamente.';
            $response['data'] = $rol;
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';
        } catch (ValidationException $e) {
            // Deja que el handler global devuelva 422 con el sobre de la API.
            throw $e;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('Error al actualizar el rol', $e);
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
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $alcances = $this->validarAlcances($request);

        try {
            $role = Role::findOrFail($id);

            DB::transaction(function () use ($request, $role, $alcances) {
                $role->syncPermissions($request->input('permissions', []));
                $this->guardarAlcances($role, $alcances, $role->name === 'Admin');
            });

            $role->load('permissions');
            $this->cargarAlcances(collect([$role]));

            $response['success'] = true;
            $response['message'] = 'Permisos del rol sincronizados exitosamente.';
            $response['data'] = $role;
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Rol no encontrado.';

            return response()->json($response, 404);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('Error al sincronizar permisos del rol', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
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
            $response['message'] = $this->safeError('Error al eliminar el rol', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    /** @return array<int, string> */
    private function recursosConAlcance(): array
    {
        return array_keys(config('permisos.alcances', []));
    }

    /**
     * Valida el mapa `alcances` del request. Una cadena vacía o null borra el
     * override y devuelve el recurso al alcance derivado.
     *
     * @return array<string, string|null>
     */
    private function validarAlcances(Request $request): array
    {
        if (! $request->has('alcances')) {
            return [];
        }

        $alcances = $request->input('alcances');

        if (! is_array($alcances)) {
            throw ValidationException::withMessages([
                'alcances' => 'El alcance debe ser un objeto.',
            ]);
        }

        $recursos = $this->recursosConAlcance();
        $valores = ['propio', 'departamento', 'global', ''];

        foreach ($alcances as $recurso => $valor) {
            if (! in_array($recurso, $recursos, true)) {
                throw ValidationException::withMessages([
                    'alcances' => "El recurso {$recurso} no admite alcance configurable.",
                ]);
            }

            if ($valor !== null && ! in_array($valor, $valores, true)) {
                throw ValidationException::withMessages([
                    "alcances.{$recurso}" => 'El alcance debe ser propio, departamento, global o vacío.',
                ]);
            }
        }

        return $alcances;
    }

    /**
     * Guarda los overrides de alcance de un rol. `Admin` siempre queda global:
     * es la cuenta de administración del sistema.
     *
     * @param  array<string, string|null>  $alcances
     */
    private function guardarAlcances(Role $role, array $alcances, bool $forzarGlobal = false): void
    {
        if ($forzarGlobal || $role->name === 'Admin') {
            foreach ($this->recursosConAlcance() as $recurso) {
                DB::table('tableInter_rolesAlcances')->updateOrInsert(
                    ['id_rol' => $role->id, 'recurso' => $recurso],
                    ['alcance' => 'global']
                );
            }

            return;
        }

        foreach ($alcances as $recurso => $valor) {
            if (! in_array($recurso, $this->recursosConAlcance(), true)) {
                continue;
            }

            if ($valor === null || $valor === '') {
                DB::table('tableInter_rolesAlcances')
                    ->where('id_rol', $role->id)
                    ->where('recurso', $recurso)
                    ->delete();

                continue;
            }

            DB::table('tableInter_rolesAlcances')->updateOrInsert(
                ['id_rol' => $role->id, 'recurso' => $recurso],
                ['alcance' => $valor]
            );
        }
    }

    /**
     * Agrega `alcances` a cada rol sin tocar la tabla `roles`.
     *
     * @param  iterable<Role>  $roles
     */
    private function cargarAlcances(iterable $roles): void
    {
        $items = collect($roles);
        $ids = $items->pluck('id')->filter()->all();

        if ($ids === []) {
            return;
        }

        $filas = DB::table('tableInter_rolesAlcances')
            ->whereIn('id_rol', $ids)
            ->get(['id_rol', 'recurso', 'alcance']);

        $mapa = [];

        foreach ($filas as $fila) {
            $mapa[$fila->id_rol][$fila->recurso] = $fila->alcance;
        }

        foreach ($items as $role) {
            $role->setAttribute('alcances', $mapa[$role->id] ?? []);
        }
    }
}
