<?php

/**
 * Configuración de impresoras - printing.php
 * 
 * Define parámetros para conexión a impresoras térmicas (Zebra, etc.)
 */

return [
    'zebra' => [
        // Conexión por IP (Impresora en red)
        'host' => env('ZEBRA_HOST', '172.16.43.114'),
        'port' => env('ZEBRA_PORT', 9100),
        'timeout' => env('ZEBRA_TIMEOUT', 5),
        'name' => env('ZEBRA_NAME', 'ZDesigner ZD620-300dpi ZPL'),

        // Parámetros de etiqueta
        'label' => [
            'width_mm' => env('LABEL_WIDTH_MM', 50),
            'height_mm' => env('LABEL_HEIGHT_MM', 50),
            'dpi' => 300, // Dots Per Inch (no cambiar sin revisar generación ZPL)
        ],

        // Opciones de formato
        'formato_compacto' => env('LABEL_FORMATO_COMPACTO', false),
    ],

    // Configuración alternativa para USB (requiere software adicional)
    'usb' => [
        'enabled' => env('PRINTER_USB_ENABLED', false),
        'port' => env('PRINTER_USB_PORT', 'COM1'),
        'baudrate' => env('PRINTER_USB_BAUDRATE', 9600),
    ],

    // Rutas de almacenamiento para auditoría de impresiones
    'logs' => [
        'path' => storage_path('logs/printer'),
        'enabled' => env('PRINTER_LOGS_ENABLED', true),
    ],
];
