<?php

namespace App\Http\Controllers\AdminControllers;


use App\Models\Departamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;

class DepartamentosController extends Controller
{

    // Obtener Todos los Departamentos
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];


        try {

            $departamentos = Departamento::all([
                'id_departamento',
                'nombre_departamento',
                'descripcion',
                'tipo_departamento',
                'atiende_pacientes',
                'estatus_activo',
                'created_at',
                'updated_at'
            ]);


            if ($departamentos->isEmpty()) {
                $response['message'] = 'No se encontraron departamentos.';
            } else {
                $response['success'] = true;
                $response['data'] = $departamentos;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los departamentos: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }



    /// STORE (crear Departamento)
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'nombre_departamento' => 'required|string|max:255',
            'descripcion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {

            $input = $request->all();

            // Crear el departamento con los datos del request
            $departamento = Departamento::create($input);


            $response["success"] = true;
            $response['message'] = 'Departamento registrado exitosamente!';
            $response['data'] = $departamento;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el departamento: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }


    // Obtener un Usuario por ID
    public function show($id) {}

    // Actualizar Usuario
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => ""];


        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un Usuario
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];



        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
