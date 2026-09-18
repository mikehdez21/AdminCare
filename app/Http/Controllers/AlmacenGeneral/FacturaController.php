<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\MovimientosActivos;
use App\Services\FacturasActivos\FacturaActivoService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\DemoQuotaExceeded;
use App\Services\DemoQuotaService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class FacturaController extends Controller
{
    use Paginable;

    protected $facturaActivoService; // Declarar propiedad para el servicio

    // Inyectar el servicio en el constructor
    public function __construct(FacturaActivoService $facturaActivoService)
    {
        $this->facturaActivoService = $facturaActivoService;
    }

    private function generarClaveLoteActivo(array $activoData): string
    {
        return implode('|', [
            strtoupper(trim((string) ($activoData['nombre_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['marca_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['modelo_af'] ?? ''))),
            (string) ($activoData['id_clasificacion'] ?? 0),
            number_format((float) ($activoData['costo_unitario_af'] ?? 0), 2, '.', ''),
            strtoupper(trim((string) ($activoData['descripcion_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['observaciones_af'] ?? ''))),
            (string) (int) (($activoData['af_propio'] ?? false) ? 1 : 0),
            (string) ($activoData['id_estado_af'] ?? 0),
        ]);
    }

    // Obtener todas las facturas
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                FacturaAF::query()->orderBy('id_factura', 'asc'),
                ['id_factura']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron facturas.';
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
            report($e);
            $response['message'] = 'No fue posible obtener las facturas.';
        }

        return response()->json($response, 200);
    }

    // Crear una nueva factura
    public function store(Request $request, DemoQuotaService $quota)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {

            // Validar que no se duplique el número de factura para el mismo proveedor
            $existingFactura = FacturaAF::where('id_proveedor', $request->input('id_proveedor'))
                ->where('num_factura', 'LIKE', '%'.$request->input('num_factura').'%')
                ->first();

            if ($existingFactura) {
                $response['message'] = 'Ya existe una factura con el mismo número para este proveedor.';

                return response()->json($response, 422);
            }

            $validatedData = $request->validate([
                'id_proveedor' => 'required|integer',
                'num_factura' => ['sometimes', 'required', 'string', 'max:20', 'regex:/^NOF-\d{4}-[A-Za-z0-9]+$/'],
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
                'activos.*.costo_unitario_af' => 'nullable|regex:/^\d+(\.\d{1,6})?$/',
                'activos.*.af_propio' => 'required_with:activos|boolean',
                'activos.*.af_menor' => 'nullable|boolean',
                'activos.*.id_estado_af' => 'required_with:activos|integer',
                'activos.*.fecha_registro_af' => 'required_with:activos|date',
                'activos.*.id_clasificacion' => 'nullable|integer',
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
                'activos.*.motivo_asignacion' => 'nullable|string',
            ]);

            DB::beginTransaction();

            $requestedUnits = 1;
            foreach ($validatedData['activos'] ?? [] as $activoData) {
                $requestedUnits += max(1, (int) ($activoData['cantidad'] ?? 1));
            }
            $quota->assertCanAdd($requestedUnits);

            // Crear la factura
            $factura = FacturaAF::create([
                'id_proveedor' => $validatedData['id_proveedor'],
                'num_factura' => $validatedData['num_factura'],
                'id_tipo_factura' => $validatedData['id_tipo_factura'],
                'fecha_fac_recepcion' => $validatedData['fecha_fac_recepcion'],
                'id_forma_pago' => $validatedData['id_forma_pago'],
                'id_tipo_moneda' => $validatedData['id_tipo_moneda'],
                'observaciones_factura' => $validatedData['observaciones_factura'],
                'subtotal_factura' => $validatedData['subtotal_factura'],
                'descuento_factura' => $validatedData['descuento_factura'] ?? 0,
                'flete_factura' => $validatedData['flete_factura'] ?? 0,
                'iva_factura' => $validatedData['iva_factura'],
                'total_factura' => $validatedData['total_factura'],
            ]);

            // Asociar activos si existen
            if (isset($validatedData['activos']) && ! empty($validatedData['activos'])) {
                $activosAgrupados = [];

                foreach ($validatedData['activos'] as $activoData) {
                    $cantidadLinea = max(1, (int) ($activoData['cantidad'] ?? 1));
                    $claveLote = $this->generarClaveLoteActivo($activoData);

                    if (! isset($activosAgrupados[$claveLote])) {
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
                    $codigoLote = 'LT'.($lineaIndex + 1).'- F'.($numeroFacturaConsecutivo ?: $factura->id_factura);

                    foreach ($grupoActivos as $i => $activoData) {
                        $datosActivo = [
                            'nombre_af' => $activoData['nombre_af'],
                            'marca_af' => $activoData['marca_af'],
                            'modelo_af' => $activoData['modelo_af'],
                            'numero_serie_af' => $activoData['numero_serie_af'],
                            'costo_unitario_af' => $activoData['costo_unitario_af'],
                            'af_propio' => $activoData['af_propio'],
                            'af_menor' => $activoData['af_menor'],
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

                        if (! $resultadoActivo['success']) {
                            throw new \Exception('Error al crear activo: '.$resultadoActivo['message']);
                        }

                        $nuevoActivo = $resultadoActivo['data'] ?? null;

                        if (! $nuevoActivo || ! isset($nuevoActivo->id_activo_fijo)) {
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

                         // QR and its persistent record are disabled in demo mode.
                         if (! config('app.demo_mode')) {
                             $resultadoQRFinal = CodigosQRAF::generarParaActivo($nuevoActivo->id_activo_fijo, true);
                             if (! $resultadoQRFinal['success']) {
                                 throw new \RuntimeException('QR generation failed.');
                             }
                         }

                        FacturaActivos::create([
                            'id_factura' => $factura->id_factura,
                            'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                            'observaciones_detalleaf' => $activoData['observaciones'] ?? null,
                        ]);

                        if (isset($activoData['id_responsable_actual']) || isset($activoData['id_ubicacion_actual'])) {
                            MovimientosActivos::create([
                                'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                                'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                                'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Compra inicial - Factura '.$factura->num_factura,
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
        } catch (DemoQuotaExceeded $e) {
            DB::rollBack();
            $response['message'] = 'La demo permite como máximo 100 unidades de negocio.';
            $response['code'] = 'DEMO_QUOTA_EXCEEDED';
            $response['used'] = $e->used;
            $response['requested'] = $e->requested;
            $response['limit'] = $e->limit;
            return response()->json($response, 422);
        } catch (ValidationException $e) {
            DB::rollBack();
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            DB::rollBack();
            $response['message'] = 'No fue posible crear la factura.';
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar una factura - Versión 4: Clasificación robusta y validación separada (extracción corregida)
    public function update(Request $request, $id, DemoQuotaService $quota)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $factura = FacturaAF::findOrFail($id);
            Log::info('Factura encontrada para actualización: ', ['id_factura' => $factura->id_factura, 'num_factura' => $factura->num_factura]);

            // Log para depuración: Ver datos recibidos (estructura original)
            $logSafeBasic = [
                'request_keys' => array_keys($request->all()),
                'activos_count' => count($request->input('activos', [])),
            ];
            Log::info('Datos recibidos para actualización (básico): ', $logSafeBasic);

            DB::beginTransaction();

            $newAssetUnits = collect($request->input('activos', []))
                ->filter(static fn (array $asset): bool => empty($asset['id_activo_fijo']))
                ->sum(static fn (array $asset): int => max(1, (int) ($asset['cantidad'] ?? 1)));
            $quota->assertCanAdd($newAssetUnits);

            // --- PASO 1: Validar y actualizar campos de la factura principal ---
            // (Misma lógica que antes)
            $camposFacturaValidos = [
                'id_proveedor',
                'num_factura',
                'id_tipo_factura',
                'fecha_fac_recepcion',
                'id_forma_pago',
                'id_tipo_moneda',
                'observaciones_factura',
                'subtotal_factura',
                'descuento_factura',
                'flete_factura',
                'iva_factura',
                'total_factura',
            ];

            $datosFacturaRequest = $request->only($camposFacturaValidos);
            $camposActualizarFactura = [];

            if (! empty($datosFacturaRequest)) {
                $rulesFactura = [
                    'id_proveedor' => 'required|integer',
                    'num_factura' => ['required', 'string', 'max:20', 'regex:/^NOF-\d{4}-[A-Za-z0-9]+$/'],
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
                ];

                $validatedFacturaData = $request->validate($rulesFactura);

                if (isset($validatedFacturaData['num_factura'])) {
                    $existingFactura = FacturaAF::where('id_proveedor', $validatedFacturaData['id_proveedor'])
                        ->where('num_factura', $validatedFacturaData['num_factura'])
                        ->where('id_factura', '!=', $factura->id_factura)
                        ->first();
                    if ($existingFactura) {
                        throw new \Exception('Ya existe una factura con el mismo número para este proveedor.');
                    }
                }

                $camposActualizarFactura = $validatedFacturaData;
            }

            if (! empty($camposActualizarFactura)) {
                $factura->update($camposActualizarFactura);
            }

            // --- PASO 2: Manejar activos si se envían ---
            if ($request->has('activos')) {
                Log::info('Actualización de activos solicitada.', ['id_factura' => $factura->id_factura]);

                $inputActivos = $request->input('activos', []);

                // Validar estructura básica del array
                $request->validate(['activos' => 'required|array']);

                // --- CLASIFICACIÓN ROBUSTA ---
                $activosNuevos = [];
                $activosAsociadosNuevos = [];
                $activosExistentes = [];
                $idsActivosExistentesRecibidos = [];

                foreach ($inputActivos as $index => $activoData) {
                    if (isset($activoData['id_activo_fijo']) && is_numeric($activoData['id_activo_fijo']) && (int) $activoData['id_activo_fijo'] > 0) {
                        $id = (int) $activoData['id_activo_fijo'];
                        $activosExistentes[$index] = $activoData; // Temporalmente, se verificará
                        $idsActivosExistentesRecibidos[] = $id;
                    } else {
                        $activosNuevos[$index] = $activoData;
                    }
                }

                // Validar que los activos existentes realmente pertenecen a esta factura e identificar si hay nuevos activos asociados
                $idsActivosExistentesVerificados = [];
                foreach ($activosExistentes as $index => $activoData) {
                    $idActivo = (int) $activoData['id_activo_fijo'];
                    $existeAsociacion = FacturaActivos::where('id_factura', $factura->id_factura)
                        ->where('id_activo_fijo', $idActivo)
                        ->exists();

                    if ($existeAsociacion) {
                        // Era un activo ya asociado, mantenerlo en activosExistentes
                        $idsActivosExistentesVerificados[] = $idActivo;
                    } else {
                        $activosAsociadosNuevos[$index] = $activoData;
                        unset($activosExistentes[$index]); // Quitar de existentes
                    }
                }

                // Actualizar la lista de IDs verificados
                $idsActivosExistentesRecibidos = $idsActivosExistentesVerificados;

                Log::info('Clasificación de activos: ', [
                    'count_total' => count($inputActivos),
                    'count_nuevos' => count($activosNuevos),
                    'count_asociados_nuevos' => count($activosAsociadosNuevos),
                    'count_existentes' => count($activosExistentes),
                    'ids_existentes_verificados' => $idsActivosExistentesRecibidos,
                    'indices_asociados_nuevos' => array_keys($activosAsociadosNuevos),
                    'indices_existentes' => array_keys($activosExistentes),
                ]);

                // --- Procesar Activos Asociados Nuevos (Actualizar campos en ActivosFijos) ---
                // *** NUEVO BLOQUE: Este es el paso clave que faltaba ***}
                $idsActivosRecienAsociados = [];
                if (! empty($activosAsociadosNuevos)) {

                    // *** 1. Validar activosAsociadosNuevos ***
                    $rulesActivosAsociadosNuevos = [];
                    foreach (array_keys($activosAsociadosNuevos) as $index) {
                        $base = "activos.{$index}";
                        $rulesActivosAsociadosNuevos += [
                            // Incluir campos necesarios para determinar lotes y para actualizar Movimientos
                            "{$base}.id_activo_fijo" => 'required|integer',
                            "{$base}.nombre_af" => 'required|string|max:255',
                            "{$base}.marca_af" => 'required|string|max:255',
                            "{$base}.modelo_af" => 'required|string|max:255',
                            "{$base}.numero_serie_af" => 'required|string|max:255',
                            "{$base}.costo_unitario_af" => 'required|regex:/^\d+(\.\d{1,6})?$/',
                            "{$base}.af_propio" => 'required|boolean',
                            "{$base}.af_menor" => 'required|boolean',
                            "{$base}.id_estado_af" => 'required|integer',
                            "{$base}.fecha_registro_af" => 'required|date',
                            "{$base}.id_clasificacion" => 'required|integer',
                            "{$base}.descripcion_af" => 'nullable|string',
                            "{$base}.observaciones_af" => 'nullable|string',
                            "{$base}.cantidad" => 'required|integer|min:1',
                            "{$base}.observaciones" => 'nullable|string',
                            // Regla flexible para fecha_movimiento como en store
                            "{$base}.fecha_movimiento" => 'nullable|date',
                            "{$base}.id_responsable_actual" => 'nullable|integer',
                            "{$base}.id_ubicacion_actual" => 'nullable|integer',
                            "{$base}.id_tipo_movimiento" => 'nullable|integer',
                            "{$base}.motivo_asignacion" => 'nullable|string',
                        ];
                    }
                    $validatedDataFullAsociados = $request->validate($rulesActivosAsociadosNuevos);

                    // *** 2. Extraer datos validados ***
                    $validatedActivosAsociadosNuevos = [];
                    foreach (array_keys($activosAsociadosNuevos) as $index) {
                        if (isset($validatedDataFullAsociados['activos'][$index])) {
                            $validatedActivosAsociadosNuevos[$index] = $validatedDataFullAsociados['activos'][$index];
                        }
                    }

                    // *** 3. Cargar lotes actuales de la factura para calcular nuevos índices ***
                    $factura->loadMissing('facturaActivos.activoFijo');
                    $codigosLotesExistentes = $factura->facturaActivos->pluck('activoFijo.codigo_lote')->filter()->unique()->values()->sort();
                    $ultimoNumeroLineaExistente = 0;
                    $numerosLineaExistentes = [];
                    foreach ($codigosLotesExistentes as $codigoLote) {
                        if (preg_match('/^LT(\d+)-F\d+$/', $codigoLote, $matches)) {
                            $numerosLineaExistentes[] = (int) $matches[1];
                        }
                    }
                    if (! empty($numerosLineaExistentes)) {
                        $ultimoNumeroLineaExistente = max($numerosLineaExistentes);
                    }
                    $lineaIndexInicialAsociados = $ultimoNumeroLineaExistente + 1;

                    // *** 4. Agrupar activos asociados por clave de lote ***
                    $activosAsociadosAgrupados = [];
                    foreach ($validatedActivosAsociadosNuevos as $index => $activoData) {
                        $cantidadLinea = max(1, (int) ($activoData['cantidad'] ?? 1));
                        $claveLote = $this->generarClaveLoteActivo($activoData);

                        if (! isset($activosAsociadosAgrupados[$claveLote])) {
                            $activosAsociadosAgrupados[$claveLote] = [];
                        }

                        for ($n = 0; $n < $cantidadLinea; $n++) {
                            $itemActivoIndividual = $activoData;
                            $itemActivoIndividual['__original_index'] = $index; // Marcar de dónde vino
                            $activosAsociadosAgrupados[$claveLote][] = $itemActivoIndividual;
                        }
                    }

                    // *** 5. Procesar grupos y actualizar ActivosFijos ***
                    $currentLineIndexAsociados = $lineaIndexInicialAsociados;
                    foreach ($activosAsociadosAgrupados as $grupoActivos) {
                        $totalLote = count($grupoActivos);
                        $codigoLoteAsociado = 'LT'.$currentLineIndexAsociados.'-F'.$factura->id_factura;

                        foreach ($grupoActivos as $i => $activoData) {
                            $idActivoActualizar = (int) $activoData['id_activo_fijo'];

                            // Relación FacturaActivos: crear si no existe
                            $facturaActivoExistente = FacturaActivos::where('id_factura', $factura->id_factura)
                                ->where('id_activo_fijo', $idActivoActualizar)
                                ->first();
                            if (! $facturaActivoExistente) {
                                FacturaActivos::create([
                                    'id_factura' => $factura->id_factura,
                                    'id_activo_fijo' => $idActivoActualizar,
                                    'observaciones_detalleaf' => $activoData['observaciones'] ?? null,
                                ]);
                            }

                            // *** 5a. Actualizar ActivosFijos ***
                            $activoFijoActualizar = ActivosFijos::find($idActivoActualizar);
                            if ($activoFijoActualizar) {
                                $activoFijoActualizar->codigo_lote = $codigoLoteAsociado;
                                $activoFijoActualizar->lote_afconsecutivo = $i + 1;
                                $activoFijoActualizar->lote_total = $totalLote;
                                // Recalcular etiqueta si es necesario
                                $activoFijoActualizar->codigo_etiqueta = sprintf(
                                    '%s-F%d-L%d-C%d-LT%d',
                                    $activoFijoActualizar->codigo_unico,
                                    $factura->id_factura,
                                    $currentLineIndexAsociados,
                                    $i + 1,
                                    $totalLote
                                );
                                $activoFijoActualizar->save();

                                // *** REGENERAR QR DESPUÉS DE ACTUALIZAR LOS DATOS DEL ACTIVO ***
                                $resultadoRegeneracionQR = config('app.demo_mode')
                                    ? ['success' => true]
                                    : CodigosQRAF::regenerarQRActivoConFactura($idActivoActualizar);
                                if (! $resultadoRegeneracionQR['success']) {
                                    Log::warning('Error al regenerar QR para activo recién asociado a factura: '.$resultadoRegeneracionQR['message'], [
                                        'id_activo_fijo' => $idActivoActualizar,
                                        'codigo_lote' => $codigoLoteAsociado,
                                        'codigo_etiqueta' => $activoFijoActualizar->codigo_etiqueta,
                                    ]);
                                } else {
                                    Log::info('QR regenerado exitosamente para activo recién asociado a factura.', [
                                        'id_activo_fijo' => $idActivoActualizar,
                                        'codigo_etiqueta' => $activoFijoActualizar->codigo_etiqueta,
                                    ]);
                                }
                            } else {
                                Log::warning('Activo a actualizar no encontrado en ActivosFijos.', ['id_activo_fijo' => $idActivoActualizar]);

                                continue; // Saltar si no se encuentra
                            }

                            // *** 5b. Actualizar o Crear Movimiento para el activo asociado ***
                            $movimientoExistente = MovimientosActivos::where('id_activo_fijo', $idActivoActualizar)->first();
                            if ($movimientoExistente) {
                                // Actualizar movimiento existente
                                $movimientoExistente->update([
                                    'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? $movimientoExistente->id_tipo_movimiento,
                                    'motivo_movimiento' => $activoData['motivo_asignacion'] ?? $movimientoExistente->motivo_movimiento,
                                    'fecha_movimiento' => $activoData['fecha_movimiento'] ?? $movimientoExistente->fecha_movimiento,
                                    // id_responsable_anterior y id_ubicacion_anterior pueden mantenerse o actualizarse según regla de negocio
                                    'id_responsable_actual' => $activoData['id_responsable_actual'] ?? $movimientoExistente->id_responsable_actual,
                                    'id_ubicacion_actual' => $activoData['id_ubicacion_actual'] ?? $movimientoExistente->id_ubicacion_actual,
                                ]);
                            } else {
                                // Crear movimiento inicial si no existe
                                // Esta situación es rara para un activo "existente", pero se contempla
                                MovimientosActivos::create([
                                    'id_activo_fijo' => $idActivoActualizar,
                                    'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                                    'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Asociación a factura actualizada',
                                    'fecha_movimiento' => $activoData['fecha_movimiento'] ?? now(),
                                    'id_responsable_anterior' => null, // O valor anterior si aplica
                                    'id_responsable_actual' => $activoData['id_responsable_actual'],
                                    'id_ubicacion_anterior' => null, // O valor anterior si aplica
                                    'id_ubicacion_actual' => $activoData['id_ubicacion_actual'],
                                ]);
                            }
                        }
                        $currentLineIndexAsociados++; // Avanzar índice de línea para el próximo grupo
                    }

                    $idsActivosRecienAsociados = array_column($validatedActivosAsociadosNuevos, 'id_activo_fijo'); // Extraer los IDs
                    $idsActivosRecienAsociados = array_map('intval', $idsActivosRecienAsociados); // Asegurar enteros
                } // Fin del bloque para activosAsociadosNuevos

                // --- PASO 3: Manejar activos completamente NUEVOS ---
                if (! empty($activosExistentes)) {
                    $rulesActivosExistentes = [];
                    foreach (array_keys($activosExistentes) as $index) {
                        $base = "activos.{$index}";
                        $rulesActivosExistentes += [
                            "{$base}.id_activo_fijo" => 'required|integer',
                            "{$base}.observaciones" => 'nullable|string',
                            "{$base}.fecha_movimiento" => 'nullable|date',
                            "{$base}.id_responsable_actual" => 'nullable|integer',
                            "{$base}.id_ubicacion_actual" => 'nullable|integer',
                            "{$base}.id_tipo_movimiento" => 'nullable|integer',
                            "{$base}.motivo_asignacion" => 'nullable|string',
                        ];
                    }

                    $validatedDataFull = $request->validate($rulesActivosExistentes);

                    $validatedActivosExistentes = [];
                    foreach (array_keys($activosExistentes) as $index) {
                        if (isset($validatedDataFull['activos'][$index])) {
                            $validatedActivosExistentes[] = $validatedDataFull['activos'][$index];
                        }
                    }

                    // Obtener IDs actuales de la tabla FacturaActivos para esta factura
                    $idsActivosActuales = FacturaActivos::where('id_factura', $factura->id_factura)->pluck('id_activo_fijo')->toArray();

                    // IDs que se *espera* que sigan estando en la factura (existentes + recién asociados)
                    $idsEsperados = array_merge($idsActivosExistentesRecibidos, $idsActivosRecienAsociados);
                    $idsEsperados = array_unique($idsEsperados); // Asegurar unicidad

                    $idsAEliminar = array_diff($idsActivosActuales, $idsEsperados);
                    if (! empty($idsAEliminar)) {
                        FacturaActivos::where('id_factura', $factura->id_factura)
                            ->whereIn('id_activo_fijo', $idsAEliminar)
                            ->delete();
                        foreach ($idsAEliminar as $idActivoAEliminar) {
                            $activoDesasociado = ActivosFijos::find($idActivoAEliminar);
                            if ($activoDesasociado) {
                                $activoDesasociado->update([
                                    'codigo_lote' => 'SINFACTURA',
                                    'lote_afconsecutivo' => null,
                                    'lote_total' => null,
                                    'codigo_etiqueta' => $activoDesasociado->codigo_unico . '-SINFACTURA',
                                ]);
                            }
                        }

                        // *** REGENERAR QR PARA CADA ACTIVO DESASOCIADO ***
                        foreach ($idsAEliminar as $idActivoAEliminar) {
                            // Suponiendo que regenerarQRActivoSinFactura acepta el ID del activo fijo
                            // y actualiza el registro QR existente basado en la nueva etiqueta 'SINFACTURA'.
                            $resultadoRegeneracionQR = config('app.demo_mode')
                                ? ['success' => true]
                                : CodigosQRAF::regenerarQRActivoSinFactura($idActivoAEliminar);

                            if (! $resultadoRegeneracionQR['success']) {
                                Log::warning('Error al regenerar QR para activo desasociado de factura: '.$resultadoRegeneracionQR['message'], [
                                    'id_activo_fijo' => $idActivoAEliminar,
                                    'accion' => 'desasociacion_en_update',
                                ]);
                                // Opcional: Lanzar excepción si falla la regeneración del QR es crítico.
                                // throw new \Exception('Error al regenerar QR para activo desasociado: ' . $resultadoRegeneracionQR['message']);
                            } else {
                                Log::info('QR regenerado exitosamente para activo desasociado de factura.', [
                                    'id_activo_fijo' => $idActivoAEliminar,
                                    'codigo_etiqueta_resultante' => $resultadoRegeneracionQR['data']['codigo_qr'] ?? 'unknown',
                                ]);
                            }
                        }
                        Log::info('Activos anteriores eliminados según solicitud de existentes y excluyendo recién asociados.', ['id_factura' => $factura->id_factura, 'deleted_ids' => $idsAEliminar]);
                    } else {
                        Log::info('No hay activos para eliminar de la factura en esta actualización.', ['id_factura' => $factura->id_factura]);
                    }

                    // Procesar actualizaciones para los activos que se mantienen
                    foreach ($validatedActivosExistentes as $activoData) {
                        $idActivoRecibido = $activoData['id_activo_fijo'];
                        FacturaActivos::updateOrCreate(
                            ['id_factura' => $factura->id_factura, 'id_activo_fijo' => $idActivoRecibido],
                            ['observaciones_detalleaf' => $activoData['observaciones'] ?? null]
                        );

                        // Actualizar movimiento para activos ya existentes (no nuevos asociados)
                        $movimientoExistente = MovimientosActivos::where('id_activo_fijo', $idActivoRecibido)->first();
                        if ($movimientoExistente) {
                            $movimientoExistente->update([
                                'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? $movimientoExistente->id_tipo_movimiento,
                                'motivo_movimiento' => $activoData['motivo_asignacion'] ?? $movimientoExistente->motivo_movimiento,
                                'fecha_movimiento' => $activoData['fecha_movimiento'] ?? $movimientoExistente->fecha_movimiento,
                                'id_responsable_actual' => $activoData['id_responsable_actual'] ?? $movimientoExistente->id_responsable_actual,
                                'id_ubicacion_actual' => $activoData['id_ubicacion_actual'] ?? $movimientoExistente->id_ubicacion_actual,
                            ]);
                        }
                    }
                } else {
                    FacturaActivos::where('id_factura', $factura->id_factura)->delete();
                }

                // --- Validación y Creación de Activos Nuevos ---
                if (! empty($activosNuevos)) {
                    Log::info('Procesando activos NUEVOS bloque principal.', ['count' => count($activosNuevos)]); // Log adicional

                    // *** CORRECCIÓN: Preparar reglas de validación ***
                    $rulesActivosNuevos = [];
                    foreach (array_keys($activosNuevos) as $index) { // Usar índices reales
                        $base = "activos.{$index}"; // Referenciar el array original
                        $rulesActivosNuevos += [
                            // Importante: NO incluir 'id_activo_fijo' aquí
                            "{$base}.nombre_af" => 'required|string|max:255',
                            "{$base}.marca_af" => 'required|string|max:255',
                            "{$base}.modelo_af" => 'required|string|max:255',
                            "{$base}.numero_serie_af" => 'required|string|max:255',
                            "{$base}.costo_unitario_af" => 'required|regex:/^\d+(\.\d{1,6})?$/',
                            "{$base}.af_propio" => 'required|boolean',
                            "{$base}.af_menor" => 'required|boolean',
                            "{$base}.id_estado_af" => 'required|integer',
                            "{$base}.fecha_registro_af" => 'required|date',
                            "{$base}.id_clasificacion" => 'required|integer',
                            "{$base}.descripcion_af" => 'nullable|string',
                            "{$base}.observaciones_af" => 'nullable|string',
                            "{$base}.cantidad" => 'required|integer|min:1',
                            "{$base}.observaciones" => 'nullable|string',
                            // Regla flexible para fecha_movimiento como en store
                            "{$base}.fecha_movimiento" => 'nullable|date',
                            "{$base}.id_responsable_actual" => 'nullable|integer',
                            "{$base}.id_ubicacion_actual" => 'nullable|integer',
                            "{$base}.id_tipo_movimiento" => 'nullable|integer',
                            "{$base}.motivo_asignacion" => 'nullable|string',
                        ];
                    }

                    // Validar el array completo 'activos' con las reglas para los índices nuevos
                    $validatedDataFullNuevos = $request->validate($rulesActivosNuevos);

                    // *** CORRECCIÓN CRÍTICA: Extracción de datos validados para nuevos ***
                    $validatedActivosNuevos = [];
                    foreach (array_keys($activosNuevos) as $index) { // Iterar sobre índices nuevos, ej: [9]
                        // La salida de validate() para reglas como "activos.9.x" suele ser ['activos' => [9 => [...]]]
                        if (isset($validatedDataFullNuevos['activos'][$index])) { // Buscar ['activos'][9]
                            $validatedActivosNuevos[] = $validatedDataFullNuevos['activos'][$index];
                        } else {
                            Log::warning('Índice de activo nuevo no encontrado en datos validados.', ['index' => $index, 'validated_full_keys' => array_keys($validatedDataFullNuevos)]);
                            // Opcional: Lanzar excepción si se considera un error crítico
                            // throw new \Exception("Error interno: Datos del activo nuevo no validados correctamente.");
                        }
                    }

                    // *** CORRECCIÓN DE LA LOGICA DE LOTES ***
                    // Cargar los activos fijos asociados a la factura actualizados hasta ahora (excluyendo los nuevos que aún no se han creado)
                    // Es importante refrescar la relación si se modificaron activos existentes o se eliminaron en pasos anteriores
                    $factura->loadMissing('facturaActivos.activoFijo'); // loadMissing evita recargar si ya está cargada
                    $codigosLotesExistentes = $factura->facturaActivos->pluck('activoFijo.codigo_lote')->filter()->unique()->values()->sort(); // Filtrar nulos/empty

                    // Encontrar el último número de línea de lote basado en los códigos existentes
                    $ultimoNumeroLineaExistente = 0;
                    $numerosLineaExistentes = [];
                    foreach ($codigosLotesExistentes as $codigoLote) {
                        if (preg_match('/^LT(\d+)-F\d+$/', $codigoLote, $matches)) {
                            $numerosLineaExistentes[] = (int) $matches[1];
                        }
                    }
                    if (! empty($numerosLineaExistentes)) {
                        $ultimoNumeroLineaExistente = max($numerosLineaExistentes);
                    }
                    // Comenzar la numeración de nuevos lotes desde el siguiente número
                    $lineaIndexInicial = $ultimoNumeroLineaExistente + 1;
                    // *** FIN CORRECCIÓN DE LA LOGICA DE LOTES ***

                    // Agrupar los nuevos activos basados en la clave de lote, similar a como se hace en store
                    $activosNuevosAgrupados = [];
                    foreach ($validatedActivosNuevos as $activoData) {
                        $cantidadLinea = max(1, (int) ($activoData['cantidad'] ?? 1));
                        $claveLote = $this->generarClaveLoteActivo($activoData);

                        if (! isset($activosNuevosAgrupados[$claveLote])) {
                            $activosNuevosAgrupados[$claveLote] = [];
                        }

                        for ($n = 0; $n < $cantidadLinea; $n++) {
                            // Agregar el item individual (repitiendo la info segun cantidad) al grupo correspondiente
                            $itemActivoIndividual = $activoData; // Copia del array base
                            // Opcional: Agregar un índice temporal si es útil para debugging
                            // $itemActivoIndividual['__indice_original'] = array_search($activoData, $validatedActivosNuevos);
                            $activosNuevosAgrupados[$claveLote][] = $itemActivoIndividual;
                        }
                    }

                    // Procesar los grupos de nuevos activos
                    foreach (array_values($activosNuevosAgrupados) as $grupoIndex => $grupoActivos) {
                        $lineaIndex = $lineaIndexInicial + $grupoIndex; // Calcular el numero de linea para este grupo
                        $totalLote = count($grupoActivos);
                        // *** CORRECCIÓN: Usar $lineaIndex y el ID de factura real ***
                        $codigoLote = 'LT'.$lineaIndex.'-F'.$factura->id_factura; // Formato: LTn-F{idFactura}

                        foreach ($grupoActivos as $i => $activoData) {
                            try {
                                // --- CREAR NUEVO ACTIVO FIJO ---
                                $datosActivoIndividual = [
                                    'nombre_af' => $activoData['nombre_af'],
                                    'marca_af' => $activoData['marca_af'],
                                    'modelo_af' => $activoData['modelo_af'],
                                    'numero_serie_af' => $activoData['numero_serie_af'],
                                    'costo_unitario_af' => $activoData['costo_unitario_af'],
                                    'af_propio' => $activoData['af_propio'],
                                    'af_menor' => $activoData['af_menor'],
                                    'id_estado_af' => $activoData['id_estado_af'],
                                    'fecha_registro_af' => $activoData['fecha_registro_af'],
                                    'id_clasificacion' => $activoData['id_clasificacion'],
                                    'descripcion_af' => $activoData['descripcion_af'] ?? null,
                                    'observaciones_af' => $activoData['observaciones_af'] ?? null,
                                    'codigo_lote' => $codigoLote, // Asignar el codigo de lote calculado
                                    'lote_afconsecutivo' => $i + 1, // Consecutivo dentro del lote (1, 2, 3...)
                                    'lote_total' => $totalLote, // Total de items en este lote
                                ];

                                $resultadoActivo = ActivosFijos::crearConQR($datosActivoIndividual, false);
                                if (! $resultadoActivo['success']) {
                                    throw new \Exception($resultadoActivo['message'] ?? 'Error al crear activo nuevo.');
                                }

                                $nuevoActivo = $resultadoActivo['data'] ?? null;
                                if (! $nuevoActivo || ! isset($nuevoActivo->id_activo_fijo)) {
                                    throw new \Exception('Error al crear activo nuevo: respuesta inválida.');
                                }

                                // Generar etiqueta (usa el codigo unico del activo recien creado)
                                $nuevoActivo->codigo_etiqueta = sprintf(
                                    '%s-F%d-L%d-C%d-LT%d',
                                    $nuevoActivo->codigo_unico,
                                    $factura->id_factura,
                                    $lineaIndex, // Usar el numero de linea calculado
                                    $i + 1,     // Consecutivo individual (C1, C2..)
                                    $totalLote  // Total del lote para el sufijo LT
                                );
                                $nuevoActivo->save();

                                 if (! config('app.demo_mode')) {
                                     $resultadoQRFinal = CodigosQRAF::generarParaActivo($nuevoActivo->id_activo_fijo, true);
                                     if (! $resultadoQRFinal['success']) {
                                         throw new \RuntimeException('QR generation failed.');
                                     }
                                 }

                                // --- ASOCIAR NUEVO ACTIVO A FACTURA ---
                                FacturaActivos::create([
                                    'id_factura' => $factura->id_factura,
                                    'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                                    'observaciones_detalleaf' => $activoData['observaciones'] ?? null,
                                ]);

                                // --- CREAR MOVIMIENTO INICIAL PARA NUEVO ACTIVO ---
                                if (! empty($activoData['id_responsable_actual']) && ! empty($activoData['id_ubicacion_actual'])) {
                                    MovimientosActivos::create([
                                        'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                                        'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                                        'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Asociación inicial por actualización de factura',
                                        'fecha_movimiento' => $activoData['fecha_movimiento'] ?? now(),
                                        'id_responsable_anterior' => null,
                                        'id_responsable_actual' => $activoData['id_responsable_actual'],
                                        'id_ubicacion_anterior' => null,
                                        'id_ubicacion_actual' => $activoData['id_ubicacion_actual'],
                                    ]);
                                }
                            } catch (\Exception $e) {
                                Log::error('Error al procesar activo nuevo en update.', ['exception' => get_class($e)]);
                                throw $e; // Re-lanzar para que el rollback general lo capture
                            }
                        }
                    }
                } else {
                    Log::info('No se enviaron activos nuevos para crear (dentro del bloque update).', ['id_factura' => $factura->id_factura]);
                }
            } else {
                Log::info('No se solicitó actualizar los activos asociados.', ['id_factura' => $factura->id_factura]);
            }

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Factura actualizada exitosamente.';
            $response['data'] = $factura->load('facturaActivos.activoFijo');
        } catch (DemoQuotaExceeded $e) {
            DB::rollBack();
            $response['code'] = 'DEMO_QUOTA_EXCEEDED';
            $response['message'] = 'La demo permite como máximo 100 unidades de negocio.';
            $response['used'] = $e->used;
            $response['requested'] = $e->requested;
            $response['limit'] = $e->limit;
            return response()->json($response, 422);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            $response['message'] = 'Factura no encontrada.';
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Errores de validación al actualizar la factura.', ['errors' => $e->errors()]);
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            $response['message'] = 'No fue posible actualizar la factura.';
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar una factura
    public function destroy($id)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            FacturaAF::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Factura eliminada exitosamente.';
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible eliminar la factura.';
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
            report($e);
            return response()->json(['error' => 'Factura no encontrada.'], 404);
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
