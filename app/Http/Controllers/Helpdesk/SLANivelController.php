<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\PrioridadTicket;
use App\Models\Helpdesk\SLANivel;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Tiempos de respuesta y resolución por prioridad.
 *
 * Editar o borrar un SLA no altera los tickets ya existentes: al crearlos,
 * `TicketService` copia los límites a `fecha_limite_respuesta` y
 * `fecha_limite_resolucion`. Por eso aquí no hay cascada que proteger y el
 * borrado no necesita bloquear por tickets.
 */
class SLANivelController extends Controller
{
    use ValidatesRequests;

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Niveles de SLA obtenidos correctamente.',
            // Se listan todos, no solo los vigentes: la pantalla necesita ver y
            // reactivar los inactivos, y el filtro `activos()` es del cálculo del SLA.
            'data' => SLANivel::with('prioridad:id_prioridad_ticket,nombre_prioridad,nivel_prioridad,color,estatus_activo')
                ->get()
                // Se ordena en PHP y no con un join: son cuatro filas y así se
                // evita acoplar el controlador al nombre físico de ambas tablas.
                // La prioridad va al final si faltara, no se desaparece.
                ->sortBy(fn (SLANivel $sla) => $sla->prioridad?->nivel_prioridad ?? PHP_INT_MAX)
                ->values(),
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas());

        $sla = SLANivel::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Nivel de SLA creado exitosamente.',
            'data' => $sla->load('prioridad:id_prioridad_ticket,nombre_prioridad,nivel_prioridad,color,estatus_activo'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $sla = SLANivel::findOrFail($id);

        $data = $this->validate($request, $this->reglas($sla));
        $sla->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Nivel de SLA actualizado exitosamente.',
            'data' => $sla->refresh()->load('prioridad:id_prioridad_ticket,nombre_prioridad,nivel_prioridad,color,estatus_activo'),
        ], 200);
    }

    public function destroy($id)
    {
        SLANivel::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nivel de SLA eliminado correctamente.',
        ], 200);
    }

    /**
     * `uk_sla_prioridad` deja un solo SLA por prioridad, activo o no. Se replica
     * en validación solo para devolver un 422 legible en vez de un 500 por
     * violación de índice.
     *
     * @param  SLANivel|null  $sla  El SLA en edición, si existe.
     */
    private function reglas(?SLANivel $sla = null): array
    {
        $unicaPrioridad = Rule::unique(SLANivel::class, 'id_prioridad_ticket');

        if ($sla !== null) {
            $unicaPrioridad->ignore($sla->id_sla_nivel);
        }

        return [
            'id_prioridad_ticket' => [$sla === null ? 'required' : 'sometimes', 'integer', Rule::exists(PrioridadTicket::class, 'id_prioridad_ticket'), $unicaPrioridad],
            // `decimal(6,2) NOT NULL`: van required. El tope 9999.99 es el que
            // admite la columna.
            'tiempo_respuesta_horas' => ['required', 'numeric', 'min:0', 'max:9999'],
            'tiempo_resolucion_horas' => ['required', 'numeric', 'min:0', 'max:9999'],
            'descripcion_sla' => 'nullable|string|max:255',
            'estatus_activo' => 'sometimes|boolean',
        ];
    }
}
