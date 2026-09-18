<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DepartamentosController extends Controller
{
    use Paginable;

    // Obtener Todos los Departamentos
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                Departamento::query()
                    ->select([
                        'id_departamento',
                        'nombre_departamento',
                        'descripcion',
                        'atiende_pacientes',
                        'estatus_activo',
                        'created_at',
                        'updated_at',
                    ])
                    ->orderBy('id_departamento', 'asc'),
                ['nombre_departamento', 'id_departamento']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron departamentos.';
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
            $response['message'] = $this->safeError('No fue posible obtener los departamentos.', $e);
        }

        return response()->json($response, 200);
    }

    // / STORE (crear Departamento)
    public function store(Request $request)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        $validator = Validator::make($request->all(), [
            'nombre_departamento' => 'required|string|max:255',
            'descripcion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {

            $input = $request->all();

            // Crear el departamento con los datos del request
            $departamento = Departamento::create($input);

            $response['success'] = true;
            $response['message'] = 'Departamento registrado exitosamente!';
            $response['data'] = $departamento;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear el departamento.', $e);
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Obtener un Departamento por ID
    public function show($id_departamento) {}

    // Actualizar Departamento
    public function update(Request $request, $id_departamento)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $departamento = Departamento::findOrFail($id_departamento);
            $departamento->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Departamento actualizado exitosamente.';
            $response['data'] = $departamento;

        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Departamento no encontrado.';

        } catch (ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar el departamento.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un Usuario
    public function destroy($id_departamento)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            Departamento::findOrFail($id_departamento)->delete();
            $response['success'] = true;
            $response['message'] = 'Departamento eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar el departamento.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
