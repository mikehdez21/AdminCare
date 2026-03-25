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
				'use_web_search' => 'nullable|boolean',
			]);

			$apiKey = (string) config('services.openai.api_key');
			// Siempre tomar modelo y fallback_model de variables de entorno, con fallback a config/services.php
			$model = env('OPENAI_MODEL', config('services.openai.model', 'gpt-5-search-api'));
			// Fallback fijo a gpt-4o-mini para máxima compatibilidad
			$fallbackModel = 'gpt-4o-mini';
			$timeout = (int) env('OPENAI_TIMEOUT', config('services.openai.timeout', 120));
			$webSearchEnabled = (bool) env('OPENAI_WEB_SEARCH_ENABLED', config('services.openai.web_search_enabled', true));

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


			$systemPrompt = "Eres un analista experto en compras empresariales para el sistema AdminCare. Responde solo en JSON válido, sin markdown. Si no puedes validar una URL o precio, indícalo en notas y no inventes enlaces.";

			// Construir prompt de usuario estructurado para cada activo
			$activos = isset($inputData['activos']) && is_array($inputData['activos']) ? $inputData['activos'] : [];
			$activosPrompt = '';
			foreach ($activos as $idx => $activo) {
				$nombre = $activo['nombre_af'] ?? '';
				$marca = $activo['marca_af'] ?? '';
				$modelo = $activo['modelo_af'] ?? '';
				$precio = $activo['precio_unitario'] ?? '';
				$activosPrompt .= "\nActivo #" . ($idx + 1) . ":\n- Nombre: {$nombre}\n- Marca: {$marca}\n- Modelo: {$modelo}\n- Precio unitario: {$precio}";
			}

			$userPrompt = "Tengo los siguientes activos para compra:{$activosPrompt}\n\nRealiza una búsqueda web solo en Amazon, MercadoLibre y Walmart para encontrar productos iguales o comparables. Devuelve un JSON con:\n- resumen_general: breve análisis de si el precio es competitivo.\n- resultados: máximo 3 opciones, cada una con { activo, precio_actual, opcion_mas_barata, precio_referencia, ahorro_estimado, url, notas }\nSi no puedes validar la URL o el precio, indícalo en notas y no inventes enlaces. No incluyas más de 3 resultados por activo.";

			$requestPayload = [
				'input' => [
					[
						'role' => 'system',
						'content' => $systemPrompt,
					],
					[
						'role' => 'user',
						'content' => $userPrompt,
					],
				],
			];

			$useWebSearch = array_key_exists('use_web_search', $validated)
				? (bool) $validated['use_web_search']
				: true;
			// Solo usar tools/filters si el modelo es gpt-5-search-api
			$webSearchToolType = 'web_search';
			$webSearchStatus = [
				'requested' => $webSearchEnabled && $useWebSearch,
				'attempted' => false,
				'tool_type' => null,
				'disabled_reason' => null,
			];

			// Si el modelo es gpt-5-search-api, usar /v1/chat/completions con web_search_options
			if (strtolower($model) === 'gpt-5-search-api') {
				$chatPayload = [
					'model' => $model,
					'messages' => [
						[ 'role' => 'system', 'content' => $systemPrompt ],
						[ 'role' => 'user', 'content' => $userPrompt ],
					],
					'web_search_options' => [
						'mode' => 'enabled',
						'allowed_domains' => [
							'amazon.com.mx',
							'mercadolibre.com.mx',
							'walmart.com.mx',
							'amazon.com',
							'mercadolibre.com',
							'walmart.com'
						]
					],
					'temperature' => 0.2,
					'max_tokens' => 1024,
				];

				$openAIResponse = Http::timeout($timeout)
					->withToken($apiKey)
					->post('https://api.openai.com/v1/chat/completions', $chatPayload);

				if ($openAIResponse->failed()) {
					// Fallback automático a gpt-4o-mini usando /v1/responses
					$fallbackPayload = [
						'input' => [
							[ 'role' => 'system', 'content' => $systemPrompt ],
							[ 'role' => 'user', 'content' => $userPrompt ],
						],
						'model' => $fallbackModel,
					];
					$fallbackResponse = Http::timeout($timeout)
						->withToken($apiKey)
						->post('https://api.openai.com/v1/responses', $fallbackPayload);

					if ($fallbackResponse->failed()) {
						return response()->json([
							'success' => false,
							'message' => 'Error al consultar OpenAI (chat/completions y fallback).',
							'data' => [
								'status' => $openAIResponse->status(),
								'model' => $model,
								'error' => $openAIResponse->json(),
								'fallback_error' => $fallbackResponse->json(),
							],
						], 502);
					}

					$responsePayload = $fallbackResponse->json() ?? [];
					$outputText = $this->extractOutputText($responsePayload);

					return response()->json([
						'success' => true,
						'message' => 'Análisis de SoftComputing generado exitosamente (fallback gpt-4o-mini).',
						'data' => [
							'mode' => $validated['mode'],
							'algorithm' => $algorithm,
							'model_used' => $fallbackModel,
							'analysis_text' => $outputText,
							'raw_response' => $responsePayload,
						],
					], 200);
				}

				$responsePayload = $openAIResponse->json() ?? [];
				$outputText = '';
				$citations = [];
				// Extraer el texto principal y las citas si existen
				if (isset($responsePayload['choices'][0]['message']['content'])) {
					$outputText = $responsePayload['choices'][0]['message']['content'];
				}
				if (isset($responsePayload['choices'][0]['message']['citations']) && is_array($responsePayload['choices'][0]['message']['citations'])) {
					$citations = $responsePayload['choices'][0]['message']['citations'];
				}

				return response()->json([
					'success' => true,
					'message' => 'Análisis de SoftComputing generado exitosamente (gpt-5-search-api).',
					'data' => [
						'mode' => $validated['mode'],
						'algorithm' => $algorithm,
						'model_used' => $model,
						'analysis_text' => $outputText,
						'citations' => $citations,
						'raw_response' => $responsePayload,
					],
				], 200);
			}

			$openAIResponse = Http::timeout($timeout)
				->withToken($apiKey)
				->post('https://api.openai.com/v1/responses', array_merge($requestPayload, [
					'model' => $model,
				]));

			// Si hay error de compatibilidad de herramienta, hacer fallback a gpt-4o-mini sin tools/filters
			if (
				$openAIResponse->failed()
				&& isset($requestPayload['tools'])
				&& $this->isToolCompatibilityError($openAIResponse->json() ?? [])
			) {
				$payloadWithoutTools = $requestPayload;
				unset($payloadWithoutTools['tools']);
				unset($payloadWithoutTools['tool_choice']);
				unset($payloadWithoutTools['include']);
				$webSearchStatus['disabled_reason'] = $this->extractErrorMessage($openAIResponse->json() ?? []);

				$openAIResponse = Http::timeout($timeout)
					->withToken($apiKey)
					->post('https://api.openai.com/v1/responses', array_merge($payloadWithoutTools, [
						'model' => $fallbackModel,
					]));
				$modelUsed = $fallbackModel;
			}

			// Ya no es necesario fallback adicional, ya que el fallback se maneja arriba
			$modelUsed = $modelUsed ?? $model;

			if ($openAIResponse->failed()) {
				return response()->json([
					'success' => false,
					'message' => 'Error al consultar OpenAI.',
					'data' => [
						'status' => $openAIResponse->status(),
						'model' => $modelUsed,
						'fallback_model' => $fallbackModel,
						'error' => $openAIResponse->json(),
					],
				], 502);
			}

			$responsePayload = $openAIResponse->json() ?? [];

			$outputText = $this->extractOutputText($responsePayload);
			$webSearchSources = $this->extractWebSearchSources($responsePayload);
			$webSearchUsed = !empty($webSearchSources) || $this->responseIncludesWebSearchCall($responsePayload);

			// Si no hay outputText, intenta extraer del campo 'text' o 'output' directamente
			if ($outputText === '') {
				if (isset($responsePayload['text']) && is_string($responsePayload['text']) && trim($responsePayload['text']) !== '') {
					$outputText = $responsePayload['text'];
				} elseif (isset($responsePayload['output']) && is_array($responsePayload['output'])) {
					// Busca el primer bloque de texto en output
					foreach ($responsePayload['output'] as $item) {
						if (isset($item['content']) && is_array($item['content'])) {
							foreach ($item['content'] as $content) {
								if (isset($content['text']) && is_string($content['text']) && trim($content['text']) !== '') {
									$outputText = $content['text'];
									break 2;
								}
							}
						}
					}
				}
			}

			// Si sigue vacío, devuelve el JSON crudo para depuración
			if ($outputText === '') {
				$outputText = json_encode($responsePayload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '';
			}

			return response()->json([
				'success' => true,
				'message' => 'Análisis de SoftComputing generado exitosamente.',
				'data' => [
					'mode' => $validated['mode'],
					'algorithm' => $algorithm,
					'model_used' => $modelUsed,
					'analysis_text' => $outputText,
					'web_search' => [
						'requested' => $webSearchStatus['requested'],
						'attempted' => $webSearchStatus['attempted'],
						'used' => $webSearchUsed,
						'tool_type' => $webSearchStatus['tool_type'],
						'disabled_reason' => $webSearchStatus['disabled_reason'],
						'sources' => $webSearchSources,
					],
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

	private function isToolCompatibilityError(array $errorPayload): bool
	{
		$message = strtolower($this->extractErrorMessage($errorPayload));

		return str_contains($message, 'tool')
			|| str_contains($message, 'web_search')
			|| str_contains($message, 'unsupported')
			|| str_contains($message, 'not available');
	}

	// resolveWebSearchToolType ya no es necesario, siempre usamos 'web_search' para gpt-5

	private function extractErrorMessage(array $errorPayload): string
	{
		$error = data_get($errorPayload, 'error');

		if (is_array($error)) {
			return (string) ($error['message'] ?? json_encode($errorPayload));
		}

		if (is_string($error) && trim($error) !== '') {
			return $error;
		}

		return (string) json_encode($errorPayload);
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

	private function responseIncludesWebSearchCall(array $responsePayload): bool
	{
		$output = data_get($responsePayload, 'output', []);
		if (!is_array($output)) {
			return false;
		}

		foreach ($output as $item) {
			if (($item['type'] ?? null) === 'web_search_call') {
				return true;
			}
		}

		return false;
	}

	private function extractWebSearchSources(array $responsePayload): array
	{
		$output = data_get($responsePayload, 'output', []);
		if (!is_array($output)) {
			return [];
		}

		$sources = [];
		foreach ($output as $item) {
			if (($item['type'] ?? null) !== 'web_search_call') {
				continue;
			}

			$items = data_get($item, 'action.sources', []);
			if (!is_array($items)) {
				continue;
			}

			foreach ($items as $source) {
				$url = trim((string) ($source['url'] ?? ''));
				if ($url === '') {
					continue;
				}

				$sources[] = [
					'title' => (string) ($source['title'] ?? $url),
					'url' => $url,
				];
			}
		}

		return array_values(array_unique($sources, SORT_REGULAR));
	}
}
