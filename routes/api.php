<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Spatie\Permission\Middleware\PermissionMiddleware;

// Api/Controllers
use App\Http\Controllers\ApiStatusController;
use App\Http\Controllers\AuthController;

// Admin/Controllers
use App\Http\Controllers\AdminControllers\UserController as UserAdminController;
use App\Http\Controllers\AdminControllers\RolesController as RolesAdminController;
use App\Http\Controllers\AdminControllers\PermissionsController as PermissionsAdminController;
use App\Http\Controllers\AdminControllers\DepartamentosController as DepartamentosAdminController;
use App\Http\Controllers\AdminControllers\EmpleadoController as EmpleadoAdminController;
use App\Http\Controllers\AdminControllers\UbicacionController;

// Helpdesk
use App\Http\Controllers\Helpdesk\TicketController;
use App\Http\Controllers\Helpdesk\EmpleadoController as EmpleadoHelpdeskController;
use App\Http\Controllers\Helpdesk\AvanceController;
use App\Http\Controllers\Helpdesk\EncuestaController;
use App\Http\Controllers\Helpdesk\CategoriaController;
use App\Http\Controllers\Helpdesk\SubcategoriaController;
use App\Http\Controllers\Helpdesk\TituloController;
use App\Http\Controllers\Helpdesk\PrioridadController;
use App\Http\Controllers\Helpdesk\SLANivelController;
use App\Http\Controllers\Helpdesk\EstatusController;
use App\Http\Controllers\Helpdesk\EtiquetaController;
use App\Http\Controllers\Helpdesk\ModuloSIHOController;
use App\Http\Controllers\Helpdesk\ProveedorErrorController;
use App\Http\Controllers\Helpdesk\SistemaProveedorController;
use App\Http\Controllers\Helpdesk\HelpdeskDashboardController;

// AlmacenGeneral_Controllers
use App\Http\Controllers\AlmacenGeneral\ProveedorController;
use App\Http\Controllers\AlmacenGeneral\FacturaController;
use App\Http\Controllers\AlmacenGeneral\FacturaActivosController;
use App\Http\Controllers\AlmacenGeneral\ActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\MovimientosActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\PrinterController;

// AlmacenGeneral -- ParamsControllers
use App\Http\Controllers\AlmacenGeneral\ClasificacionController;
use App\Http\Controllers\AlmacenGeneral\TiposFacturaController;
use App\Http\Controllers\AlmacenGeneral\FormaPagoController;
use App\Http\Controllers\AlmacenGeneral\TiposMonedaController;
use App\Http\Controllers\AlmacenGeneral\EstatusAFController;
use App\Http\Controllers\AlmacenGeneral\CodigosQRAFController;

// AlmacenGeneral -- FillTypes
use App\Http\Controllers\FillTypes\AlmacenGeneral\TypesProveedorController;

// Contabilidad
use App\Http\Controllers\AlmacenGeneral\DepreciacionController;
use App\Http\Controllers\AlmacenGeneral\MetodoDepreciacionController;
use App\Http\Controllers\AlmacenGeneral\EstatusDepreciacionController;

