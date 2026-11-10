<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\PrioridadTicket;
use App\Models\Helpdesk\Ticket;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PrioridadController extends Controller
{
    use ValidatesRequests;

    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Prioridades obtenidas correctamente.',
            'data' => PrioridadTicket::with('sla:id_prioridad_ticket,tiempo_respuesta_horas,tiempo_resolucion_horas')
                // Igual que en categorías: sin el flag solo las activas, que es lo
                // que consume el formulario de alta de ticket.
                ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
                ->orderBy('nivel_prioridad')
                ->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas());

        $prioridad = PrioridadTicket::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Prioridad creada exitosamente.',
            'data' => $prioridad,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $prioridad = PrioridadTicket::findOrFail($id);

        $data = $this->validate($request, $this->reglas($prioridad));
        $prioridad->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Prioridad actualizada exitosamente.',
            'data' => $prioridad->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $prioridad = PrioridadTicket::findOrFail($id);

        // La prioridad es llave foránea en tickets y en el SLA. Se informa la
        // dependencia en vez de reventar la llave; la baja real es desactivar
        // con `estatus_activo`. Las etiquetas no dependen de la prioridad: son
        // una tabla independiente con nombre y color.
        if (Ticket::where('id_prioridad_ticket', $prioridad->id_prioridad_ticket)->exists()) {
            throw ValidationException::withMessages([
                'id_prioridad_ticket' => 'No se puede eliminar la prioridad porque tiene tickets asociados.',
            ]);
        }

        if ($prioridad->sla()->exists()) {
            throw ValidationException::withMessages([
                'id_prioridad_ticket' => 'No se puede eliminar la prioridad porque tiene un nivel de SLA asociado.',
            ]);
        }

        $prioridad->delete();

        return response()->json([
            'success' => true,
            'message' => 'Prioridad eliminada correctamente.',
        ], 200);
    }

    /**
     * @param  PrioridadTicket|null  $prioridad  La prioridad en edición.
     */
    private function reglas(?PrioridadTicket $prioridad = null): array
    {
        $unico = Rule::unique(PrioridadTicket::class, 'nombre_prioridad');

        if ($prioridad !== null) {
            $unico->ignore($prioridad->id_prioridad_ticket);
        }

        return [
            'nombre_prioridad' => [$prioridad === null ? 'required' : 'sometimes', 'string', 'max:50', $unico],
            'descripcion_prioridad' => ['nullable', 'string', 'max:1000'],
            // `smallInteger`. No es único: el esquema solo pone UNIQUE al nombre,
            // así que no se inventa una restricción que la base no tiene.
            'nivel_prioridad' => [$prioridad === null ? 'required' : 'sometimes', 'integer', 'min:1', 'max:32767'],
            // Hex de 6 dígitos: más claro que `max:7`, que aceptaría cualquier
            // texto de siete caracteres.
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'estatus_activo' => 'sometimes|boolean',
        ];
    }
}
