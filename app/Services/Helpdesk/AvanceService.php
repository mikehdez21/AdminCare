<?php

namespace App\Services\Helpdesk;

use App\Models\Helpdesk\AvanceTicket;
use App\Models\Helpdesk\Ticket;
use App\Models\User;
use App\Support\Permisos;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class AvanceService
{
    public function __construct(private readonly TicketService $ticketService) {}

    /**
     * Registra un avance en la bitácora del ticket.
     *
     * Solo el técnico asignado o un técnico del departamento que atiende el
     * ticket puede escribir, aunque tenga el permiso global de escritura: el
     * solicitante no comenta, sus acciones son reabrir y calificar el cierre.
     */
    public function registrarAvance(Ticket $ticket, User $usuario, string $contenido, bool $esInterno): AvanceTicket
    {
        $this->autorizarEscritura($ticket, $usuario);

        return DB::transaction(function () use ($ticket, $usuario, $contenido, $esInterno) {
            $avance = AvanceTicket::create([
                'id_ticket' => $ticket->id_ticket,
                'id_usuario_autor' => $usuario->id_usuario,
                'contenido_avance' => $contenido,
                'es_interno' => $esInterno,
            ]);

            $this->ticketService->registrarActividad(
                $ticket,
                $usuario,
                'avance_registrado',
                null,
                $esInterno ? 'nota interna' : 'avance visible',
                'Avance registrado correctamente.'
            );

            // El listado trae el autor; sin cargarlo aquí la fila recién creada se
            // pintaba con "—" hasta recargar la bitácora.
            return $avance->load('autor:id_usuario,nombre_usuario');
        });
    }

    /**
     * El solicitante recibe únicamente los avances visibles; quien atiende el
     * ticket recibe también las notas internas.
     *
     * @param  int|null  $limite  Máximo de avances devueltos; `null` significa todos.
     */
    public function listarAvances(Ticket $ticket, User $usuario, ?int $limite = null)
    {
        $query = AvanceTicket::with('autor:id_usuario,nombre_usuario')
            ->where('id_ticket', $ticket->id_ticket)
            ->orderByDesc('created_at');

        // Las notas internas son del técnico que tiene el ticket asignado, de quien
        // tiene la gestión interna del Helpdesk y de los técnicos del área que atiende
        // la categoría: si el ticket está en su cola, la bitácora es suya aunque otro
        // lo tenga tomado. Tener lectura de la cola sin atender Helpdesk no alcanza
        // para leerlas.
        if (! $ticket->esAtendientePor($usuario)
            && ! Permisos::tiene($usuario, 'helpdesk.internas', 'lectura')
            && ! $this->ticketService->atiendeLaCategoriaDelTicket($ticket, $usuario)) {
            $query->visiblesParaSolicitante();
        }

        if ($limite !== null) {
            $query->limit($limite);
        }

        return $query->get();
    }

    /** Baja lógica del avance. Solo quien atiende el ticket puede hacerlo. */
    public function eliminarAvance(AvanceTicket $avance, User $usuario): void
    {
        $this->autorizarEscritura($avance->ticket, $usuario);

        $avance->delete();
    }

    /**
     * La gestión interna (`helpdesk.internas.escritura`) exime igual que en
     * `TicketService::autorizarGestion`: sin ella el administrador del módulo
     * pasaba el filtro de lectura y se quedaba sin poder escribir en la bitácora
     * de ningún ticket.
     */
    private function autorizarEscritura(Ticket $ticket, User $usuario): void
    {
        if ($ticket->esAtendientePor($usuario)
            || $this->ticketService->atiendeLaCategoriaDelTicket($ticket, $usuario)
            || Permisos::tiene($usuario, 'helpdesk.internas', 'escritura')) {
            return;
        }

        throw new AuthorizationException(
            'Solo el técnico asignado o un técnico del área que atiende la categoría del ticket puede escribir avances.'
        );
    }
}
