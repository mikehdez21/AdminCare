<?php

namespace App\Http\Controllers\Printing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QzSigningController extends Controller
{
    public function certificate()
    {
        $certificatePath = (string) config('qz.certificate_path');

        if (!file_exists($certificatePath)) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró el certificado público de QZ Tray.'
            ], 500);
        }

        return response(file_get_contents($certificatePath), 200)
            ->header('Content-Type', 'text/plain; charset=utf-8');
    }

    public function sign(Request $request)
    {
        $validated = $request->validate([
            'request' => 'required',
        ]);

        $message = $validated['request'];

        if (is_array($message)) {
            $message = implode('', array_map('strval', $message));
        }

        $privateKeyPath = (string) config('qz.private_key_path');

        if (!file_exists($privateKeyPath)) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró la llave privada de QZ Tray.'
            ], 500);
        }

        $privateKeyContents = file_get_contents($privateKeyPath);
        $passphrase = config('qz.private_key_passphrase');
        $privateKey = openssl_get_privatekey($privateKeyContents, $passphrase ?: null);

        if (!$privateKey) {
            Log::error('QZ signing error: no se pudo abrir la llave privada');

            return response()->json([
                'success' => false,
                'message' => 'No se pudo abrir la llave privada de QZ Tray.'
            ], 500);
        }

        $signature = null;
        $ok = openssl_sign($message, $signature, $privateKey, OPENSSL_ALGO_SHA512);
        openssl_free_key($privateKey);

        if (!$ok || !$signature) {
            Log::error('QZ signing error: fallo al generar la firma', [
                'message' => $message,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'No se pudo generar la firma para QZ Tray.'
            ], 500);
        }

        return response(base64_encode($signature), 200)
            ->header('Content-Type', 'text/plain; charset=utf-8');
    }
}
