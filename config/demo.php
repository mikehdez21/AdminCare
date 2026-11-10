<?php

return [
    /*
     * La demo no tiene servicio de correo configurado. NotificaUsuarios
     * corta el despacho cuando esta bandera está en false.
     */
    'mail_enabled' => env('DEMO_MAIL_ENABLED', false),
];
