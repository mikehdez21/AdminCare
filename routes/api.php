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
use App\Http\Controllers\SoftComputing\PricingModelController;

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

        // SOFTCOMPUTING - TRAINING REAL DE MODELOS (SCIKIT-LEARN + FASTAPI)
        Route::post('/softcomputing/pricing/train', [PricingModelController::class, 'train']);
        Route::post('/softcomputing/pricing/train-db', [PricingModelController::class, 'trainFromDatabase']);
        Route::post('/softcomputing/pricing/predict', [PricingModelController::class, 'predict']);
        Route::get('/softcomputing/pricing/models', [PricingModelController::class, 'listModels']);
        
        // ALMACENES - TIPOS
        Route::get('/almacengeneral/tipos-proveedor', [TypesProveedorController::class, 'getTiposProveedor']);
        Route::get('/almacengeneral/formas-pago', [TypesProveedorController::class, 'getFormasPago']);
        Route::get('/almacengeneral/tipos-regimen', [TypesProveedorController::class, 'getTiposRegimen']);
        Route::get('/almacengeneral/descuentos-proveedor', [TypesProveedorController::class, 'getDescuentosProveedor']);
        Route::get('/almacengeneral/tipos-facturacion', [TypesProveedorController::class, 'getTiposFacturacion']);
        Route::get('/almacengeneral/tipos-moneda', [TypesProveedorController::class, 'getTiposMoneda']);

        // FACTURAS
        Route::apiResource('/almacengeneral/facturas', FacturaController::class);
        Route::get('/almacengeneral/tipos-facturas', [FacturaController::class, 'getTiposFacturas']);
        
        // FACTURA-ACTIVOS
        Route::get('/almacengeneral/facturas/{idFactura}/activos', [FacturaActivosController::class, 'getActivosByFactura']);
        Route::post('/almacengeneral/facturas/activos', [FacturaActivosController::class, 'addActivosToFactura']);
        Route::put('/almacengeneral/facturas/{idFactura}/activos', [FacturaActivosController::class, 'updateActivosFactura']);
        Route::delete('/almacengeneral/facturas/{idFactura}/activos/{idActivo}', [FacturaActivosController::class, 'removeActivoFromFactura']);

        // PROVEEDORES 
        Route::apiResource('/almacengeneral/proveedores', ProveedorController::class);
        
        // CLASIFICACIONES
        Route::apiResource('/almacengeneral/clasificaciones', ClasificacionController::class);
        
        // ACTIVOS FIJOS
        Route::apiResource('/almacengeneral/activosfijos', ActivosFijosController::class);

        // ACTIVOS FIJOS FILTRADOS
        Route::get('/almacengeneral/activosfijos/departamento/{idDepartamento}', [ActivosFijosController::class, 'getActivosPorDepartamento']);
        Route::get('/almacengeneral/activosfijos/ubicacion/{idUbicacion}', [ActivosFijosController::class, 'getActivosPorUbicacion']);
        Route::get('/almacengeneral/activosfijos/clasificacion/{idClasificacion}', [ActivosFijosController::class, 'getActivosPorClasificacion']);
        Route::get('/almacengeneral/activosfijos-bajas', [ActivosFijosController::class, 'getActivosDadosDeBaja']);
        
        // ACTIVOS FIJOS - MOVIMIENTOS 
        Route::apiResource('/almacengeneral/movimientos-activosfijos', MovimientosActivosFijosController::class);
        Route::get('/almacengeneral/tipos-estatusaf', [ActivosFijosController::class, 'getEstatusActivosFijos']);
        Route::get('/almacengeneral/view-activosfijos', [MovimientosActivosFijosController::class, 'getVWMovimientosAFCompletos']);
        Route::get('/almacengeneral/tipos-movimientosaf', [MovimientosActivosFijosController::class, 'getTiposMovimientosAF']);
        
        // ACTIVOS FIJOS - CÓDIGOS QR
        Route::prefix('almacengeneral/qraf')->group(function () {
            Route::post('generar/{idActivo}', [CodigosQRAFController::class, 'generarQR']);
            Route::post('generar-con-logo/{idActivo}', [CodigosQRAFController::class, 'generarQRConLogo']);
            Route::get('scan/{codigoQR}', [CodigosQRAFController::class, 'escanearQR']);
            Route::get('descargar/{idActivo}', [CodigosQRAFController::class, 'descargarQR']);
            Route::get('listar', [CodigosQRAFController::class, 'index']);
            Route::put('desactivar/{idQR}', [CodigosQRAFController::class, 'desactivar']);
        });

        // IMPRESIÓN - ZEBRA PRINTER
        Route::prefix('almacengeneral/printer')->group(function () {
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
