<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\Ubicacion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UbicacionController extends Controller
{
    use Paginable;

    // Obtener Todos los Ubicaciones
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                Ubicacion::query()
                    ->select([
                        'id_ubicacion',
                        'nombre_ubicacion',
                        'descripcion_ubicacion',
                        'estatus_activo',
                        'created_at',
                        'updated_at',
                    ])
                    ->orderBy('id_ubicacion', 'asc'),
                ['nombre_ubicacion', 'id_ubicacion']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron ubicaciones.';
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
            $response['message'] = $this->safeError('No fue posible obtener las ubicaciones.', $e);
        }

        return response()->json($response, 200);
    }

    // / STORE (crear Ubicaciones)
    public function store(Request $request)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        $validator = Validator::make($request->all(), [
            'nombre_ubicacion' => 'required|string|max:255',
            'descripcion_ubicacion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {

            $input = $request->all();

            // Crear la ubicacion con los datos del request
            $ubicacion = Ubicacion::create($input);

            $response['success'] = true;
            $response['message'] = 'Ubicación registrada exitosamente!';
            $response['data'] = $ubicacion;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear la ubicación.', $e);
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Obtener una ubicación por ID
    public function show($id_ubicacion) {}

    // Actualizar Ubicación
    public function update(Request $request, $id_ubicacion)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $ubicacion = Ubicacion::findOrFail($id_ubicacion);
            $ubicacion->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Ubicación actualizada exitosamente.';
            $response['data'] = $ubicacion;
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Ubicación no encontrada.';
        } catch (ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar la ubicación.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar una Ubicación
    public function destroy($id_ubicacion)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            Ubicacion::findOrFail($id_ubicacion)->delete();
            $response['success'] = true;
            $response['message'] = 'Ubicación eliminada exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar la ubicación.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
