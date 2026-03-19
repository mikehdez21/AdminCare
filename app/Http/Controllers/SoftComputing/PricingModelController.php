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
        $baseUrl = rtrim((string) config('services.softcomputing.url', ''), '/');

        if ($baseUrl === '') {
            return response()->json([
                'success' => false,
                'message' => 'ML_SERVICE_URL no está configurada.',
                'data' => null,
            ], 500);
        }

        try {
            $response = Http::timeout(60)->get($baseUrl . '/api/v1/pricing/models');

            return response()->json(
                $response->json() ?: [
                    'success' => false,
                    'message' => 'Respuesta vacía del microservicio de modelos.',
                    'data' => null,
                ],
                $response->status()
            );
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar modelos entrenados.',
                'data' => ['error' => $e->getMessage()],
            ], 502);
        }
    }

    private function forwardToSoftComputing(string $path, array $payload, string $action): JsonResponse
    {
        $baseUrl = rtrim((string) config('services.softcomputing.url', ''), '/');

        if ($baseUrl === '') {
            return response()->json([
                'success' => false,
                'message' => 'ML_SERVICE_URL no está configurada.',
                'data' => null,
            ], 500);
        }

        try {
            $response = Http::timeout(120)->post($baseUrl . $path, $payload);

            return response()->json(
                $response->json() ?: [
                    'success' => false,
                    'message' => 'Respuesta vacía del microservicio de modelos.',
                    'data' => null,
                ],
                $response->status()
            );
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => "Error al {$action}.",
                'data' => ['error' => $e->getMessage()],
            ], 502);
        }
    }
}
