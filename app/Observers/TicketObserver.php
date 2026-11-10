<?php

namespace App\Observers;

use App\Models\Helpdesk\EstatusTicket;
use App\Models\Helpdesk\Ticket;
use App\Models\User;
use App\Notifications\TicketEstadoCambiado;
use App\Notifications\TicketNuevo;
use App\Support\NotificaUsuarios;
use Illuminate\Support\Collection;

/**
 * Dispara los dos correos vigentes del ciclo de vida del ticket:
 *
 * - Alta: técnicos del área que atiende la categoría (`TicketNuevo`).
 * - Paso a un estatus final: solicitante y técnicos involucrados
 *   (`TicketEstadoCambiado`). La asignación y los estatus intermedios no envían
 *   correo.
 *
 * Se apoya en los eventos de Eloquent porque todo cambio de estatus pasa por
 * `save()` en `TicketService`, así que un solo observador los cubre.
 */
class TicketObserver
{
    public function created(Ticket $ticket): void
    {
        $solicitante = $ticket->solicitante;

        NotificaUsuarios::enviar(
            $this->tecnicosDelArea($ticket),
            new TicketNuevo($ticket, $this->correoDe($solicitante))
        );
    }

    public function updated(Ticket $ticket): void
    {
        if ($ticket->wasChanged('id_estatus_ticket')) {
            $this->notificarEstatusFinal($ticket);
        }
    }

    /**
     * Usuarios del departamento que atiende la categoría, habilitados para Helpdesk,
     * activos y con correo. Única por `id_usuario`.
     */
    private function tecnicosDelArea(Ticket $ticket): Collection
    {
        return User::query()
            ->atiendenHelpdesk($ticket->categoria?->id_departamento_default)
            ->get()
            ->unique('id_usuario');
    }

    /**
     * Solo los estatus marcados como finales avisan. El catálogo actual solo tiene
     * «Cerrado», pero la regla cubre cualquier estado final que se agregue después.
     */
    private function notificarEstatusFinal(Ticket $ticket): void
    {
        $nuevo = EstatusTicket::find($ticket->id_estatus_ticket);

        if ($nuevo === null || ! $nuevo->es_estado_final) {
            return;
        }

        // `getOriginal` conserva el valor previo a este `save()`: el `updated` se
        // dispara antes de que Eloquent sincronice `original` en `finishSave()`.
        $anterior = EstatusTicket::find($ticket->getOriginal('id_estatus_ticket'));
        $actor = $this->actorActual();

        NotificaUsuarios::enviar(
            $this->destinatariosDeCierre($ticket),
            new TicketEstadoCambiado(
                $ticket,
                $anterior?->nombre_estatus ?? (string) $ticket->getOriginal('id_estatus_ticket'),
                $nuevo->nombre_estatus,
                null,
                $actor?->nombre_usuario,
                $this->correoDe($actor),
            )
        );
    }

    /**
     * Solicitante más los usuarios activos de los empleados que atienden el ticket:
     * responsable y hasta cuatro colaboradores. `NotificaUsuarios` deduplica por
     * correo, así que quien aparezca en dos huecos recibe un solo mensaje.
     */
    private function destinatariosDeCierre(Ticket $ticket): Collection
    {
        $fila = $ticket->tecnicos()->first();

        $empleados = collect([
            $ticket->id_responsable,
            $fila?->id_responsable,
            $fila?->id_tecnico_dos,
            $fila?->id_tecnico_tres,
            $fila?->id_tecnico_cuatro,
            $fila?->id_tecnico_cinco,
        ])->filter()->map(fn ($id) => (int) $id)->unique();

        $tecnicos = $empleados->isEmpty()
            ? collect()
            : User::query()
                ->whereIn('id_empleado', $empleados)
                ->where('estatus_activo', true)
                ->conCorreo()
                ->get();

        return $tecnicos->prepend($ticket->solicitante);
    }

    /**
     * El usuario autenticado que realizó el cambio, o `null` fuera de una petición
     * HTTP (cola, tinker): en ese caso el `replyTo` del correo queda vacío.
     */
    private function actorActual(): ?User
    {
        $user = auth()->user();

        return $user instanceof User ? $user : null;
    }

    /**
     * Correo del usuario para el `replyTo`, o `null` si no tiene o está vacío.
     */
    private function correoDe(?User $usuario): ?string
    {
        if ($usuario === null) {
            return null;
        }

        $correo = trim((string) $usuario->email_usuario);

        return $correo === '' ? null : $correo;
    }
}
