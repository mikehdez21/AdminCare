<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\EstatusTicket;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Catálogo de estatus del flujo de tickets.
 *
 * A diferencia de los otros seis catálogos de Configuración, el estatus no tiene
 * `estatus_activo`: se borra en duro y no hay forma de desactivarlo. La razón es
 * que `Tickets.id_estatus_ticket` es `NOT NULL DEFAULT 1` con
 * `ON DELETE RESTRICT`, así que el estatus es parte de la identidad de cada
 * ticket y no de su histórico: un ticket necesita siempre un estatus real.
 *
 * Por eso tampoco hay `incluir_inactivos` en `index`: sin columna de vigencia,
 * la lista es la lista completa.
 */
class EstatusController extends Controller
{
    use ValidatesRequests;

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Estatus obtenidos correctamente.',
            'data' => EstatusTicket::orderBy('orden_flujo')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas());

        $estatus = EstatusTicket::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Estatus creado exitosamente.',
            'data' => $estatus,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $data = $this->validate($request, $this->reglas($id));
        $estatus = EstatusTicket::findOrFail($id);
        $estatus->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Estatus actualizado exitosamente.',
            'data' => $estatus,
        ], 200);
    }

    public function destroy($id)
    {
        $estatus = EstatusTicket::findOrFail($id);

        // El borrado sin este control revienta por la FK: `Tickets` apunta aquí con
        // `ON DELETE RESTRICT`, y casi todo estatus tiene tickets detrás. Se
        // informa el motivo en vez de dejar que el backend devuelva un 500.
        if ($estatus->tickets()->exists()) {
            throw ValidationException::withMessages([
                'id_estatus_ticket' => 'No se puede eliminar el estatus porque hay tickets que lo usan.',
            ]);
        }

        $estatus->delete();

        return response()->json([
            'success' => true,
            'message' => 'Estatus eliminado correctamente.',
        ], 200);
    }

    /**
     * `uk_estatus_nombre` (el UNIQUE de `nombre_estatus`) se replica en validación
     * para devolver un 422 legible en vez de un 500 por violación de índice.
     *
     * `orden_flujo` es `smallInteger NOT NULL` y va requerido, también al editar:
     * `es_estado_final` es `boolean DEFAULT false` y se acepta siempre, porque
     * en la edición tiene que poder pasar de `true` a `false`.
     *
     * @param  int|null  $ignoreId  En `update`, el propio estatus.
     */
    private function reglas(?int $ignoreId = null): array
    {
        $unico = Rule::unique(EstatusTicket::class, 'nombre_estatus');

        if ($ignoreId !== null) {
            $unico->ignore($ignoreId);
        }

        return [
            'nombre_estatus' => [$ignoreId === null ? 'required' : 'sometimes', 'string', 'max:50', $unico],
            'descripcion_estatus' => 'nullable|string|max:255',
            'es_estado_final' => 'sometimes|boolean',
            // Tope 32767: el máximo que admite un `smallInteger`.
            'orden_flujo' => ['required', 'integer', 'min:1', 'max:32767'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }
}
