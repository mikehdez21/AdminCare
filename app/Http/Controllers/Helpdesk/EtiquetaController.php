<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\Etiqueta;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EtiquetaController extends Controller
{
    use ValidatesRequests;

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Etiquetas obtenidas correctamente.',
            'data' => Etiqueta::orderBy('nombre_etiqueta')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas());

        $etiqueta = Etiqueta::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Etiqueta creada exitosamente.',
            'data' => $etiqueta,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $data = $this->validate($request, $this->reglas($id));
        $etiqueta = Etiqueta::findOrFail($id);
        $etiqueta->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Etiqueta actualizada exitosamente.',
            'data' => $etiqueta,
        ], 200);
    }

    public function destroy($id)
    {
        $etiqueta = Etiqueta::findOrFail($id);

        // El pivote `ticketsEtiquetas` está en ON DELETE CASCADE: sin este control el
        // borrado sería limpio para la base y, al mismo tiempo, borraría en
        // silencio qué etiquetas tenía cada ticket ya cerrado.
        if ($etiqueta->tickets()->exists()) {
            throw ValidationException::withMessages([
                'id_etiqueta' => 'No se puede eliminar la etiqueta porque hay tickets que la usan.',
            ]);
        }

        $etiqueta->delete();

        return response()->json([
            'success' => true,
            'message' => 'Etiqueta eliminada correctamente.',
        ], 200);
    }

    /**
     * La etiqueta no tiene `estatus_activo`: el catálogo es solo nombre y color,
     * sin interruptor.
     *
     * El pivote guarda únicamente los dos ids, así que renombrar una etiqueta
     * también renombra cómo se ve en tickets ya cerrados. Es inherente a que la
     * etiqueta sea un catálogo compartido, no un dato congelado del ticket.
     *
     * @param  int|null  $ignoreId  En `update`, la propia etiqueta.
     */
    private function reglas(?int $ignoreId = null): array
    {
        $unico = Rule::unique(Etiqueta::class, 'nombre_etiqueta');

        if ($ignoreId !== null) {
            $unico->ignore($ignoreId);
        }

        return [
            'nombre_etiqueta' => [$ignoreId === null ? 'required' : 'sometimes', 'string', 'max:50', $unico],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }
}
