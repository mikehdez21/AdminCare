<?php

namespace App\Notifications;

use App\Models\Helpdesk\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Aviso a los técnicos del área de que entró un ticket nuevo a su cola.
 */
class TicketNuevo extends Notification implements ShouldQueue, ShouldQueueAfterCommit
{
    use Queueable;

    public function __construct(
        public Ticket $ticket,
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
            ->subject("Nuevo ticket {$this->ticket->folio_ticket}: {$this->ticket->titulo_ticket}")
            ->view('emails.helpdesk.ticket-nuevo', ['ticket' => $this->ticket]);

        if ($this->replyTo !== null) {
            $mail->replyTo($this->replyTo);
        }

        return $mail;
    }
}
