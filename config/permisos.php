<?php

/**
 * Mapa único de permisos del sistema.
 *
 * Cada recurso declara las acciones que existen de verdad. El último segmento
 * del nombre es siempre la acción; todo lo anterior identifica el recurso.
 *
 * De aquí salen el seeder, el helper `App\Support\Permisos` y las etiquetas que
 * muestra la pantalla de Roles. En esta fase el catálogo cubre los módulos
 * existentes; Helpdesk agrega sus recursos en su propia fase.
 */
return [

    'dominios' => [
        'nav' => 'Navegación',
        'almacen' => 'Almacén',
        'contabilidad' => 'Contabilidad',
        'admin' => 'Administrador',
        'catalogos' => 'Catálogos',
    ],

    /**
     * Texto estándar de cada acción para el modal de información. La
     * descripción del recurso dice qué cubre; esta dice qué permite la acción.
     */
    'acciones' => [
        'lectura' => [
            'etiqueta' => 'Lectura',
            'descripcion' => 'Consulta listados y detalle, sin crear ni modificar nada.',
        ],
        'escritura' => [
            'etiqueta' => 'Escritura',
            'descripcion' => 'Crea, edita y opera registros. Incluye la lectura.',
        ],
        'eliminar' => [
            'etiqueta' => 'Eliminar',
            'descripcion' => 'Borra, desactiva o cancela registros. Incluye escritura y lectura.',
        ],
    ],

    'recursos' => [

        /* Navegación: solo pantallas sin datos propios. */
        'nav.dashboard' => [
            'dominio' => 'nav',
            'etiqueta' => 'Dashboard',
            'descripcion' => 'Muestra la opción Dashboard del menú lateral. La pantalla no tiene datos propios: los permisos de Administración deciden qué se ve dentro.',
            'acciones' => ['lectura'],
        ],

        /* Almacén: un solo recurso; las secciones se navegan dentro del módulo. */
        'almacen' => [
            'dominio' => 'almacen',
            'etiqueta' => 'Almacén General',
            'descripcion' => 'Facturas, activos fijos, movimientos, etiquetas, proveedores y parámetros de Almacén.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],

        /* Contabilidad. */
        'contabilidad.depreciacion' => [
            'dominio' => 'contabilidad',
            'etiqueta' => 'Depreciación de Activos',
            'descripcion' => 'Activación, cálculo e histórico de la depreciación de los activos fijos.',
            'acciones' => ['lectura', 'escritura'],
        ],
        'contabilidad.metodos' => [
            'dominio' => 'contabilidad',
            'etiqueta' => 'Métodos de Depreciación',
            'descripcion' => 'Catálogo de métodos de depreciación.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],
        'contabilidad.auditoria' => [
            'dominio' => 'contabilidad',
            'etiqueta' => 'Auditoría de Estatus',
            'descripcion' => 'Catálogo de estatus de la depreciación y su auditoría.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],

        /* Administrador. */
        'admin.usuarios' => [
            'dominio' => 'admin',
            'etiqueta' => 'Usuarios',
            'descripcion' => 'Cuentas de usuario del sistema, sus roles y su baja.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],
        'admin.empleados' => [
            'dominio' => 'admin',
            'etiqueta' => 'Empleados',
            'descripcion' => 'Expediente de empleados: alta, edición y baja.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],
        'admin.roles' => [
            'dominio' => 'admin',
            'etiqueta' => 'Roles y Permisos',
            'descripcion' => 'Roles del sistema y los permisos que tienen asignados.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],
        'admin.departamentos' => [
            'dominio' => 'admin',
            'etiqueta' => 'Departamentos',
            'descripcion' => 'Departamentos del hospital y sus banderas de atención.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],
        'admin.ubicaciones' => [
            'dominio' => 'admin',
            'etiqueta' => 'Ubicaciones',
            'descripcion' => 'Ubicaciones físicas del hospital.',
            'acciones' => ['lectura', 'escritura', 'eliminar'],
        ],

        /* Catálogos compartidos: lectura para formularios de otros módulos. */
        'catalogos.departamentos' => [
            'dominio' => 'catalogos',
            'etiqueta' => 'Departamentos',
            'descripcion' => 'Lectura de departamentos para los formularios de otros módulos. No abre la pantalla de Administración.',
            'acciones' => ['lectura'],
        ],
        'catalogos.ubicaciones' => [
            'dominio' => 'catalogos',
            'etiqueta' => 'Ubicaciones',
            'descripcion' => 'Lectura de ubicaciones para los formularios de otros módulos. No abre la pantalla de Administración.',
            'acciones' => ['lectura'],
        ],
        'catalogos.empleados' => [
            'dominio' => 'catalogos',
            'etiqueta' => 'Empleados',
            'descripcion' => 'Lectura de empleados para los formularios de otros módulos. No abre la pantalla de Administración.',
            'acciones' => ['lectura'],
        ],
    ],
];
