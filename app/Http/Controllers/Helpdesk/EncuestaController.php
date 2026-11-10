<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\EncuestaSatisfaccion;
use App\Services\Helpdesk\TicketService;
use App\Support\Permisos;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class EncuestaController extends Controller
{
    public function __construct(private readonly TicketService $ticketService) {}

    /**
     * Califica un ticket cerrado. Solo hay una encuesta por ticket
     * (`uk_encuesta_ticket`), y se valida aquí para devolver un 422 legible en
     * lugar de un error de índice único.
     *
     * La encuesta es la acción de escritura del solicitante sobre su propio ticket:
     * sin este filtro cualquier usuario autenticado podía consumir el único espacio
     * de calificación de un ticket ajeno.
     */
    public function store(Request $request, $id)
    {
        $usuario = $request->user();

        // Autorización antes de validar y con lookup acotado: un ticket ajeno responde
        // 404 y no un 403 que confirmaba su existencia por id.
        $ticket = $this->ticketService->buscarVisible($id, $usuario);
        $ticket->load('estatus');

        if ((int) $ticket->id_usuario_solicitante !== (int) $usuario->id_usuario
            && ! Permisos::tiene($usuario, 'helpdesk.internas', 'escritura')) {
            throw new AuthorizationException('Solo el solicitante del ticket puede calificar el cierre.');
        }

        $validator = Validator::make($request->all(), [
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario_satisfaccion' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $data = $validator->validated();

        // El solicitante califica cuando hay solución, que es el estatus "Resuelto";
        // también se acepta "Cerrado" para el ticket que llegó al final sin que nadie
        // alcanzara a calificarlo.
        //
        // No se usa `es_estado_final` porque en el catálogo solo "Cerrado" lo tiene:
        // con esa bandera, calificar en "Resuelto" daba 422 siempre.
        if (! in_array($ticket->estatus?->nombre_estatus, ['Resuelto', 'Cerrado'], true)) {
            throw ValidationException::withMessages([
                'id_ticket' => 'Solo se puede calificar un ticket resuelto o cerrado.',
            ]);
        }

        if ($ticket->encuesta()->exists()) {
            throw ValidationException::withMessages([
                'id_ticket' => 'El ticket ya fue calificado.',
            ]);
        }

        $encuesta = EncuestaSatisfaccion::create([
            'id_ticket' => $ticket->id_ticket,
            'calificacion' => $data['calificacion'],
            'comentario_satisfaccion' => $data['comentario_satisfaccion'] ?? null,
            'id_usuario_evaluador' => $usuario->id_usuario,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Encuesta registrada correctamente.',
            'data' => $encuesta,
        ], 201);
    }
}
