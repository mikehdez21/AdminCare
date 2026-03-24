<?php

namespace App\Http\Controllers\SoftComputing;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;


class PricingModelController extends Controller
{
    public function train(Request $request): JsonResponse
    {
        return $this->forwardToSoftComputing('/api/v1/pricing/train', $request->all(), 'entrenar modelo de precios');
    }

    public function trainFromDatabase(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'algorithm' => 'nullable|in:linear_regression,random_forest,knn',
            'test_size' => 'nullable|numeric|gt:0|lt:0.5',
            'random_state' => 'nullable|integer',
            'n_estimators' => 'nullable|integer|min:10|max:2000',
            'n_neighbors' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:8|max:5000',
        ]);

        $limit = (int) ($validated['limit'] ?? 1000);

        $records = DB::table('almacengeneral.tableAF_ActivosFijos as af')
            ->join('almacengeneral.tableAF_Facturas as f', 'f.id_factura', '=', 'af.id_factura')
            ->whereNotNull('af.precio_unitario_af')
            ->where('af.precio_unitario_af', '>', 0)
            ->orderByDesc('f.fecha_fac_recepcion')
            ->limit($limit)
            ->get([
                'f.subtotal_factura',
                'f.descuento_factura',
                'f.flete_factura',
                'f.iva_factura',
                'f.total_factura',
                'af.precio_unitario_af',
                'af.descuento_af',
                'af.descuento_porcentajeaf',
            ]);

        $rows = [];
        foreach ($records as $record) {
            $target = (float) ($record->precio_unitario_af ?? 0);
            if ($target <= 0) {
                continue;
            }

            $lineTotal = max(
                0,
                $target
                - (float) ($record->descuento_af ?? 0)
                - ($target * ((float) ($record->descuento_porcentajeaf ?? 0) / 100))
            );

            $rows[] = [
                'features' => [
                    'subtotal_factura' => (float) ($record->subtotal_factura ?? 0),
                    'descuento_factura' => (float) ($record->descuento_factura ?? 0),
                    'flete_factura' => (float) ($record->flete_factura ?? 0),
                    'iva_factura' => (float) ($record->iva_factura ?? 0),
                    'total_factura' => (float) ($record->total_factura ?? 0),
                    'total_linea' => $lineTotal,
                ],
                'target' => $target,
            ];
        }

        if (count($rows) < 8) {
            return response()->json([
                'success' => false,
                'message' => 'No hay suficientes registros en BD para entrenar el modelo.',
                'data' => [
                    'required' => 8,
                    'available' => count($rows),
                    'hint' => 'Verifica registros en almacengeneral.tableInter_FacturaActivos y precios unitarios mayores a 0.',
                ],
            ], 422);
        }

        $payload = [
            'algorithm' => $validated['algorithm'] ?? 'random_forest',
            'rows' => $rows,
            'test_size' => $validated['test_size'] ?? 0.25,
            'random_state' => $validated['random_state'] ?? 42,
            'n_estimators' => $validated['n_estimators'] ?? 300,
            'n_neighbors' => $validated['n_neighbors'] ?? 5,
        ];

        return $this->forwardToSoftComputing('/api/v1/pricing/train', $payload, 'entrenar modelo de precios desde BD');
    }

    public function predict(Request $request): JsonResponse
    {
        return $this->forwardToSoftComputing('/api/v1/pricing/predict', $request->all(), 'generar predicciones de precios');
    }

    public function listModels(): JsonResponse
    {
        $baseUrls = $this->resolveBaseUrls();
        if (empty($baseUrls)) {
            return response()->json([
                'success' => false,
                'message' => 'ML_SERVICE_URL no está configurada.',
                'data' => null,
            ], 500);
        }

        $timeout = (int) config('services.softcomputing.timeout', 60);
        $errors = [];

        foreach ($baseUrls as $baseUrl) {
            try {
                $response = Http::timeout($timeout)->get($baseUrl . '/api/v1/pricing/models');

                return response()->json(
                    $response->json() ?: [
                        'success' => false,
                        'message' => 'Respuesta vacía del microservicio de modelos.',
                        'data' => null,
                    ],
                    $response->status()
                );
            } catch (\Throwable $e) {
                $errors[] = [
                    'base_url' => $baseUrl,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Error al listar modelos entrenados.',
            'data' => [
                'errors' => $errors,
                'hint' => 'Verifica ML_SERVICE_URL y ML_SERVICE_PUBLIC_URL en Railway.',
            ],
        ], 502);
    }

    private function forwardToSoftComputing(string $path, array $payload, string $action): JsonResponse
    {
        $baseUrls = $this->resolveBaseUrls();
        if (empty($baseUrls)) {
            return response()->json([
                'success' => false,
                'message' => 'ML_SERVICE_URL no está configurada.',
                'data' => null,
            ], 500);
        }

        $timeout = (int) config('services.softcomputing.timeout', 120);
        $errors = [];

        foreach ($baseUrls as $baseUrl) {
            try {
                $response = Http::timeout($timeout)->post($baseUrl . $path, $payload);

                return response()->json(
                    $response->json() ?: [
                        'success' => false,
                        'message' => 'Respuesta vacía del microservicio de modelos.',
                        'data' => null,
                    ],
                    $response->status()
                );
            } catch (\Throwable $e) {
                $errors[] = [
                    'base_url' => $baseUrl,
                    'path' => $path,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => false,
            'message' => "Error al {$action}.",
            'data' => [
                'errors' => $errors,
                'hint' => 'Si usas Vercel + Railway, define ML_SERVICE_PUBLIC_URL en el backend Laravel.',
            ],
        ], 502);
    }

    private function resolveBaseUrls(): array
    {
        $internalUrl = rtrim((string) config('services.softcomputing.url', ''), '/');
        $publicUrl = rtrim((string) config('services.softcomputing.public_url', ''), '/');

        return array_values(array_unique(array_filter([$internalUrl, $publicUrl])));
    }
}
