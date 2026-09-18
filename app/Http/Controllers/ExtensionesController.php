<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExtensionesController extends Controller
{
    private const PDF_PATH = 'pdfs/extensiones/extensiones.pdf';

    /**
     * Upload (and overwrite) the single extensiones PDF.
     * Accessible to authenticated users (configure middleware in routes).
     */
    public function upload(Request $request)
    {

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240', // max 10MB
        ]);

        $file = $request->file('file');
        $filename = 'extensiones.pdf';

        if (!$file) {
            return response()->json(['message' => 'Archivo no válido'], 422);
        }

        $originalName = strtolower($file->getClientOriginalName());
        if ($originalName !== $filename) {
            return response()->json([
                'message' => 'Solo se permite subir el archivo extensiones.pdf',
            ], 422);
        }

        // Store in storage/app/public/pdfs/extensiones/extensiones.pdf (public disk)
        Storage::disk('public')->putFileAs('pdfs/extensiones', $file, $filename);

        $url = asset('storage/pdfs/extensiones/' . $filename);

        return response()->json(['url' => $url], 200);
    }

    /**
     * Stream the current extensiones PDF inline so the browser can render it.
     */
    public function showPdf()
    {
        if (!Storage::disk('public')->exists(self::PDF_PATH)) {
            return response()->json(['message' => 'No se encontró el archivo extensiones.pdf'], 404);
        }

        $absolutePath = Storage::disk('public')->path(self::PDF_PATH);

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="extensiones.pdf"',
        ]);
    }
}
