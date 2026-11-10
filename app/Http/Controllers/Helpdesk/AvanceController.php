<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\AvanceTicket;
use App\Services\Helpdesk\AvanceService;
use App\Services\Helpdesk\TicketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AvanceController extends Controller
{
    /** Tope de avances por listado; sin él la bitácora entera entra en la respuesta. */
    private const LIMITE_BITACORA = 100;

    public function __construct(
        private readonly AvanceService $avanceService,
        private readonly TicketService $ticketService,
    ) {}

    /**
     * Listado de avances. El solicitante recibe solo los visibles; quien atiende el
     * ticket recibe también las notas internas.
     *
     * La lectura se autoriza sobre el ticket: sin este filtro el listado de avances
     * de la ruta `GET tickets/{id}/avances` permitía recorrer los tickets de otros
     * usuarios aunque `GET tickets/{id}` ya estuviera protegido.
     */
    public function index(Request $request, $id)
    {
        $ticket = $this->ticketService->buscarVisible($id, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Avances obtenidos correctamente.',
            'data' => $this->avanceService->listarAvances($ticket, $request->user(), self::LIMITE_BITACORA),
        ], 200);
    }

    /**
     * Registro de avance. Devuelve 403 si quien llama no atiende el ticket,
     * aunque tenga el permiso global de escritura.
     */
    public function store(Request $request, $id)
    {
        // Lookup y autorización antes de validar: al revés, quien no atiende el
        // ticket recibía 422 en vez del 403 que corresponde, y el 422 confirmaba que
        // el ticket existe.
        $ticket = $this->ticketService->buscarVisible($id, $request->user());
        $this->ticketService->autorizarGestion($ticket, $request->user());

        $validator = Validator::make($request->all(), [
            'contenido_avance' => 'required|string|min:3',
            'es_interno' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $data = $validator->validated();

        $avance = $this->avanceService->registrarAvance(
            $ticket,
            $request->user(),
            $data['contenido_avance'],
            (bool) ($data['es_interno'] ?? false)
        );

        return response()->json([
            'success' => true,
            'message' => 'Avance registrado correctamente.',
            'data' => $avance,
        ], 201);
    }

    /** Baja lógica del avance. Solo quien atiende el ticket puede hacerlo. */
    public function destroy(Request $request, $id)
    {
        // El lookup se acota al ticket del avance: si el usuario no puede ver ese
        // ticket responde 404, igual que un id inexistente. Si sí lo ve pero no lo
        // atiende, `autorizarGestion` responde 403.
        $avance = AvanceTicket::with('ticket')->findOrFail($id);

        $this->ticketService->buscarVisible($avance->id_ticket, $request->user());
        $this->ticketService->autorizarGestion($avance->ticket, $request->user());

        $this->avanceService->eliminarAvance($avance, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Avance eliminado correctamente.',
            'data' => null,
        ], 200);
    }
}
