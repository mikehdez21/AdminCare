<?php

namespace App\Notifications;

use App\Models\Helpdesk\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Aviso al solicitante y a los técnicos involucrados de que el ticket llegó a un
 * estatus final.
 */
class TicketEstadoCambiado extends Notification implements ShouldQueue, ShouldQueueAfterCommit
{
    use Queueable;

    public function __construct(
        public Ticket $ticket,
        public string $estatusAnterior,
        public string $estatusNuevo,
        public ?string $comentario = null,
        public ?string $actor = null,
        public ?string $replyTo = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Ticket {$this->ticket->folio_ticket} ahora está en {$this->estatusNuevo}")
            ->view('emails.helpdesk.ticket-estado', [
                'ticket' => $this->ticket,
                'estatusAnterior' => $this->estatusAnterior,
                'estatusNuevo' => $this->estatusNuevo,
                'comentario' => $this->comentario(),
                'actor' => $this->actor,
            ]);

        if ($this->replyTo !== null) {
            $mail->replyTo($this->replyTo);
        }

        return $mail;
    }

    /**
     * Comentario del cambio de estatus.
     *
     * El observador no puede pasarlo: `TicketService` guarda la actividad
     * *después* del `save()` que dispara el evento. Como la notificación va
     * encolada, al enviarse la actividad ya existe y se lee del historial; para una
     * reapertura la descripción es el motivo, que es igual de útil para el
     * solicitante.
     */
    private function comentario(): ?string
    {
        if ($this->comentario !== null) {
            return $this->comentario;
        }

        return $this->ticket->actividades()
            ->whereIn('tipo_actividad', ['cambio_estado', 'reapertura'])
            ->where('valor_nuevo', $this->estatusNuevo)
            ->orderByDesc('id_actividad_ticket')
            ->value('descripcion_actividad');
    }
}
