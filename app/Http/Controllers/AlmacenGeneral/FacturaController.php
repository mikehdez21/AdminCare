<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\MovimientosActivos;
use Illuminate\Support\Facades\DB;

class FacturaController extends Controller
{
    private function generarClaveLoteActivo(array $activoData): string
    {
        return implode('|', [
            strtoupper(trim((string) ($activoData['nombre_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['marca_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['modelo_af'] ?? ''))),
            (string) ($activoData['id_clasificacion'] ?? 0),
            number_format((float) ($activoData['precio_unitario_af'] ?? 0), 2, '.', ''),
            strtoupper(trim((string) ($activoData['descripcion_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['observaciones_af'] ?? ''))),
            (string) (int) (($activoData['af_propio'] ?? false) ? 1 : 0),
            (string) ($activoData['id_estado_af'] ?? 0),
        ]);
    }

    private function normalizarNumeroFactura(string $numeroFactura): string
    {
        $valor = strtoupper(trim($numeroFactura));

        if (preg_match('/^NOF-(\d{4})-(\d{1,12})$/', $valor, $matchFormatoCompleto)) {
            return sprintf('NOF-%s-%s', $matchFormatoCompleto[1], $matchFormatoCompleto[2]);
        }

        if (preg_match('/^\d{1,12}$/', $valor)) {
            return sprintf('NOF-%s-%s', date('Y'), $valor);
        }

        return $valor;
    }

    // Obtener todas las facturas
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $facturas = FacturaAF::all();

            if ($facturas->isEmpty()) {
                $response['message'] = 'No se encontraron facturas.';
            } else {
                $response['success'] = true;
                $response['data'] = $facturas;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener las facturas: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear una nueva factura
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            

            $validatedData = $request->validate([
                'id_proveedor' => 'required|integer',
                'num_factura' => ['required', 'string', 'max:255', "regex:/^(\\d{1,12}|NOF-\\d{4}-\\d{1,12})$/"],
                'id_tipo_factura' => 'required|integer',
                'fecha_fac_recepcion' => 'required|date',
                'id_forma_pago' => 'required|integer',
                'id_tipo_moneda' => 'required|integer',
                'observaciones_factura' => 'nullable|string',
                'subtotal_factura' => 'required|numeric',
                'descuento_factura' => 'nullable|numeric',
                'flete_factura' => 'nullable|numeric',
                'iva_factura' => 'required|numeric',
                'total_factura' => 'required|numeric',
                'activos' => 'nullable|array',
                // Datos completos del activo para creación
                'activos.*.nombre_af' => 'required_with:activos|string|max:255',
                'activos.*.marca_af' => 'required_with:activos|string|max:255',
                'activos.*.modelo_af' => 'required_with:activos|string|max:255',
                'activos.*.numero_serie_af' => 'required_with:activos|string|max:255',
                'activos.*.precio_unitario_af' => 'required_with:activos|numeric|min:0',
                'activos.*.af_propio' => 'required_with:activos|boolean',
                'activos.*.id_estado_af' => 'required_with:activos|integer',
                'activos.*.fecha_registro_af' => 'required_with:activos|date',
                'activos.*.id_clasificacion' => 'required_with:activos|integer',
                'activos.*.descripcion_af' => 'nullable|string',
                'activos.*.observaciones_af' => 'nullable|string',
                // Datos de la relación factura-activo
                'activos.*.cantidad' => 'required_with:activos|integer|min:1',
                'activos.*.observaciones' => 'nullable|string',
                // Datos opcionales para movimiento/asignación inicial
                'activos.*.fecha_movimiento' => 'nullable|date',
                'activos.*.id_responsable_actual' => 'nullable|integer',
                'activos.*.id_ubicacion_actual' => 'nullable|integer',
                'activos.*.id_tipo_movimiento' => 'nullable|integer',
                'activos.*.motivo_asignacion' => 'nullable|string'
            ]);

            DB::beginTransaction();

            $numeroFacturaFormateado = $this->normalizarNumeroFactura($validatedData['num_factura']);

            // Crear la factura
            $factura = FacturaAF::create([
                'id_proveedor' => $validatedData['id_proveedor'],
                'num_factura' => $numeroFacturaFormateado,
                'id_tipo_factura' => $validatedData['id_tipo_factura'],
                'fecha_fac_recepcion' => $validatedData['fecha_fac_recepcion'],
                'id_forma_pago' => $validatedData['id_forma_pago'],
                'id_tipo_moneda' => $validatedData['id_tipo_moneda'],
                'observaciones_factura' => $validatedData['observaciones_factura'] ?? null,
                'subtotal_factura' => $validatedData['subtotal_factura'],
                'descuento_factura' => $validatedData['descuento_factura'] ?? 0,
                'flete_factura' => $validatedData['flete_factura'] ?? 0,
                'iva_factura' => $validatedData['iva_factura'],
                'total_factura' => $validatedData['total_factura']
            ]);


            // Asociar activos si existen
            if (isset($validatedData['activos']) && !empty($validatedData['activos'])) {
                $activosAgrupados = [];

                foreach ($validatedData['activos'] as $activoData) {
                    $cantidadLinea = max(1, (int) ($activoData['cantidad'] ?? 1));
                    $claveLote = $this->generarClaveLoteActivo($activoData);

                    if (!isset($activosAgrupados[$claveLote])) {
                        $activosAgrupados[$claveLote] = [];
                    }

                    for ($n = 0; $n < $cantidadLinea; $n++) {
                        $activosAgrupados[$claveLote][] = $activoData;
                    }
                }

                preg_match('/^NOF-(\\d{4})-(\\d{1,12})$/', (string) $factura->num_factura, $matchNumeroFactura);
                $numeroFacturaConsecutivo = $matchNumeroFactura[2] ?? '';

                foreach (array_values($activosAgrupados) as $lineaIndex => $grupoActivos) {
                    $totalLote = count($grupoActivos);
                    $codigoLote = 'LT' . ($lineaIndex + 1) . '- F' . ($numeroFacturaConsecutivo ?: $factura->id_factura);

                    foreach ($grupoActivos as $i => $activoData) {
                        $datosActivo = [
                            'nombre_af' => $activoData['nombre_af'],
                            'marca_af' => $activoData['marca_af'],
                            'modelo_af' => $activoData['modelo_af'],
                            'numero_serie_af' => $activoData['numero_serie_af'],
                            'precio_unitario_af' => $activoData['precio_unitario_af'],
                            'af_propio' => $activoData['af_propio'],
                            'id_estado_af' => $activoData['id_estado_af'],
                            'id_clasificacion' => $activoData['id_clasificacion'],
                            'descripcion_af' => $activoData['descripcion_af'] ?? null,
                            'observaciones_af' => $activoData['observaciones_af'] ?? null,
                            'codigo_lote' => $codigoLote,
                            'lote_afconsecutivo' => $i + 1,
                            'lote_total' => $totalLote,
                            'fecha_registro_af' => $activoData['fecha_registro_af'],
                        ];

                        $resultadoActivo = ActivosFijos::crearConQR($datosActivo, false);

                        if (!$resultadoActivo['success']) {
                            throw new \Exception('Error al crear activo: ' . $resultadoActivo['message']);
                        }

                        $nuevoActivo = $resultadoActivo['data'] ?? null;

                        if (!$nuevoActivo || !isset($nuevoActivo->id_activo_fijo)) {
                            throw new \Exception('Error al crear activo: respuesta inválida al crear activo fijo.');
                        }

                        $nuevoActivo->codigo_etiqueta = sprintf(
                            '%s-F%d-L%d-C%d-LT%s',
                            $nuevoActivo->codigo_unico,
                            $factura->id_factura,
                            $lineaIndex + 1,
                            $i + 1,
                            $totalLote
                        );
                        $nuevoActivo->save();

                        $resultadoQRFinal = \App\Models\AlmacenGeneral\CodigosQRAF::generarParaActivo(
                            $nuevoActivo->id_activo_fijo,
                            true
                        );

                        if (!$resultadoQRFinal['success']) {
                            throw new \Exception('Error al generar QR final: ' . ($resultadoQRFinal['message'] ?? 'Error desconocido'));
                        }

                        FacturaActivos::create([
                            'id_factura' => $factura->id_factura,
                            'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                            'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                        ]);

                        if (isset($activoData['id_responsable_actual']) || isset($activoData['id_ubicacion_actual'])) {
                            MovimientosActivos::create([
                                'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                                'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                                'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Compra inicial - Factura ' . $factura->num_factura,
                                'fecha_movimiento' => $activoData['fecha_movimiento'],
                                'id_responsable_anterior' => null,
                                'id_responsable_actual' => $activoData['id_responsable_actual'] ?? null,
                                'id_ubicacion_anterior' => null,
                                'id_ubicacion_actual' => $activoData['id_ubicacion_actual'] ?? null,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Factura creada exitosamente.';
            $response['data'] = $factura->load('facturaActivos.activoFijo');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $response['message'] = 'Errores de validación.' . $e->getMessage();;
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            DB::rollBack();
            $response['message'] = 'Error al crear la factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    
    // Actualizar una factura
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $factura = FacturaAF::findOrFail($id);

            DB::beginTransaction();

            $validatedData = $request->validate([
                'id_proveedor' => 'required|integer',
                'num_factura' => ['nullable', 'string', 'max:255', 'regex:/^(\d{1,12}|NOF-\d{4}-\d{1,12})$/'],
                'id_tipo_factura' => 'required|integer',
                'fecha_fac_recepcion' => 'required|date',
                'id_forma_pago' => 'required|integer',
                'id_tipo_moneda' => 'required|integer',
                'observaciones_factura' => 'nullable|string',
                'subtotal_factura' => 'required|numeric',
                'descuento_factura' => 'nullable|numeric',
                'flete_factura' => 'nullable|numeric',
                'iva_factura' => 'required|numeric',
                'total_factura' => 'required|numeric',
                'activos' => 'nullable|array',
                // Caso 1: activo existente
                'activos.*.id_activo_fijo' => 'nullable|integer',
                // Caso 2: nuevo activo con datos completos
                'activos.*.nombre_af' => 'nullable|string|max:255',
                'activos.*.marca_af' => 'nullable|string|max:255',
                'activos.*.modelo_af' => 'nullable|string|max:255',
                'activos.*.numero_serie_af' => 'nullable|string|max:255',
                'activos.*.precio_unitario_af' => 'nullable|numeric|min:0',
                'activos.*.af_propio' => 'nullable|boolean',
                'activos.*.id_estado_af' => 'nullable|integer',
                'activos.*.fecha_registro_af' => 'nullable|date',
                'activos.*.id_clasificacion' => 'nullable|integer',
                'activos.*.descripcion_af' => 'nullable|string',
                'activos.*.observaciones_af' => 'nullable|string',
                // Datos de factura-activo
                'activos.*.cantidad' => 'required_with:activos|integer|min:1',
                'activos.*.observaciones' => 'nullable|string',
                // Datos opcionales de movimiento inicial para nuevos activos
                'activos.*.fecha_movimiento' => 'nullable|date',
                'activos.*.id_responsable_actual' => 'nullable|integer',
                'activos.*.id_ubicacion_actual' => 'nullable|integer',
                'activos.*.id_tipo_movimiento' => 'nullable|integer',
                'activos.*.motivo_asignacion' => 'nullable|string'
            ]);

            if (!empty($validatedData['num_factura'])) {
                $validatedData['num_factura'] = $this->normalizarNumeroFactura($validatedData['num_factura']);
            }

            $factura->update($validatedData);

            // Eliminar los activos existentes asociados a la factura
            FacturaActivos::where('id_factura', $factura->id_factura)->delete();

            // Agregar los nuevos activos asociados a la factura
            if (isset($validatedData['activos']) && !empty($validatedData['activos'])) {
                $activosNuevosAgrupados = [];

                foreach ($validatedData['activos'] as $activoData) {
                    $esActivoExistente = !empty($activoData['id_activo_fijo']) && (int)$activoData['id_activo_fijo'] > 0;

                    // Caso 1: activo existente
                    if ($esActivoExistente) {
                        FacturaActivos::create([
                            'id_factura' => $factura->id_factura,
                            'id_activo_fijo' => $activoData['id_activo_fijo'],
                            'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                        ]);

                        continue;
                    }

                    // Caso 2: activo nuevo (crear N activos individuales por cantidad)
                    $camposRequeridos = [
                        'nombre_af',
                        'marca_af',
                        'modelo_af',
                        'numero_serie_af',
                        'precio_unitario_af',
                        'af_propio',
                        'id_estado_af',
                        'id_clasificacion',
                    ];

                    foreach ($camposRequeridos as $campo) {
                        if (!array_key_exists($campo, $activoData) || $activoData[$campo] === null || $activoData[$campo] === '') {
                            throw \Illuminate\Validation\ValidationException::withMessages([
                                "activos" => ["Falta el campo requerido '{$campo}' para crear un activo nuevo en la actualización."]
                            ]);
                        }
                    }

                    $cantidadLinea = max(1, (int) ($activoData['cantidad'] ?? 1));
                    $claveLote = $this->generarClaveLoteActivo($activoData);

                    if (!isset($activosNuevosAgrupados[$claveLote])) {
                        $activosNuevosAgrupados[$claveLote] = [];
                    }

                    for ($n = 0; $n < $cantidadLinea; $n++) {
                        $activosNuevosAgrupados[$claveLote][] = $activoData;
                    }
                }

                preg_match('/^NOF-(\\d{4})-(\\d{1,12})$/', (string) $factura->num_factura, $matchNumeroFactura);
                $numeroFacturaConsecutivo = $matchNumeroFactura[2] ?? '';

                foreach (array_values($activosNuevosAgrupados) as $lineaIndex => $grupoActivos) {
                    $totalLote = count($grupoActivos);
                    $codigoLote = 'LT' . ($lineaIndex + 1) . '- F' . ($numeroFacturaConsecutivo ?: $factura->id_factura);

                    foreach ($grupoActivos as $i => $activoData) {
                        $datosActivo = [
                            'nombre_af' => $activoData['nombre_af'],
                            'marca_af' => $activoData['marca_af'],
                            'modelo_af' => $activoData['modelo_af'],
                            'numero_serie_af' => $activoData['numero_serie_af'],
                            'precio_unitario_af' => $activoData['precio_unitario_af'],
                            'af_propio' => $activoData['af_propio'],
                            'id_estado_af' => $activoData['id_estado_af'],
                            'fecha_registro_af' => $activoData['fecha_registro_af'],
                            'id_clasificacion' => $activoData['id_clasificacion'],
                            'descripcion_af' => $activoData['descripcion_af'] ?? null,
                            'observaciones_af' => $activoData['observaciones_af'] ?? null,
                            'codigo_lote' => $codigoLote,
                            'lote_afconsecutivo' => $i + 1,
                            'lote_total' => $totalLote,
                        ];

                        $resultadoActivo = ActivosFijos::crearConQR($datosActivo, false);

                        if (!$resultadoActivo['success']) {
                            throw new \Exception($resultadoActivo['message'] ?? 'Error al crear activo durante actualización de factura.');
                        }

                        $nuevoActivo = $resultadoActivo['data'] ?? null;

                        if (!$nuevoActivo || !isset($nuevoActivo->id_activo_fijo)) {
                            throw new \Exception('Error al crear activo durante actualización: respuesta inválida al crear activo fijo.');
                        }

                        $nuevoActivo->codigo_etiqueta = sprintf(
                            '%s-F%d-L%d-C%d-LT%s',
                            $nuevoActivo->codigo_unico,
                            $factura->id_factura,
                            $lineaIndex + 1,
                            $i + 1,
                            $totalLote
                        );
                        $nuevoActivo->save();

                        $resultadoQRFinal = \App\Models\AlmacenGeneral\CodigosQRAF::generarParaActivo(
                            $nuevoActivo->id_activo_fijo,
                            true
                        );

                        if (!$resultadoQRFinal['success']) {
                            throw new \Exception('Error al generar QR final: ' . ($resultadoQRFinal['message'] ?? 'Error desconocido'));
                        }

                        FacturaActivos::create([
                            'id_factura' => $factura->id_factura,
                            'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                            'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                        ]);

                        if (!empty($activoData['id_responsable_actual']) && !empty($activoData['id_ubicacion_actual'])) {
                            MovimientosActivos::create([
                                'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                                'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                                'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Asignación inicial por actualización de factura',
                                'fecha_movimiento' => $activoData['fecha_movimiento'],
                                'id_responsable_anterior' => null,
                                'id_responsable_actual' => $activoData['id_responsable_actual'],
                                'id_ubicacion_anterior' => null,
                                'id_ubicacion_actual' => $activoData['id_ubicacion_actual'],
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Factura actualizada exitosamente.';
            $response['data'] = $factura->load('facturaActivos.activoFijo');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Factura no encontrada.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar la factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    
    // Eliminar una factura
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            FacturaAF::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Factura eliminada exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar la factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Obtener una factura por ID
    public function show($id)
    {
        try {
            $factura = FacturaAF::findOrFail($id);

            return response()->json($factura->load('facturaActivos.activoFijo'), 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Factura no encontrada: ' . $e->getMessage()], 404);
        }
    }

    // Obtener los tipos de facturas
    public function getTiposFacturas()
    {
        try {
            $API_tiposfacturas = DB::table('almacengeneral.tableRef_TiposFacturasAF')
                ->select('id_tipofacturaaf', 'nombre_tipofactura')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_tiposfacturas,
                'message' => 'DatosAPI - TiposFacturas'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de factura.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*

    // Subir un archivo adjunto de una factura
    public function subirAdjunto(Request $request, $idFactura)
    {
        $request->validate([
            'archivo' => 'required|file|max:10240', // Máximo 10MB
            'descripcion' => 'nullable|string|max:255',
        ]);

        $factura = FacturaAF::findOrFail($idFactura);
        $adjunto = $factura->agregarAdjunto($request->file('archivo'), $request->descripcion);

        return response()->json([
            'success' => true,
            'message' => 'Archivo subido exitosamente',
            'data' => $adjunto,
        ]);
    }
        */
}
