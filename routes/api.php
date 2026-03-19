<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\View\Middleware\ShareErrorsFromSession;

// Api/Controllers
use App\Http\Controllers\ApiStatusController;
use App\Http\Controllers\AuthController;

// SoftComputing Controller
use App\Http\Controllers\SoftComputing\OpenAIController;

// Admin/Controllers 
use App\Http\Controllers\AdminControllers\UserController as UserAdminController;
use App\Http\Controllers\AdminControllers\RolesController as RolesAdminController;
use App\Http\Controllers\AdminControllers\DepartamentosController as DepartamentosAdminController;
use App\Http\Controllers\AdminControllers\EmpleadoController as EmpleadoAdminController;
use App\Http\Controllers\AdminControllers\UbicacionController;


// AlmacenGeneral_Controllers
use App\Http\Controllers\AlmacenGeneral\ProveedorController;
use App\Http\Controllers\AlmacenGeneral\ClasificacionController;
use App\Http\Controllers\AlmacenGeneral\FacturaController;
use App\Http\Controllers\AlmacenGeneral\FacturaActivosController;
use App\Http\Controllers\AlmacenGeneral\ActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\MovimientosActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\CodigosQRAFController;
use App\Http\Controllers\AlmacenGeneral\PrinterController;

//  -   // AlmacenGeneral
use App\Http\Controllers\FillTypes\AlmacenGeneral\TypesProveedorController;

Route::prefix('HSS1')->group(function () {

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

    // ============================================================
    // RUTAS DE AUTENTICACIÓN (sin protección, con sesión + CSRF)
    // ============================================================
    // Estas rutas obtienen sesión + CSRF automáticamente del middleware de API
    Route::get('/auth/check', [AuthController::class, 'check'])->name('check');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');

    // ============================================================
    // RUTAS PROTEGIDAS (auth:sanctum con sesión + CSRF)
    // ============================================================
    Route::group(['middleware' => 'auth:sanctum'], function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-inactive', [AuthController::class, 'logoutInactive']);

        // OPENAI Controller
        Route::post('/softcomputing/analyze', [OpenAIController::class, 'chat']);
        
        // ALMACENES - TIPOS
        Route::get('/almacenGeneral/tipos-proveedor', [TypesProveedorController::class, 'getTiposProveedor']);
        Route::get('/almacenGeneral/formas-pago', [TypesProveedorController::class, 'getFormasPago']);
        Route::get('/almacenGeneral/tipos-regimen', [TypesProveedorController::class, 'getTiposRegimen']);
        Route::get('/almacenGeneral/descuentos-proveedor', [TypesProveedorController::class, 'getDescuentosProveedor']);
        Route::get('/almacenGeneral/tipos-facturacion', [TypesProveedorController::class, 'getTiposFacturacion']);
        Route::get('/almacenGeneral/tipos-moneda', [TypesProveedorController::class, 'getTiposMoneda']);

        // FACTURAS
        Route::apiResource('/almacenGeneral/facturas', FacturaController::class);
        Route::get('/almacenGeneral/tipos-facturas', [FacturaController::class, 'getTiposFacturas']);
        
        // FACTURA-ACTIVOS
        Route::get('/almacenGeneral/facturas/{idFactura}/activos', [FacturaActivosController::class, 'getActivosByFactura']);
        Route::post('/almacenGeneral/facturas/activos', [FacturaActivosController::class, 'addActivosToFactura']);
        Route::put('/almacenGeneral/facturas/{idFactura}/activos', [FacturaActivosController::class, 'updateActivosFactura']);
        Route::delete('/almacenGeneral/facturas/{idFactura}/activos/{idActivo}', [FacturaActivosController::class, 'removeActivoFromFactura']);

        // PROVEEDORES 
        Route::apiResource('/almacenGeneral/proveedores', ProveedorController::class);
        
        // CLASIFICACIONES
        Route::apiResource('/almacenGeneral/clasificaciones', ClasificacionController::class);
        
        // ACTIVOS FIJOS
        Route::apiResource('/almacenGeneral/activosfijos', ActivosFijosController::class);

        // ACTIVOS FIJOS FILTRADOS
        Route::get('/almacenGeneral/activosfijos/departamento/{idDepartamento}', [ActivosFijosController::class, 'getActivosPorDepartamento']);
        Route::get('/almacenGeneral/activosfijos/ubicacion/{idUbicacion}', [ActivosFijosController::class, 'getActivosPorUbicacion']);
        Route::get('/almacenGeneral/activosfijos/clasificacion/{idClasificacion}', [ActivosFijosController::class, 'getActivosPorClasificacion']);
        Route::get('/almacenGeneral/activosfijos-bajas', [ActivosFijosController::class, 'getActivosDadosDeBaja']);
        
        // ACTIVOS FIJOS - MOVIMIENTOS 
        Route::apiResource('/almacenGeneral/movimientos-activosfijos', MovimientosActivosFijosController::class);
        Route::get('/almacenGeneral/tipos-estatusaf', [ActivosFijosController::class, 'getEstatusActivosFijos']);
        Route::get('/almacenGeneral/view-activosfijos', [MovimientosActivosFijosController::class, 'getVWMovimientosAFCompletos']);
        Route::get('/almacenGeneral/tipos-movimientosaf', [MovimientosActivosFijosController::class, 'getTiposMovimientosAF']);
        
        // ACTIVOS FIJOS - CÓDIGOS QR
        Route::prefix('almacenGeneral/qraf')->group(function () {
            Route::post('generar/{idActivo}', [CodigosQRAFController::class, 'generarQR']);
            Route::post('generar-con-logo/{idActivo}', [CodigosQRAFController::class, 'generarQRConLogo']);
            Route::get('scan/{codigoQR}', [CodigosQRAFController::class, 'escanearQR']);
            Route::get('descargar/{idActivo}', [CodigosQRAFController::class, 'descargarQR']);
            Route::get('listar', [CodigosQRAFController::class, 'index']);
            Route::put('desactivar/{idQR}', [CodigosQRAFController::class, 'desactivar']);
        });

        // IMPRESIÓN - ZEBRA PRINTER
        Route::prefix('almacenGeneral/printer')->group(function () {
            Route::post('etiqueta/{idActivo}', [PrinterController::class, 'imprimirEtiquetaZebra']);
            Route::post('etiquetas-batch', [PrinterController::class, 'imprimirEtiquetasBatch']);
            Route::get('test', [PrinterController::class, 'testConexion']);
            Route::get('config', [PrinterController::class, 'obtenerConfiguracion']);
            Route::post('preview-zpl/{idActivo}', [PrinterController::class, 'previewZPL']);
        });

        // ADMINISTRADOR - Roles
        Route::apiResource('/admin/roles', RolesAdminController::class);
        
        // ADMINISTRADOR - Departamentos
        Route::apiResource('/admin/departamentos', DepartamentosAdminController::class);

        // ADMINISTRADOR - Usuarios
        Route::apiResource('/admin/users', UserAdminController::class);
        Route::put('/admin/empleados/{id}/bajaUsuario', [UserAdminController::class, 'updateBajaUsuario']);

        // ADMINISTRADOR - Empleados
        Route::apiResource('/admin/empleados', EmpleadoAdminController::class);
        Route::put('/admin/empleados/{id}/bajaEmpleado', [EmpleadoAdminController::class, 'updateBajaEmpleado']);

        // ADMINISTRADOR - Ubicaciones
        Route::apiResource('/admin/ubicaciones', UbicacionController::class);

    });
});

/*
Route::prefix('HSS2')->group(function () {

});
*/
