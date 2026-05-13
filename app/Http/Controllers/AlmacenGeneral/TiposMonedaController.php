<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\MonedaPago;

class TiposMonedaController extends Controller
{
	// Obtener todos los tipos de moneda
	public function index()
	{
		$response = ["success" => false, "data" => [], "message" => ""];

		try {
			$tipos = MonedaPago::all([
				'id_tipomoneda',
				'descripcion_tipomoneda',
				'created_at',
				'updated_at'
			]);

			if ($tipos->isEmpty()) {
				$response['message'] = 'No se encontraron tipos de moneda.';
			} else {
				$response['success'] = true;
				$response['data'] = $tipos;
			}
		} catch (\Exception $e) {
			$response['message'] = 'Error al obtener los tipos de moneda: ' . $e->getMessage();
		}

		return response()->json($response, 200);
	}

	// Crear un nuevo tipo de moneda
	public function store(Request $request)
	{
		$response = ["success" => false, "message" => "", "data" => []];

		$validator = Validator::make($request->all(), [
			'descripcion_tipomoneda' => 'required|string|max:255',
		]);

		if ($validator->fails()) {
			return response()->json(["error" => $validator->errors()], 422);
		}

		try {
			$input = $request->all();
			$tipo = MonedaPago::create($input);

			$response['success'] = true;
			$response['message'] = 'Tipo de moneda registrado exitosamente!';
			$response['data'] = $tipo;
		} catch (\Exception $e) {
			$response['message'] = 'Error al crear el tipo de moneda: ' . $e->getMessage();
		}

		return response()->json($response, $response['success'] ? 201 : 500);
	}

	// Actualizar un tipo de moneda existente
	public function update(Request $request, $id)
	{
		$response = ["success" => false, "message" => "", "data" => []];

		try {
			$tipo = MonedaPago::findOrFail($id);
			$tipo->update($request->all());

			$response['success'] = true;
			$response['message'] = 'Tipo de moneda actualizado exitosamente.';
			$response['data'] = $tipo;
		} catch (\Exception $e) {
			$response['message'] = 'Error al actualizar el tipo de moneda: ' . $e->getMessage();
		}

		return response()->json($response, $response['success'] ? 200 : 500);
	}

	// Eliminar un tipo de moneda
	public function destroy($id)
	{
		$response = ["success" => false, "message" => ""];

		try {
			MonedaPago::destroy($id);
			$response['success'] = true;
			$response['message'] = 'Tipo de moneda eliminado exitosamente.';
			return response()->json($response, 200);
		} catch (\Exception $e) {
			$response['message'] = 'Error al eliminar el tipo de moneda: ' . $e->getMessage();
			return response()->json($response, 500);
		}
	}
}