// Permisos
use App\Support\Permisos;

    // ============================================================
    // RUTAS PÚBLICAS (sin autenticación, con sesión + CSRF)
    // ============================================================
    Route::get('/status', [ApiStatusController::class, 'index'])
        ->withoutMiddleware([
            EnsureFrontendRequestsAreStateful::class,
            StartSession::class,
            ShareErrorsFromSession::class,
        ]);
    Route::get('/dbstatus', [ApiStatusController::class, 'dbStatus'])
        ->withoutMiddleware([
            EnsureFrontendRequestsAreStateful::class,
            StartSession::class,
            ShareErrorsFromSession::class,
        ]);

    // Resolución pública y de solo lectura para QR generados en navegador.
    // Se mantiene fuera de auth, pero limitada para evitar enumeración abusiva.
    Route::get('/activosfijos/qraf/{codigoQR}', [CodigosQRAFController::class, 'resolverQR'])
        ->where('codigoQR', '[^/]+')
        // This endpoint is intentionally stateless. Keep the API group's
        // session/Sanctum/CSRF behavior for every other route.
        ->withoutMiddleware([
            EnsureFrontendRequestsAreStateful::class,
            StartSession::class,
            EncryptCookies::class,
            ShareErrorsFromSession::class,
            VerifyCsrfToken::class,
        ])
        ->middleware('throttle:60,1')
        ->name('public.qraf.resolve');

    // Compatibilidad con la ruta histórica de escaneo QR.
    Route::get('/almacengeneral/qraf/scan/{codigoQR}', [CodigosQRAFController::class, 'escanearQR']);

    // ============================================================
    // RUTAS DE AUTENTICACIÓN (sin protección, con sesión + CSRF)
    // ============================================================
    Route::get('/auth/check', [AuthController::class, 'check'])->name('check');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');

    Route::middleware(['auth'])->group(function () {
        Route::get('/auth/permissions', [AuthController::class, 'permissions']);
    });

    // ============================================================
    // RUTAS PROTEGIDAS (auth:sanctum con sesión + CSRF)
    // ============================================================
    Route::group(['middleware' => 'auth:sanctum'], function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-inactive', [AuthController::class, 'logoutInactive']);

        // ============================================================
        // ALMACÉN GENERAL
        // ============================================================
        $permAlmacenLectura = Permisos::middleware('almacen', 'lectura');
        $permAlmacenEscritura = Permisos::middleware('almacen', 'escritura');
        $permAlmacenEliminar = Permisos::middleware('almacen', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permAlmacenLectura)->group(function () {
            Route::get('/almacengeneral/tipos-proveedor', [TypesProveedorController::class, 'getTiposProveedor']);
            Route::get('/almacengeneral/tipos-regimen', [TypesProveedorController::class, 'getTiposRegimen']);
            Route::get('/almacengeneral/descuentos-proveedor', [TypesProveedorController::class, 'getDescuentosProveedor']);
            Route::get('/almacengeneral/tipos-facturacion', [TypesProveedorController::class, 'getTiposFacturacion']);

            Route::apiResource('/almacengeneral/facturas', FacturaController::class)->only(['index', 'show']);
            Route::get('/almacengeneral/facturas/{idFactura}/activos', [FacturaActivosController::class, 'getActivosByFactura']);

            Route::apiResource('/almacengeneral/proveedores', ProveedorController::class)->only(['index', 'show']);
            Route::apiResource('/almacengeneral/clasificaciones', ClasificacionController::class)->only(['index', 'show']);
            Route::apiResource('/almacengeneral/tiposfacturas', TiposFacturaController::class)->only(['index', 'show']);
            Route::apiResource('/almacengeneral/formaspago', FormaPagoController::class)->only(['index', 'show']);
            Route::apiResource('/almacengeneral/tiposmoneda', TiposMonedaController::class)->only(['index', 'show']);
            Route::apiResource('/almacengeneral/activosfijos', ActivosFijosController::class)->only(['index', 'show']);
            Route::apiResource('/almacengeneral/activosfijos-estatus', EstatusAFController::class)->only(['index', 'show']);

            Route::get('/almacengeneral/activosfijos/departamento/{idDepartamento}', [ActivosFijosController::class, 'getActivosPorDepartamento']);
            Route::get('/almacengeneral/activosfijos/ubicacion/{idUbicacion}', [ActivosFijosController::class, 'getActivosPorUbicacion']);
            Route::get('/almacengeneral/activosfijos/clasificacion/{idClasificacion}', [ActivosFijosController::class, 'getActivosPorClasificacion']);
            Route::get('/almacengeneral/activosfijos/responsable/{idEmpleado}', [ActivosFijosController::class, 'getActivosPorResponsable']);
            Route::get('/almacengeneral/activosfijos-bajas', [ActivosFijosController::class, 'getActivosDadosDeBaja']);
            Route::get('/almacengeneral/activosfijos-nopropios', [ActivosFijosController::class, 'getActivosNoPropios']);
            Route::get('/almacengeneral/activosfijos-sinfactura', [ActivosFijosController::class, 'getActivosSinFactura']);

            Route::apiResource('/almacengeneral/movimientos-activosfijos', MovimientosActivosFijosController::class)->only(['index', 'show']);
            Route::get('/almacengeneral/view-activosfijos', [MovimientosActivosFijosController::class, 'getVWMovimientosAFCompletos']);
            Route::get('/almacengeneral/tipos-movimientosaf', [MovimientosActivosFijosController::class, 'getTiposMovimientosAF']);

            Route::prefix('almacengeneral/qraf')->group(function () {
                Route::get('descargar/{idActivo}', [CodigosQRAFController::class, 'descargarQR']);
                Route::get('listar', [CodigosQRAFController::class, 'index']);
            });

            Route::prefix('almacengeneral/printer')->group(function () {
                Route::get('test', [PrinterController::class, 'testConexion']);
                Route::get('config', [PrinterController::class, 'obtenerConfiguracion']);
            });
        });

        Route::middleware(PermissionMiddleware::class.':'.$permAlmacenEscritura)->group(function () {
            Route::apiResource('/almacengeneral/facturas', FacturaController::class)->only(['store']);
            Route::put('/almacengeneral/facturas/{id}', [FacturaController::class, 'update']);
            Route::post('/almacengeneral/facturas/activos', [FacturaActivosController::class, 'addActivosToFactura']);
            Route::put('/almacengeneral/facturas/{idFactura}/activos', [FacturaActivosController::class, 'updateActivosFactura']);

            Route::apiResource('/almacengeneral/proveedores', ProveedorController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/clasificaciones', ClasificacionController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/tiposfacturas', TiposFacturaController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/formaspago', FormaPagoController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/tiposmoneda', TiposMonedaController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/activosfijos', ActivosFijosController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/activosfijos-estatus', EstatusAFController::class)->only(['store', 'update']);
            Route::apiResource('/almacengeneral/movimientos-activosfijos', MovimientosActivosFijosController::class)->only(['store', 'update']);

            Route::prefix('almacengeneral/qraf')->group(function () {
                Route::post('generar/{idActivo}', [CodigosQRAFController::class, 'generarQR']);
                Route::post('generar-con-logo/{idActivo}', [CodigosQRAFController::class, 'generarQRConLogo']);
                Route::put('desactivar/{idQR}', [CodigosQRAFController::class, 'desactivar']);
            });

            Route::prefix('almacengeneral/printer')->group(function () {
                Route::post('etiqueta/{idActivo}', [PrinterController::class, 'imprimirEtiquetaZebra']);
                Route::post('etiquetas-batch', [PrinterController::class, 'imprimirEtiquetasBatch']);
                Route::post('preview-zpl/{idActivo}', [PrinterController::class, 'previewZPL']);
            });
        });

        Route::middleware(PermissionMiddleware::class.':'.$permAlmacenEliminar)->group(function () {
            Route::apiResource('/almacengeneral/facturas', FacturaController::class)->only(['destroy']);
            Route::delete('/almacengeneral/facturas/{idFactura}/activos/{idActivo}', [FacturaActivosController::class, 'removeActivoFromFactura']);
            Route::apiResource('/almacengeneral/proveedores', ProveedorController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/clasificaciones', ClasificacionController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/tiposfacturas', TiposFacturaController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/formaspago', FormaPagoController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/tiposmoneda', TiposMonedaController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/activosfijos', ActivosFijosController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/activosfijos-estatus', EstatusAFController::class)->only(['destroy']);
            Route::apiResource('/almacengeneral/movimientos-activosfijos', MovimientosActivosFijosController::class)->only(['destroy']);
        });

        // ============================================================
        // CONTABILIDAD
        // ============================================================
        $permDepreciacionLectura = Permisos::middleware('contabilidad.depreciacion', 'lectura');
        $permDepreciacionEscritura = Permisos::middleware('contabilidad.depreciacion', 'escritura');
        $permMetodosLectura = Permisos::middleware('contabilidad.metodos', 'lectura');
        $permMetodosEscritura = Permisos::middleware('contabilidad.metodos', 'escritura');
        $permMetodosEliminar = Permisos::middleware('contabilidad.metodos', 'eliminar');
        $permAuditoriaLectura = Permisos::middleware('contabilidad.auditoria', 'lectura');
        $permAuditoriaEscritura = Permisos::middleware('contabilidad.auditoria', 'escritura');
        $permAuditoriaEliminar = Permisos::middleware('contabilidad.auditoria', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permDepreciacionLectura)->group(function () {
            Route::get('/contabilidad/depreciacion/activos-sin-depreciar', [DepreciacionController::class, 'activosSinDepreciar']);
            Route::get('/contabilidad/depreciacion/activos-en-depreciacion', [DepreciacionController::class, 'activosEnDepreciacion']);
            Route::get('/contabilidad/depreciacion/historico/{idActivo}', [DepreciacionController::class, 'historicoDepreciaciones']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permDepreciacionEscritura)->group(function () {
            Route::post('/contabilidad/depreciacion/activar/{idActivo}', [DepreciacionController::class, 'activarDepreciacion']);
            Route::post('/contabilidad/depreciacion/calcular/{idActivo}', [DepreciacionController::class, 'calcularDepreciacion']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permMetodosLectura)->group(function () {
            Route::get('/contabilidad/metodos-depreciacion', [MetodoDepreciacionController::class, 'index']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permMetodosEscritura)->group(function () {
            Route::post('/contabilidad/metodos-depreciacion', [MetodoDepreciacionController::class, 'store']);
            Route::put('/contabilidad/metodos-depreciacion/{id}', [MetodoDepreciacionController::class, 'update']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permMetodosEliminar)->group(function () {
            Route::delete('/contabilidad/metodos-depreciacion/{id}', [MetodoDepreciacionController::class, 'destroy']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permAuditoriaLectura)->group(function () {
            Route::get('/contabilidad/estatus-depreciacion', [EstatusDepreciacionController::class, 'index']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permAuditoriaEscritura)->group(function () {
            Route::post('/contabilidad/estatus-depreciacion', [EstatusDepreciacionController::class, 'store']);
            Route::put('/contabilidad/estatus-depreciacion/{id}', [EstatusDepreciacionController::class, 'update']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permAuditoriaEliminar)->group(function () {
            Route::delete('/contabilidad/estatus-depreciacion/{id}', [EstatusDepreciacionController::class, 'destroy']);
        });

        // ============================================================
        // ADMINISTRADOR
        // ============================================================
        $permRolesLectura = Permisos::middleware('admin.roles', 'lectura');
        $permRolesEscritura = Permisos::middleware('admin.roles', 'escritura');
        $permRolesEliminar = Permisos::middleware('admin.roles', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permRolesLectura)->group(function () {
            Route::get('admin/roles/alcances/catalogo', [RolesAdminController::class, 'catalogoAlcances']);
            Route::apiResource('admin/roles', RolesAdminController::class)->only(['index', 'show']);
            Route::apiResource('admin/permisos', PermissionsAdminController::class)->only(['index', 'show']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permRolesEscritura)->group(function () {
            Route::apiResource('admin/roles', RolesAdminController::class)->only(['store', 'update']);
            Route::put('admin/roles/{id}/asignarPermisosRole', [RolesAdminController::class, 'asignarPermisosRole']);
            Route::apiResource('admin/permisos', PermissionsAdminController::class)->only(['store', 'update']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permRolesEliminar)->group(function () {
            Route::apiResource('admin/roles', RolesAdminController::class)->only(['destroy']);
            Route::apiResource('admin/permisos', PermissionsAdminController::class)->only(['destroy']);
        });

        $permDepartamentosLectura = Permisos::middleware('admin.departamentos', 'lectura').'|catalogos.departamentos.lectura';
        $permDepartamentosEscritura = Permisos::middleware('admin.departamentos', 'escritura');
        $permDepartamentosEliminar = Permisos::middleware('admin.departamentos', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permDepartamentosLectura)->group(function () {
            Route::apiResource('admin/departamentos', DepartamentosAdminController::class)->only(['index', 'show']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permDepartamentosEscritura)->group(function () {
            Route::apiResource('admin/departamentos', DepartamentosAdminController::class)->only(['store', 'update']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permDepartamentosEliminar)->group(function () {
            Route::apiResource('admin/departamentos', DepartamentosAdminController::class)->only(['destroy']);
        });

        $permUsuariosLectura = Permisos::middleware('admin.usuarios', 'lectura');
        $permUsuariosEscritura = Permisos::middleware('admin.usuarios', 'escritura');
        $permUsuariosEliminar = Permisos::middleware('admin.usuarios', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permUsuariosLectura)->group(function () {
            Route::apiResource('/admin/users', UserAdminController::class)->only(['index', 'show']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permUsuariosEscritura)->group(function () {
            Route::apiResource('/admin/users', UserAdminController::class)->only(['store', 'update']);
            Route::put('/admin/empleados/{id}/bajaUsuario', [UserAdminController::class, 'updateBajaUsuario']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permUsuariosEliminar)->group(function () {
            Route::apiResource('/admin/users', UserAdminController::class)->only(['destroy']);
        });

        $permEmpleadosLectura = Permisos::middleware('admin.empleados', 'lectura').'|catalogos.empleados.lectura';
        $permEmpleadosEscritura = Permisos::middleware('admin.empleados', 'escritura');
        $permEmpleadosEliminar = Permisos::middleware('admin.empleados', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permEmpleadosLectura)->group(function () {
            Route::apiResource('/admin/empleados', EmpleadoAdminController::class)->only(['index', 'show']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permEmpleadosEscritura)->group(function () {
            Route::apiResource('/admin/empleados', EmpleadoAdminController::class)->only(['store', 'update']);
            Route::put('/admin/empleados/{id}/bajaEmpleado', [EmpleadoAdminController::class, 'updateBajaEmpleado']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permEmpleadosEliminar)->group(function () {
            Route::apiResource('/admin/empleados', EmpleadoAdminController::class)->only(['destroy']);
        });

        $permUbicacionesLectura = Permisos::middleware('admin.ubicaciones', 'lectura').'|catalogos.ubicaciones.lectura';
        $permUbicacionesEscritura = Permisos::middleware('admin.ubicaciones', 'escritura');
        $permUbicacionesEliminar = Permisos::middleware('admin.ubicaciones', 'eliminar');

        Route::middleware(PermissionMiddleware::class.':'.$permUbicacionesLectura)->group(function () {
            Route::apiResource('/admin/ubicaciones', UbicacionController::class)->only(['index', 'show']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permUbicacionesEscritura)->group(function () {
            Route::apiResource('/admin/ubicaciones', UbicacionController::class)->only(['store', 'update']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permUbicacionesEliminar)->group(function () {
            Route::apiResource('/admin/ubicaciones', UbicacionController::class)->only(['destroy']);
        });

        // ============================================================
        // HELPDESK
        // ============================================================
        $permHelpdeskTicketsLectura = Permisos::middleware('helpdesk.tickets', 'lectura');
        $permHelpdeskTicketsEscritura = Permisos::middleware('helpdesk.tickets', 'escritura');
        $permHelpdeskMisTicketsLectura = Permisos::middleware('helpdesk.mis_tickets', 'lectura').'|'.$permHelpdeskTicketsLectura;
        $permHelpdeskMisTicketsEscritura = Permisos::middleware('helpdesk.mis_tickets', 'escritura');
        $permHelpdeskConfigEscritura = Permisos::middleware('helpdesk.configuracion', 'escritura');
        $permHelpdeskReportesLectura = Permisos::middleware('helpdesk.reportes', 'lectura');

        Route::middleware(PermissionMiddleware::class.':'.$permHelpdeskMisTicketsLectura)->group(function () {
            Route::get('helpdesk/categorias', [CategoriaController::class, 'index']);
            Route::get('helpdesk/categorias/{id}', [CategoriaController::class, 'show']);
            Route::get('helpdesk/categorias/{id}/titulos', [TituloController::class, 'porCategoria']);
            Route::get('helpdesk/subcategorias', [SubcategoriaController::class, 'index']);
            Route::get('helpdesk/titulos', [TituloController::class, 'index']);
            Route::get('helpdesk/prioridades', [PrioridadController::class, 'index']);
            Route::get('helpdesk/estatus', [EstatusController::class, 'index']);
            Route::get('helpdesk/etiquetas', [EtiquetaController::class, 'index']);
            Route::get('helpdesk/empleados', [EmpleadoHelpdeskController::class, 'index']);

            Route::apiResource('helpdesk/proveedores-error', ProveedorErrorController::class)->only(['index']);
            Route::apiResource('helpdesk/sistemas-proveedor', SistemaProveedorController::class)->only(['index']);
            Route::apiResource('helpdesk/modulos-siho', ModuloSIHOController::class)->only(['index']);

            Route::get('helpdesk/tickets', [TicketController::class, 'index']);
            Route::get('helpdesk/tickets/{id}', [TicketController::class, 'show']);
            Route::get('helpdesk/tickets/{id}/avances', [AvanceController::class, 'index']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permHelpdeskTicketsEscritura)->group(function () {
            Route::put('helpdesk/tickets/{id}', [TicketController::class, 'update']);
            Route::put('helpdesk/tickets/{id}/cambiar-estado', [TicketController::class, 'cambiarEstado']);
            Route::put('helpdesk/tickets/{id}/tecnicos', [TicketController::class, 'establecerTecnicos']);
            Route::put('helpdesk/tickets/{id}/error-proveedor', [TicketController::class, 'marcarErrorProveedor']);
            Route::put('helpdesk/tickets/{id}/cerrar', [TicketController::class, 'cerrar']);

            Route::post('helpdesk/tickets/{id}/avances', [AvanceController::class, 'store']);
            Route::delete('helpdesk/avances/{id}', [AvanceController::class, 'destroy']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permHelpdeskMisTicketsEscritura)->group(function () {
            Route::post('helpdesk/tickets', [TicketController::class, 'store']);
            Route::put('helpdesk/tickets/{id}/reabrir', [TicketController::class, 'reabrir']);
            Route::post('helpdesk/tickets/{id}/encuesta', [EncuestaController::class, 'store']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permHelpdeskConfigEscritura)->group(function () {
            Route::apiResource('helpdesk/categorias', CategoriaController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/subcategorias', SubcategoriaController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/titulos', TituloController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/prioridades', PrioridadController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/slas', SLANivelController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::apiResource('helpdesk/etiquetas', EtiquetaController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/estatus', EstatusController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/proveedores-error', ProveedorErrorController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/sistemas-proveedor', SistemaProveedorController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('helpdesk/modulos-siho', ModuloSIHOController::class)->only(['store', 'update', 'destroy']);
        });

        Route::middleware(PermissionMiddleware::class.':'.$permHelpdeskReportesLectura)->get('helpdesk/dashboard', [HelpdeskDashboardController::class, 'index']);
    });
