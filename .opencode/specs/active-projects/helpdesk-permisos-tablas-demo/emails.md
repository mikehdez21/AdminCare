# Correos de Helpdesk en la demo

## 1. Comportamiento del main

El main envía dos correos:

- `TicketNuevo`: al crear un ticket, a los técnicos del área que atiende la categoría.
- `TicketEstadoCambiado`: al pasar a un estatus final, al solicitante y técnicos involucrados.

Componentes:

- `app/Observers/TicketObserver.php`
- `app/Support/NotificaUsuarios.php`
- `app/Notifications/TicketNuevo.php`
- `app/Notifications/TicketEstadoCambiado.php`
- `resources/views/emails/helpdesk/*`

Dependencias:

- Laravel Notifications.
- Mailer configurado.
- En el main de producción, `datascaled/laravel-m365-mailer`.
- Queue (`ShouldQueue`).

## 2. Decisión para la demo

La demo **no envía correos reales** y **no requiere credenciales**.

Requisitos:

1. El código de notificaciones se conserva para mantener paridad con el main.
2. El observer puede seguir registrando actividad y avances.
3. No se abre conexión SMTP.
4. No se encolan jobs de correo.
5. La UI muestra un aviso claro de la limitación.

## 3. Implementación

### 3.1 Configuración

Agregar `config/demo.php`:

```php
return [
    'mail_enabled' => env('DEMO_MAIL_ENABLED', false),
];
```

Agregar a `.env.example`:

```dotenv
DEMO_MAIL_ENABLED=false
MAIL_MAILER=log
QUEUE_CONNECTION=sync
```

- `MAIL_MAILER=log` es una segunda barrera: si algo intenta enviar, no sale a red.
- `QUEUE_CONNECTION=sync` evita dejar jobs de correo en la base demo.
- No se configura `MAIL_HOST`, `MAIL_USERNAME` ni credenciales reales.

### 3.2 `NotificaUsuarios`

Antes de despachar:

```php
if (! config('demo.mail_enabled', false)) {
    return false;
}
```

- Se conserva la deduplicación de destinatarios.
- Se conserva la firma del método.
- El observer no necesita cambios.
- `TicketNuevo` y `TicketEstadoCambiado` quedan intactos.

### 3.3 UI

Componente `DemoMailNotice.tsx`:

```text
Esta demo no tiene servicio de correo configurado.
Los tickets y avances se guardan, pero no se envían notificaciones por correo.
```

Se muestra:

- En `AddTicket`.
- En `MisTickets`.
- En `MesaAyuda`.
- En `TicketDetalle`.
- En `Configuracion` de Helpdesk.

Estilo:

- Banner informativo, no error.
- Consistente con `DemoNotice` actual.
- Visible sin tapar formularios.
- Sin botón de acción obligatorio.

Opcional:

- `Swal.fire` informativo al crear un ticket, una vez por sesión.
- No usar el mismo estilo de error que las validaciones.

### 3.4 Contrato API

- No se agrega un endpoint de correo.
- La creación de ticket devuelve el mismo envelope.
- No se devuelve error si el correo está apagado.
- El historial de actividad y los avances sí se guardan.

## 4. Qué no se hace

- No se configura Microsoft 365.
- No se agrega `datascaled/laravel-m365-mailer` a `composer.json`.
- No se piden credenciales al usuario.
- No se usa Mailtrap/Resend/SMTP.
- No se crean jobs de correo.
- No se promete envío real en la demo.

## 5. Si más adelante se quiere correo real

1. Configurar un mailer válido en `.env`.
2. Poner `DEMO_MAIL_ENABLED=true`.
3. Verificar `QUEUE_CONNECTION` y worker.
4. Probar con un buzón de pruebas.
5. No usar datos reales en la demo pública.

## 6. Verificación

- Crear un ticket: no debe aparecer error de correo.
- El ticket aparece en la mesa.
- El log no muestra intento SMTP.
- El aviso se ve en las pantallas de Helpdesk.
- `php artisan queue:work` no tiene jobs de correo pendientes (si se usa cola).
- Desactivar `DEMO_MAIL_ENABLED` no afecta la creación, cambios de estatus ni cierre.

## 7. Riesgos

- Si se olvida el short-circuit y `MAIL_MAILER=log`, los correos se escriben en el log, pero no fallan. Aun así, se prefiere no despachar.
- Si se usa `QUEUE_CONNECTION=database` sin worker, los jobs quedan acumulados. Por eso la demo usa `sync`.
- Las notificaciones del main asumen relaciones de Helpdesk; si falta una relación, el observer puede fallar. Se debe verificar con datos demo.
