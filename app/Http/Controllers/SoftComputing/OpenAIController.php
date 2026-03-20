<?php

namespace App\Http\Controllers\SoftComputing;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OpenAIController extends Controller
{
	public function chat(Request $request): JsonResponse
	{
		try {
			$validated = $request->validate([
				'mode' => 'required|string|in:price_prediction,anomaly_detection,fraud_detection,inventory_optimization',
				'algorithm' => 'nullable|string|in:linear_regression,random_forest,knn,naive_bayes,logistic_regression,mlp,backpropagation,kmeans',
				'prompt' => 'required|string|max:8000',
				'data' => 'nullable|array',
			]);

			$apiKey = (string) config('services.openai.api_key');
			$model = (string) config('services.openai.model', 'gpt-4o-mini');
			$timeout = (int) config('services.openai.timeout', 30);

			if ($apiKey === '') {
				return response()->json([
					'success' => false,
					'message' => 'OPENAI_API_KEY no está configurada en el servidor.',
					'data' => null,
				], 500);
			}

			$modeContext = $this->buildModeContext($validated['mode']);
			$algorithm = $validated['algorithm'] ?? null;
			$inputData = $validated['data'] ?? [];

			$systemPrompt = "Eres un analista de SoftComputing para el sistema AdminCare. "
				. "Responde únicamente en JSON válido, siguiendo exactamente la estructura solicitada por el usuario en el campo question. "
				. "No uses markdown. "
				. "Contexto de tarea: {$modeContext}.";

			$userPrompt = [
				'mode' => $validated['mode'],
				'algorithm' => $algorithm,
				'question' => $validated['prompt'],
				'dataset' => $inputData,
			];

			$openAIResponse = Http::timeout($timeout)
				->withToken($apiKey)
				->post('https://api.openai.com/v1/responses', [
					'model' => $model,
					'input' => [
						[
							'role' => 'system',
							'content' => $systemPrompt,
						],
						
						[
							'role' => 'user',
							'content' => json_encode($userPrompt, JSON_UNESCAPED_UNICODE),
						],
					],
					'tools' => [
						['type' => 'web_search'],
					],
					'temperature' => 0.2,
				]);

			if ($openAIResponse->failed()) {
				return response()->json([
					'success' => false,
					'message' => 'Error al consultar OpenAI.',
					'data' => [
						'status' => $openAIResponse->status(),
						'error' => $openAIResponse->json(),
					],
				], 502);
			}

			$responsePayload = $openAIResponse->json() ?? [];
			$outputText = $this->extractOutputText($responsePayload);

			if ($outputText === '') {
				$outputText = json_encode($responsePayload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '';
			}

			return response()->json([
				'success' => true,
				'message' => 'Análisis de SoftComputing generado exitosamente.',
				'data' => [
					'mode' => $validated['mode'],
					'algorithm' => $algorithm,
					'model_used' => $model,
					'analysis_text' => $outputText,
					'raw_response' => $responsePayload,
				],
			], 200);
		} catch (\Throwable $e) {
			return response()->json([
				'success' => false,
				'message' => 'Error interno al procesar la solicitud de SoftComputing.',
				'data' => [
					'error' => $e->getMessage(),
				],
			], 500);
		}
	}

	private function buildModeContext(string $mode): string
	{
		return match ($mode) {
			'price_prediction' => 'Predicción de precios para facturas y activos.',
			'anomaly_detection' => 'Detección de facturas con precios inusuales.',
			'fraud_detection' => 'Reconocimiento de patrones de fraude en facturas.',
			'inventory_optimization' => 'Optimización de inventario y niveles de stock.',
			default => 'Análisis general de soft computing.',
		};
	}

	private function extractOutputText(array $responsePayload): string
	{
		$outputText = data_get($responsePayload, 'output_text');
		if (is_string($outputText) && trim($outputText) !== '') {
			return $outputText;
		}

		if (is_array($outputText)) {
			$chunks = array_values(array_filter(array_map(function ($item) {
				return is_string($item) ? trim($item) : '';
			}, $outputText)));

			if (!empty($chunks)) {
				return trim(implode("\n", $chunks));
			}
		}

		$output = data_get($responsePayload, 'output', []);
		if (!is_array($output)) {
			return '';
		}

		$chunks = [];
		foreach ($output as $item) {
			$contents = $item['content'] ?? [];
			if (!is_array($contents)) {
				continue;
			}

			foreach ($contents as $content) {
				$text = $content['text'] ?? null;
				if (is_string($text) && trim($text) !== '') {
					$chunks[] = $text;
					continue;
				}

				$jsonPayload = $content['json'] ?? null;
				if (is_array($jsonPayload)) {
					$chunks[] = json_encode($jsonPayload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
					continue;
				}

				$rawContent = $content['content'] ?? null;
				if (is_string($rawContent) && trim($rawContent) !== '') {
					$chunks[] = $rawContent;
				}
			}
		}

		return trim(implode("\n", $chunks));
	}
}
