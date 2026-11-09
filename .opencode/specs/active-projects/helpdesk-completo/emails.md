# Correos — Helpdesk completo

## 1. Decisión

La demo no envía correos reales. Conserva el código de notificaciones, pero no abre SMTP ni encola jobs.

## 2. Configuración

`config/demo.php`:

```php
return [
    'mail_enabled' => env('DEMO_MAIL_ENABLED', false),
];
```

`.env.example`:

```dotenv
DEMO_MAIL_ENABLED=false
MAIL_MAILER=log
QUEUE_CONNECTION=sync
```

## 3. Código

- `NotificaUsuarios::enviar` retorna `false` sin despachar si `demo.mail_enabled` es falso.
- `TicketObserver` puede seguir ejecutándose.
- `TicketNuevo` y `TicketEstadoCambiado` se conservan.
- Las vistas `resources/views/emails/helpdesk/*` se conservan.
- No se agrega `datascaled/laravel-m365-mailer`.

## 4. UI

- `DemoMailNotice.tsx` en pantallas de Helpdesk.
- Texto informativo, no error.
- No bloquea acciones.
- No mostrar Swal de error.

## 5. Verificación

- Crear ticket: sin error.
- Cambiar estatus: sin error.
- Cerrar: sin error.
- Sin conexión SMTP.
- Sin jobs de correo pendientes.
- Aviso visible.

## 6. Fuera de alcance

- Envío real.
- Credenciales.
- Microsoft 365.
- Mailtrap/Resend.
