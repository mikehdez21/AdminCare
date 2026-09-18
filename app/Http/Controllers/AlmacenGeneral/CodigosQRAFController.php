<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Models\AlmacenGeneral\ActivosFijos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CodigosQRAFController extends Controller
{

    /**
     * Listar todos los códigos QRAF
     */
    public function index()
    {

        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $qraf = CodigosQRAF::all();

            if ($qraf->isEmpty()) {
                $response['message'] = 'No se encontraron códigos QR.';
            } else {
                $response['success'] = true;
                $response['data'] = $qraf;
            }
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible obtener códigos QR.';
        }

        return response()->json($response, 200);
    }

    public function generarQR(Request $request, $idActivo)
    {
        if (config('app.demo_mode')) {
            return response()->json(['success' => false, 'message' => 'La generación de QR no está disponible en la demo.'], 501);
        }
        // Usar el método estático del modelo que encapsula toda la lógica
        $resultado = CodigosQRAF::generarParaActivo($idActivo);

        // Si ya existía un QR activo, retornar con código 200 (no es error)
        if ($resultado['success'] && isset($resultado['data']['ya_existia']) && $resultado['data']['ya_existia']) {
            return response()->json($resultado, 200);
        }

        // Retornar el resultado con el código HTTP apropiado
        return response()->json($resultado, $resultado['success'] ? 201 : 500);
    }

    /**
     * Generar QR con logo de la empresa
     */
    public function generarQRConLogo(Request $request, $idActivo)
    {
        if (config('app.demo_mode')) {
            return response()->json(['success' => false, 'message' => 'La generación de QR no está disponible en la demo.'], 501);
        }
        try {
            $activo = ActivosFijos::findOrFail($idActivo);
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)->firstOrFail();

            // Ruta del logo (debe estar en storage/app/public/img/logo/logoNegro.png)
            $rutaLogo = storage_path('app/public/img/logo/logoNegro.png');

            if (!file_exists($rutaLogo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Logo no encontrado en ' . $rutaLogo,
                ], 404);
            }

            $imagenBase64 = $qr->generarImagenQRConLogo($rutaLogo, 400);

            return response()->json([
                'success' => true,
                'data' => [
                    'qr' => $qr,
                    'imagen_base64' => $imagenBase64,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible generar la imagen QR.',
            ], 500);
        }
    }


    public function escanearQR($codigoQR)
    {
        try {
            // This is the historical endpoint: unlike the public resolver it
            // keeps recording scans when a persisted QR is available.
            $qraf = null;
            try {
                $qraf = CodigosQRAF::where('codigo_qr', $codigoQR)
                    ->where('activo', true)
                    ->first();
            } catch (\Throwable $exception) {
                // SQLite demo data may intentionally have no QR table/row.
                report($exception);
            }

            if ($qraf) {
                $qraf->registrarEscaneo();
            }

            // Browser-only/demo labels still resolve by the asset's stable code.
            $payload = $this->normalizarPayload($codigoQR);
            $activoVW = $this->consultaActivoEnriquecido(
                $qraf?->id_activo_fijo,
                $payload
            );

            if (!$activoVW) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró información del activo.',
                ], 404);
            }

            if ($qraf) {
                // Ocultar la relación activoFijo en el objeto qraf para evitar duplicación
                $qraf->makeHidden('activoFijo');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'qraf' => $qraf,
                    'activoVW' => $activoVW,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Código QR no encontrado o inactivo.',
            ], 404);
        }
    }

    /**
     * Resolve a QR payload for the public asset page.
     *
     * Current labels contain the asset's stable code, so this deliberately
     * does not require tableAF_CodigosQR (demo QR codes are browser-generated).
     * The legacy table is only consulted when it exists and is read-only.
     */
    public function resolverQR(string $codigoQR)
    {
        $notFound = static fn () => response()->json([
            'success' => false,
            'message' => 'Código QR no encontrado o inactivo.',
            'data' => null,
        ], 404);

        try {
            $payload = $this->normalizarPayload($codigoQR);

            if ($payload === '' || mb_strlen($payload) > 200) {
                return $notFound();
            }

            // Some old labels encoded the complete backend URL rather than
            // only the QR value. Keep accepting those without trusting input
            // from the URL for anything other than the final path segment.
            if (filter_var($payload, FILTER_VALIDATE_URL)) {
                $path = trim((string) parse_url($payload, PHP_URL_PATH), '/');
                $payload = rawurldecode((string) last(explode('/', $path)));
            }

            // Do not use the model serialization here.  The public QR contract is
            // the old vw_movimientosafcompletos contract, and model relations use
            // the default connection/table names (which breaks with PostgreSQL's
            // almacengeneral schema).  Build the read-only projection explicitly
            // and qualify the inventory tables according to the active driver.
            $connection = DB::connection();
            $assetTable = $this->almacenTable('tableAF_ActivosFijos');
            $hasMinor = Schema::connection($connection->getName())->hasColumn($assetTable, 'af_menor');
            $assetCode = str_starts_with($payload, 'QR') ? substr($payload, 2) : null;

            $activo = $connection->table($assetTable . ' as af')
                ->leftJoin($this->almacenTable('tableRef_EstatusAF') . ' as est', 'af.id_estado_af', '=', 'est.id_estatusaf')
                ->leftJoin($this->almacenTable('tableRef_ClasificacionesAF') . ' as clas', 'af.id_clasificacion', '=', 'clas.id_clasificacion')
                ->where(function ($query) use ($payload, $assetCode) {
                    $query->where('af.codigo_etiqueta', $payload)
                        ->orWhere('af.codigo_unico', $payload);
                    if ($assetCode !== null) {
                        $query->orWhere('af.codigo_etiqueta', $assetCode)
                            ->orWhere('af.codigo_unico', $assetCode);
                    }
                })
                ->select([
                    'af.id_activo_fijo', 'af.codigo_unico', 'af.codigo_etiqueta',
                    'af.codigo_lote', 'af.lote_afconsecutivo', 'af.lote_total',
                    'af.nombre_af', 'af.descripcion_af', 'af.modelo_af', 'af.marca_af',
                    'af.numero_serie_af', 'af.costo_unitario_af', 'af.fecha_registro_af',
                    'af.af_propio', 'af.id_estado_af', 'af.id_clasificacion',
                    'af.depreciacion_aplicada', 'af.observaciones_af',
                    'af.created_at', 'af.updated_at',
                    $hasMinor ? 'af.af_menor' : DB::raw('0 as af_menor'),
                    'est.descripcion_estatusaf as estado_actual',
                    'clas.nombre_clasificacion as clasificacion',
                ])
                ->first();

            // Legacy generated values are QR<codigo> and
            // QR<codigo>-SINFACTURA. This lookup is optional by design.
            if (!$activo) {
                try {
                    $legacy = $connection->table($this->almacenTable('tableAF_CodigosQR'))
                        ->where('codigo_qr', $payload)->where('activo', true)
                        ->first();
                } catch (\Throwable $exception) {
                    // Browser-only/demo deployments may not have the QR table.
                    $legacy = null;
                }

                if ($legacy) {
                    $activo = $connection->table($assetTable . ' as af')
                        ->leftJoin($this->almacenTable('tableRef_EstatusAF') . ' as est', 'af.id_estado_af', '=', 'est.id_estatusaf')
                        ->leftJoin($this->almacenTable('tableRef_ClasificacionesAF') . ' as clas', 'af.id_clasificacion', '=', 'clas.id_clasificacion')
                        ->where('af.id_activo_fijo', $legacy->id_activo_fijo)
                        ->select([
                            'af.id_activo_fijo', 'af.codigo_unico', 'af.codigo_etiqueta',
                            'af.codigo_lote', 'af.lote_afconsecutivo', 'af.lote_total',
                            'af.nombre_af', 'af.descripcion_af', 'af.modelo_af', 'af.marca_af',
                            'af.numero_serie_af', 'af.costo_unitario_af', 'af.fecha_registro_af',
                            'af.af_propio', 'af.id_estado_af', 'af.id_clasificacion',
                            'af.depreciacion_aplicada', 'af.observaciones_af',
                            'af.created_at', 'af.updated_at',
                            $hasMinor ? 'af.af_menor' : DB::raw('0 as af_menor'),
                            'est.descripcion_estatusaf as estado_actual',
                            'clas.nombre_clasificacion as clasificacion',
                        ])->first();
                }
            }

            if (!$activo) {
                return $notFound();
            }

            // Read-only metadata is deliberately optional. Browser-only QRs
            // have no row and must expose an explicit null, not invented data.
            $qraf = $this->qrMetadata($payload, $activo->id_activo_fijo);

            $movement = $connection->table($this->almacenTable('tableAF_MovimientosActivos') . ' as mov')
                ->leftJoin('tableEmpleados as emp_anterior', 'mov.id_responsable_anterior', '=', 'emp_anterior.id_empleado')
                ->leftJoin('tableEmpleados as emp_actual', 'mov.id_responsable_actual', '=', 'emp_actual.id_empleado')
                ->leftJoin('tableDepartamentos as dep_actual', 'emp_actual.id_departamento', '=', 'dep_actual.id_departamento')
                ->leftJoin('tableUbicaciones as ub_anterior', 'mov.id_ubicacion_anterior', '=', 'ub_anterior.id_ubicacion')
                ->leftJoin('tableUbicaciones as ub_actual', 'mov.id_ubicacion_actual', '=', 'ub_actual.id_ubicacion')
                ->leftJoin($this->almacenTable('tableRef_TiposMovimientosAF') . ' as tipmov', 'mov.id_tipo_movimiento', '=', 'tipmov.id_tipomovimientoaf')
                ->where('mov.id_activo_fijo', $activo->id_activo_fijo)
                ->orderByDesc('mov.fecha_movimiento')->first([
                    'mov.fecha_movimiento', 'mov.motivo_movimiento',
                    'emp_anterior.nombre_empleado as responsable_anterior_nombre',
                    'emp_anterior.apellido_paterno as responsable_anterior_paterno',
                    'emp_anterior.apellido_materno as responsable_anterior_materno',
                    'emp_actual.nombre_empleado as responsable_actual_nombre',
                    'emp_actual.apellido_paterno as responsable_actual_paterno',
                    'emp_actual.apellido_materno as responsable_actual_materno',
                    'dep_actual.nombre_departamento as departamento_actual',
                    'ub_anterior.nombre_ubicacion as ubicacion_anterior',
                    'ub_actual.nombre_ubicacion as ubicacion_actual',
                    'tipmov.nombre_tipomovimientoaf as tipo_movimiento',
                ]);

            $fullName = static function ($row, string $prefix): ?string {
                if (!$row) return null;
                $name = trim(implode(' ', array_filter([
                    $row->{$prefix . '_nombre'} ?? null,
                    $row->{$prefix . '_paterno'} ?? null,
                    $row->{$prefix . '_materno'} ?? null,
                ], static fn ($value) => $value !== null && $value !== '')));
                return $name !== '' ? $name : null;
            };

            // Explicit allow-list: this is intentionally the complete public
            // asset sheet, but excludes QR metadata and scan/audit information.
            return response()->json([
                'success' => true,
                'message' => 'Activo encontrado.',
                'data' => [
                    'qraf' => $qraf,
                    'codigo' => $activo->codigo_etiqueta ?: $activo->codigo_unico,
                     'codigo_unico' => $activo->codigo_unico,
                     'codigo_etiqueta' => $activo->codigo_etiqueta,
                     'codigo_lote' => $activo->codigo_lote,
                     'lote_afconsecutivo' => $activo->lote_afconsecutivo,
                     'lote_total' => $activo->lote_total,
                     'id_estado_af' => $activo->id_estado_af,
                     'id_clasificacion' => $activo->id_clasificacion,
                     'nombre' => $activo->nombre_af,
                     'nombre_af' => $activo->nombre_af,
                     'descripcion' => $activo->descripcion_af,
                     'descripcion_af' => $activo->descripcion_af,
                     'modelo' => $activo->modelo_af,
                     'modelo_af' => $activo->modelo_af,
                     'marca' => $activo->marca_af,
                     'marca_af' => $activo->marca_af,
                     'numero_serie' => $activo->numero_serie_af,
                     'numero_serie_af' => $activo->numero_serie_af,
                     'costo' => $activo->costo_unitario_af,
                     'costo_unitario_af' => $activo->costo_unitario_af,
                     'fecha_registro' => $activo->fecha_registro_af,
                     'fecha_registro_af' => $activo->fecha_registro_af,
                     'propio' => (bool) $activo->af_propio,
                     'af_propio' => (bool) $activo->af_propio,
                     'menor' => (bool) $activo->af_menor,
                     'af_menor' => (bool) $activo->af_menor,
                     'depreciacion_aplicada' => (bool) $activo->depreciacion_aplicada,
                     'etiqueta' => $activo->codigo_etiqueta,
                     'codigo_etiqueta' => $activo->codigo_etiqueta,
                     'observaciones' => $activo->observaciones_af,
                     'observaciones_af' => $activo->observaciones_af,
                     'created_at' => $activo->created_at,
                     'updated_at' => $activo->updated_at,
                     'estado' => $activo->estado_actual,
                     'estado_actual' => $activo->estado_actual,
                     'clasificacion' => $activo->clasificacion,
                     'responsable_anterior' => $fullName($movement, 'responsable_anterior'),
                     'responsable_actual' => $fullName($movement, 'responsable_actual'),
                     'responsable_anterior_completo' => $fullName($movement, 'responsable_anterior'),
                     'responsable_actual_completo' => $fullName($movement, 'responsable_actual'),
                     'departamento' => $movement?->departamento_actual,
                     'departamento_actual' => $movement?->departamento_actual,
                    'ubicacion_anterior' => $movement?->ubicacion_anterior,
                    'ubicacion_actual' => $movement?->ubicacion_actual,
                    'fecha_ultimo_movimiento' => $movement?->fecha_movimiento,
                    'ultimo_motivo_movimiento' => $movement?->motivo_movimiento,
                    'tipo_movimiento' => $movement?->tipo_movimiento,
                ],
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            return $notFound();
        }
    }

    /** Qualify inventory tables only on PostgreSQL; SQLite has no schema. */
    private function almacenTable(string $table): string
    {
        return DB::connection()->getDriverName() === 'pgsql' ? 'almacengeneral.' . $table : $table;
    }

    private function normalizarPayload(string $codigoQR): string
    {
        $payload = trim(rawurldecode($codigoQR));

        if (filter_var($payload, FILTER_VALIDATE_URL)) {
            $path = trim((string) parse_url($payload, PHP_URL_PATH), '/');
            $payload = rawurldecode((string) last(explode('/', $path)));
        }

        return $payload;
    }

    /** Return only persisted QR fields; never increments scan counters. */
    private function qrMetadata(string $payload, $assetId): ?array
    {
        try {
            $row = DB::connection()->table($this->almacenTable('tableAF_CodigosQR'))
                ->where('codigo_qr', $payload)
                ->where('id_activo_fijo', $assetId)
                ->where('activo', true)
                ->first([
                    'id_qraf', 'id_activo_fijo', 'codigo_qr', 'url_destino',
                    'fecha_generacion', 'fecha_ultimo_escaneo', 'activo',
                    'intentos_lectura', 'observaciones', 'created_at', 'updated_at',
                ]);

            return $row ? (array) $row : null;
        } catch (\Throwable $exception) {
            // A demo/browser-only QR is valid without a persisted QR row.
            return null;
        }
    }

    /**
     * SQLite-compatible equivalent of the historical enriched view query.
     * The optional id allows browser-only QR labels to use the same contract.
     */
    private function consultaActivoEnriquecido($assetId, string $payload): ?object
    {
        $connection = DB::connection();
        $assetTable = $this->almacenTable('tableAF_ActivosFijos');
        $assetCode = str_starts_with($payload, 'QR') ? substr($payload, 2) : null;
        $query = $connection->table($assetTable . ' as af')
            ->leftJoin($this->almacenTable('tableRef_EstatusAF') . ' as est', 'af.id_estado_af', '=', 'est.id_estatusaf')
             ->leftJoin($this->almacenTable('tableRef_ClasificacionesAF') . ' as clas', 'af.id_clasificacion', '=', 'clas.id_clasificacion')
            ->where(function ($query) use ($assetId, $payload) {
                if ($assetId !== null) {
                    $query->where('af.id_activo_fijo', $assetId);
                } else {
                    $query->where('af.codigo_etiqueta', $payload)
                        ->orWhere('af.codigo_unico', $payload)
                        ->when($assetCode !== null, function ($query) use ($assetCode) {
                            $query->orWhere('af.codigo_etiqueta', $assetCode)
                                ->orWhere('af.codigo_unico', $assetCode);
                        });
                }
            });

        $hasMinor = Schema::connection($connection->getName())->hasColumn($assetTable, 'af_menor');

        $asset = $query->select([
            'af.id_activo_fijo', 'af.codigo_unico', 'af.codigo_etiqueta',
            'af.codigo_lote', 'af.lote_afconsecutivo', 'af.lote_total',
            'af.nombre_af', 'af.descripcion_af', 'af.modelo_af', 'af.marca_af',
            'af.numero_serie_af', 'af.costo_unitario_af', 'af.fecha_registro_af',
            'af.af_propio', 'af.id_estado_af', 'af.id_clasificacion',
            'af.depreciacion_aplicada', 'af.observaciones_af',
            'af.created_at', 'af.updated_at',
            $hasMinor ? 'af.af_menor' : DB::raw('0 as af_menor'),
            'est.descripcion_estatusaf as estado_actual',
            'clas.nombre_clasificacion as clasificacion',
        ])->first();

        if (!$asset) {
            return null;
        }

        $movement = $connection->table($this->almacenTable('tableAF_MovimientosActivos') . ' as mov')
            ->leftJoin('tableEmpleados as emp', 'mov.id_responsable_actual', '=', 'emp.id_empleado')
            ->leftJoin('tableEmpleados as emp_prev', 'mov.id_responsable_anterior', '=', 'emp_prev.id_empleado')
            ->leftJoin('tableDepartamentos as dep', 'emp.id_departamento', '=', 'dep.id_departamento')
            ->leftJoin('tableUbicaciones as ub', 'mov.id_ubicacion_actual', '=', 'ub.id_ubicacion')
            ->leftJoin('tableUbicaciones as ub_prev', 'mov.id_ubicacion_anterior', '=', 'ub_prev.id_ubicacion')
            ->leftJoin($this->almacenTable('tableRef_TiposMovimientosAF') . ' as tip', 'mov.id_tipo_movimiento', '=', 'tip.id_tipomovimientoaf')
            ->where('mov.id_activo_fijo', $asset->id_activo_fijo)
            ->orderByDesc('mov.fecha_movimiento')
            ->first(['mov.fecha_movimiento', 'mov.motivo_movimiento',
                'emp.nombre_empleado', 'emp.apellido_paterno', 'emp.apellido_materno',
                'emp_prev.nombre_empleado as prev_nombre_empleado',
                'emp_prev.apellido_paterno as prev_apellido_paterno',
                'emp_prev.apellido_materno as prev_apellido_materno',
                'dep.nombre_departamento as departamento_actual',
                'ub.nombre_ubicacion as ubicacion_actual',
                'ub_prev.nombre_ubicacion as ubicacion_anterior',
                'tip.nombre_tipomovimientoaf as tipo_movimiento']);

        $asset->fecha_ultimo_movimiento = $movement?->fecha_movimiento;
        $asset->ultimo_motivo_movimiento = $movement?->motivo_movimiento;
        $asset->responsable_actual_completo = $movement
            ? trim(implode(' ', array_filter([$movement->nombre_empleado, $movement->apellido_paterno, $movement->apellido_materno])))
            : null;
        $asset->responsable_anterior_completo = $movement
            ? trim(implode(' ', array_filter([$movement->prev_nombre_empleado, $movement->prev_apellido_paterno, $movement->prev_apellido_materno])))
            : null;
        $asset->departamento_actual = $movement?->departamento_actual;
        $asset->ubicacion_anterior = $movement?->ubicacion_anterior;
        $asset->ubicacion_actual = $movement?->ubicacion_actual;
        $asset->tipo_movimiento = $movement?->tipo_movimiento;

        return $asset;
    }

    /**
     * Descargar imagen QR como archivo PNG
     */
    public function descargarQR($idActivo)
    {
        if (config('app.demo_mode')) {
            return response()->json(['success' => false, 'message' => 'La generación de QR no está disponible en la demo.'], 501);
        }
        try {
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)
                ->where('activo', true)
                ->firstOrFail();

            $activo = $qr->activoFijo;
            $label = $activo->codigo_etiqueta;

            // Generar PNG cuando GD esta disponible, si no usar SVG para evitar error 500.
            $usaPng = extension_loaded('gd');
            $writer = $usaPng
                ? new \Endroid\QrCode\Writer\PngWriter()
                : new \Endroid\QrCode\Writer\SvgWriter();

            $qrCode = new \Endroid\QrCode\QrCode(
                data: $qr->url_destino,
                encoding: new \Endroid\QrCode\Encoding\Encoding('UTF-8'),
                errorCorrectionLevel: \Endroid\QrCode\ErrorCorrectionLevel::High,
                size: 400,
                margin: 10,
                roundBlockSizeMode: \Endroid\QrCode\RoundBlockSizeMode::Margin,
                foregroundColor: new \Endroid\QrCode\Color\Color(0, 0, 0),
                backgroundColor: new \Endroid\QrCode\Color\Color(255, 255, 255)
            );

            $labelObj = new \Endroid\QrCode\Label\Label($label);

            $result = $writer->write($qrCode, null, $labelObj);

            $mimeType = $usaPng ? 'image/png' : 'image/svg+xml';
            $extension = $usaPng ? 'png' : 'svg';

            return response($result->getString())
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'attachment; filename="' . $qr->codigo_qr . '.' . $extension . '"');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible descargar el QR.',
            ], 500);
        }
    }

    /**
     * Desactivar código QR
     */
    public function desactivar($idQR)
    {
        try {
            $qr = CodigosQRAF::findOrFail($idQR);
            $qr->desactivar();

            return response()->json([
                'success' => true,
                'message' => 'Código QR desactivado exitosamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible desactivar el QR.',
            ], 500);
        }
    }
}
