<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\Depreciacion;
use App\Models\AlmacenGeneral\MetodoDepreciacion;
use App\Services\Contabilidad\DepreciacionService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class DepreciacionController extends Controller
{
    // GET: Activos sin depreciar
    public function activosSinDepreciar()
    {
        return ActivosFijos::sinDepreciar()
            ->with('clasificacion', 'estado')
            ->paginate();
    }

    // GET: Activos en depreciación
    public function activosEnDepreciacion()
    {
        $activos = ActivosFijos::enDepreciacion()
            ->with('clasificacion', 'estado', 'ultimaDepreciacion.metodoDepreciacion')
            ->paginate();

        $activos->getCollection()->transform(function ($activo) {
            $ultimaDepreciacion = $activo->ultimaDepreciacion;

            if ($ultimaDepreciacion && $ultimaDepreciacion->fecha_inicio_depreciacion && $ultimaDepreciacion->vida_util_anios) {
                $fechaVencimiento = Carbon::parse($ultimaDepreciacion->fecha_inicio_depreciacion)
                    ->addYears((int) $ultimaDepreciacion->vida_util_anios)
                    ->startOfDay();

                $activo->setAttribute('fecha_vencimiento_depreciacion', $fechaVencimiento->toDateString());
                $activo->setAttribute('dias_restantes_vencimiento', Carbon::now()->startOfDay()->diffInDays($fechaVencimiento, false));
            } else {
                $activo->setAttribute('fecha_vencimiento_depreciacion', null);
                $activo->setAttribute('dias_restantes_vencimiento', null);
            }

            return $activo;
        });

        return $activos;
    }

    // POST: Activar depreciación de un activo
    public function activarDepreciacion($idActivo, Request $request)
    {
        $activo = ActivosFijos::findOrFail($idActivo);
        $valorInicial = $request->input('valor_inicialaf') ?? $activo->costo_unitario_af;

        $request->validate([
            'id_metodo_depreciacion' => 'required|integer',
            'fecha_inicio_depreciacion' => 'required|date',
            'vida_util_anios' => 'required|integer|min:1',
            'valor_residual_af' => 'required|numeric|min:0',
        ]);

        $metodo = MetodoDepreciacion::findOrFail($request->id_metodo_depreciacion);

        $anio = (int) date('Y', strtotime($request->fecha_inicio_depreciacion));

        // Crear una instancia temporal para el cálculo SIN modificar el $activo original
        $activoParaCalculo = clone $activo;
        $activoParaCalculo->depreciacion_aplicada = true;
        $activoParaCalculo->setRelation('metodoDepreciacion', $metodo);

        $service = new DepreciacionService();

        DB::beginTransaction();
        try {
            $resultado = $service->calcularDepreciacion(
                $activoParaCalculo,
                $anio,
                $request->valor_residual_af,
                $request->vida_util_anios
            );

            // Crear registro de depreciación con todos los snapshot fields
            $depreciacion = Depreciacion::create([
                'id_activo_fijo' => $activo->id_activo_fijo,
                'anio_depreciacionaf' => $anio,
                'valor_inicialaf' => $valorInicial,
                'valor_depreciacion_anterior' => 0,
                'valor_depreciacion_anual' => $resultado['valor_depreciacion_anual'],
                'valor_depreciacion_acumulada' => $resultado['valor_depreciacion_acumulada'],
                'valor_libros_af' => $resultado['valor_libros_af'],
                'id_metodo_depreciacionaf' => $request->id_metodo_depreciacion,
                'fecha_inicio_depreciacion' => $request->fecha_inicio_depreciacion,
                'vida_util_anios' => $request->vida_util_anios,
                'valor_residual_af' => $request->valor_residual_af,
                'fecha_calculo_depreciacion' => now(),
                'id_usuario_calculo' => Auth::id(),
                'id_estatus_depreciacion' => $request->id_estatus_depreciacion ?? 1,
            ]);

            // Actualizar SOLO el flag en ActivosFijos sin tocar snapshot fields
            ActivosFijos::where('id_activo_fijo', $idActivo)
                ->update(['depreciacion_aplicada' => true]);

            DB::commit();

            return response()->json(['success' => true, 'data' => $depreciacion, 'message' => 'Depreciación activada correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al activar depreciación: ' . $e->getMessage()], 500);
        }
    }

    // GET: Obtener depreciaciones de un activo
    public function historicoDepreciaciones($idActivo)
    {
        $historico = Depreciacion::with('metodoDepreciacion')
            ->where('id_activo_fijo', $idActivo)
            ->orderBy('anio_depreciacionaf')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $historico,
            'message' => $historico->isEmpty()
                ? 'Sin registros históricos para este activo.'
                : 'Histórico de depreciación cargado correctamente.',
        ]);
    }

    // POST: Calcular depreciación manual para un año
    public function calcularDepreciacion($idActivo, Request $request)
    {
        $activo = ActivosFijos::with('ultimaDepreciacion.metodoDepreciacion')->findOrFail($idActivo);
        $anio = $request->input('anio', now()->year);

        // Obtener el último registro de depreciación para extraer los snapshot fields
        $ultimaDepreciacion = $activo->ultimaDepreciacion;
        if (!$ultimaDepreciacion) {
            return response()->json(['success' => false, 'message' => 'Activo no tiene depreciación registrada'], 400);
        }

        // Obtener el método desde la relación de ultimaDepreciacion
        $metodo = $ultimaDepreciacion->metodoDepreciacion;
        if (!$metodo) {
            return response()->json(['success' => false, 'message' => 'Método de depreciación no encontrado'], 400);
        }

        $depreciacionExistente = Depreciacion::where('id_activo_fijo', $idActivo)
            ->where('anio_depreciacionaf', $anio)
            ->first();

        if ($depreciacionExistente) {
            return response()->json([
                'success' => false,
                'message' => "Ya existe una depreciación registrada para el activo {$idActivo} en el año {$anio}.",
            ], 409);
        }

        // Establecer la relación en el activo para el cálculo
        $activo->setRelation('metodoDepreciacion', $metodo);

        $service = new DepreciacionService();
        try {
            $resultado = $service->calcularDepreciacion(
                $activo,
                $anio,
                $ultimaDepreciacion->valor_residual_af,
                $ultimaDepreciacion->vida_util_anios
            );

            $depreciacion = Depreciacion::create([
                'id_activo_fijo' => $idActivo,
                'anio_depreciacionaf' => $anio,
                'valor_inicialaf' => $activo->costo_unitario_af,
                'valor_depreciacion_anterior' => $resultado['valor_depreciacion_anterior'] ?? 0,
                'valor_depreciacion_anual' => $resultado['valor_depreciacion_anual'],
                'valor_depreciacion_acumulada' => $resultado['valor_depreciacion_acumulada'],
                'valor_libros_af' => $resultado['valor_libros_af'],
                'id_metodo_depreciacionaf' => $metodo->id_metodo_depreciacion,
                'fecha_inicio_depreciacion' => $ultimaDepreciacion->fecha_inicio_depreciacion,
                'vida_util_anios' => $ultimaDepreciacion->vida_util_anios,
                'valor_residual_af' => $ultimaDepreciacion->valor_residual_af,
                'fecha_calculo_depreciacion' => now(),
                'id_usuario_calculo' => Auth::id(),
                'id_estatus_depreciacion' => $ultimaDepreciacion->id_estatus_depreciacion ?? 1,
            ]);

            return response()->json(['success' => true, 'data' => $depreciacion, 'message' => 'Depreciación calculada correctamente.']);
        } catch (QueryException $e) {
            if (($e->getCode() === '23505') || str_contains($e->getMessage(), 'uk_activo_anio_deprec')) {
                return response()->json([
                    'success' => false,
                    'message' => "Ya existe una depreciación registrada para el activo {$idActivo} en el año {$anio}.",
                ], 409);
            }

            return response()->json(['success' => false, 'message' => 'Error de base de datos al calcular depreciación.'], 500);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al calcular depreciación: ' . $e->getMessage()], 500);
        }
    }
}
