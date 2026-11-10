<?php

namespace App\Support;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Notification as NotificationFacade;

/**
 * Despacho compartido de notificaciones a usuarios, deduplicando destinatarios
 * por correo.
 *
 * Antes esta lógica vivía privada en `TicketObserver::enviar` y solo servía al
 * ciclo de vida del ticket. Al aviso de SLA vencido le hacía falta lo mismo, así
 * que se centraliza aquí para no mantener dos copias que se separen.
 */
final class NotificaUsuarios
{
    /**
     * Envía la notificación deduplicando destinatarios por correo (en minúsculas)
     * y saltando a los que no tienen correo o vienen nulos.
     *
     * @param  iterable<\App\Models\User|null>  $usuarios
     * @return bool  `true` solo si despachó al menos un correo.
     */
    public static function enviar(iterable $usuarios, Notification $notificacion): bool
    {
        if (! config('demo.mail_enabled', false)) {
            return false;
        }

        $destinatarios = [];

        foreach ($usuarios as $usuario) {
            if ($usuario === null) {
                continue;
            }

            $correo = trim((string) $usuario->email_usuario);

            if ($correo === '') {
                continue;
            }

            $clave = mb_strtolower($correo);

            if (! isset($destinatarios[$clave])) {
                $destinatarios[$clave] = $usuario;
            }
        }

        if ($destinatarios === []) {
            return false;
        }

        NotificationFacade::send(array_values($destinatarios), $notificacion);

        return true;
    }
}
