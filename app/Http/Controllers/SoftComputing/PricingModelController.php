<?php

namespace App\Http\Controllers\SoftComputing;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PricingModelController extends Controller
{
    public function train(Request $request): JsonResponse
    {
        return $this->forwardToSoftComputing('/api/v1/pricing/train', $request->all(), 'entrenar modelo de precios');
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
