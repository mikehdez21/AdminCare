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
use App\Http\Controllers\AdminControllers\PermissionsController as PermissionsAdminController;
use App\Http\Controllers\AdminControllers\DepartamentosController as DepartamentosAdminController;
use App\Http\Controllers\AdminControllers\EmpleadoController as EmpleadoAdminController;
use App\Http\Controllers\AdminControllers\UbicacionController;


// AlmacenGeneral_Controllers
use App\Http\Controllers\AlmacenGeneral\ProveedorController;
use App\Http\Controllers\AlmacenGeneral\FacturaController;
use App\Http\Controllers\AlmacenGeneral\FacturaActivosController;
use App\Http\Controllers\AlmacenGeneral\ActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\MovimientosActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\CodigosQRAFController;
use App\Http\Controllers\AlmacenGeneral\PrinterController;

// AlmacenGeneral -- ParamsControllers
use App\Http\Controllers\AlmacenGeneral\ClasificacionController;
use App\Http\Controllers\AlmacenGeneral\TiposFacturaController;
use App\Http\Controllers\AlmacenGeneral\FormaPagoController;
use App\Http\Controllers\AlmacenGeneral\TiposMonedaController;
use App\Http\Controllers\AlmacenGeneral\EstatusAFController;


//  -   // AlmacenGeneral
use App\Http\Controllers\FillTypes\AlmacenGeneral\TypesProveedorController;

// Contabilidad
use App\Http\Controllers\AlmacenGeneral\DepreciacionController;
use App\Http\Controllers\AlmacenGeneral\MetodoDepreciacionController;
use App\Http\Controllers\AlmacenGeneral\EstatusDepreciacionController;

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

     Route::middleware(['auth'])->group(function () {
        Route::get('/auth/permissions', [AuthController::class, 'permissions']);
    });


    // ============================================================
    // RUTA PÚBLICA DE ESCANEO QR (sin autenticación)
    // ============================================================
    Route::get('/almacengeneral/qraf/scan/{codigoQR}', [CodigosQRAFController::class, 'escanearQR']);




    
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

        Route::middleware(['auth', 'permission:sidebar_submenu_almacenes_almacengeneral'])->group(function () {

            Route::get('/almacengeneral/tipos-proveedor', [TypesProveedorController::class, 'getTiposProveedor']);
            Route::get('/almacengeneral/tipos-regimen', [TypesProveedorController::class, 'getTiposRegimen']);
            Route::get('/almacengeneral/descuentos-proveedor', [TypesProveedorController::class, 'getDescuentosProveedor']);
            Route::get('/almacengeneral/tipos-facturacion', [TypesProveedorController::class, 'getTiposFacturacion']);

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
            
            // TIPOS DE FACTURA
            Route::apiResource('/almacengeneral/tiposfactura', TiposFacturaController::class);

            // FORMAS DE PAGO
            Route::apiResource('/almacengeneral/formaspago', FormaPagoController::class);

            // TIPOS DE MONEDA
            Route::apiResource('/almacengeneral/tiposmoneda', TiposMonedaController::class);
            
            // ACTIVOS FIJOS
            Route::apiResource('/almacengeneral/activosfijos', ActivosFijosController::class);

            // ESTATUS DE ACTIVOS FIJOS
            Route::apiResource('/almacengeneral/activosfijos-estatus', EstatusAFController::class);

            // ACTIVOS FIJOS FILTRADOS
            Route::get('/almacengeneral/activosfijos/departamento/{idDepartamento}', [ActivosFijosController::class, 'getActivosPorDepartamento']);
            Route::get('/almacengeneral/activosfijos/ubicacion/{idUbicacion}', [ActivosFijosController::class, 'getActivosPorUbicacion']);
            Route::get('/almacengeneral/activosfijos/clasificacion/{idClasificacion}', [ActivosFijosController::class, 'getActivosPorClasificacion']);
            Route::get('/almacengeneral/activosfijos/responsable/{idEmpleado}', [ActivosFijosController::class, 'getActivosPorResponsable']);
            Route::get('/almacengeneral/activosfijos-bajas', [ActivosFijosController::class, 'getActivosDadosDeBaja']);
            Route::get('/almacengeneral/activosfijos-nopropios', [ActivosFijosController::class, 'getActivosNoPropios']);

            // ACTIVOS FIJOS - MOVIMIENTOS 
            Route::apiResource('/almacengeneral/movimientos-activosfijos', MovimientosActivosFijosController::class);
            Route::get('/almacengeneral/view-activosfijos', [MovimientosActivosFijosController::class, 'getVWMovimientosAFCompletos']);
            Route::get('/almacengeneral/tipos-movimientosaf', [MovimientosActivosFijosController::class, 'getTiposMovimientosAF']);
            
            // ACTIVOS FIJOS - CÓDIGOS QR
            Route::prefix('almacengeneral/qraf')->group(function () {
                Route::post('generar/{idActivo}', [CodigosQRAFController::class, 'generarQR']);
                Route::post('generar-con-logo/{idActivo}', [CodigosQRAFController::class, 'generarQRConLogo']);
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

        });


       // CONTABILIDAD
        Route::middleware(['auth', 'permission:sidebar_menu_contabilidad'])->group(function () {


            // Contabilidad - Depreciación
            Route::prefix('/contabilidad/depreciacion')->group(function () {
                Route::get('/activos-sin-depreciar', [DepreciacionController::class, 'activosSinDepreciar']);
                Route::get('/activos-en-depreciacion', [DepreciacionController::class, 'activosEnDepreciacion']);
                Route::post('/activar/{idActivo}', [DepreciacionController::class, 'activarDepreciacion']);
                Route::get('/historico/{idActivo}', [DepreciacionController::class, 'historicoDepreciaciones']);
                Route::post('/calcular/{idActivo}', [DepreciacionController::class, 'calcularDepreciacion']);
            });

            // Configuración - Métodos de Depreciación
            Route::prefix('/contabilidad/metodos-depreciacion')->group(function () {
                Route::get('/', [MetodoDepreciacionController::class, 'index']);
                Route::post('/', [MetodoDepreciacionController::class, 'store']);
                Route::put('/{id}', [MetodoDepreciacionController::class, 'update']);
            });

            // Configuración - Estatus de Depreciación
            Route::prefix('/contabilidad/estatus-depreciacion')->group(function () {
                Route::get('/', [EstatusDepreciacionController::class, 'index']);
                Route::post('/', [EstatusDepreciacionController::class, 'store']);
                Route::put('/{id}', [EstatusDepreciacionController::class, 'update']);
            });

        });



        // ADMINISTRADOR

        // Rutas CRUD Roles
        Route::middleware('permission:sidebar_submenu_administrador_gestionroles')->group(function () {
            Route::apiResource('admin/roles', RolesAdminController::class);
            Route::put('admin/roles/{id}/asignarPermisosRole', [RolesAdminController::class, 'asignarPermisosRole']);
            Route::apiResource('admin/permisos', PermissionsAdminController::class);
        });
        
        // Rutas CRUD Departamentos
        Route::middleware('permission:sidebar_submenu_administrador_gestiondepartamentos')->group(function () {
            Route::apiResource('admin/departamentos', DepartamentosAdminController::class);
        });
        
        // Rutas CRUD Usuarios
        Route::middleware('permission:sidebar_submenu_administrador_gestionusuarios')->group(function () {
            Route::apiResource('/admin/users', UserAdminController::class);
            Route::put('/admin/empleados/{id}/bajaUsuario', [UserAdminController::class, 'updateBajaUsuario']);
        });

        // Rutas CRUD Empleados
        Route::middleware('permission:sidebar_submenu_administrador_gestionempleados')->group(function () {
            Route::apiResource('/admin/empleados', EmpleadoAdminController::class);
            Route::put('/admin/empleados/{id}/bajaEmpleado', [EmpleadoAdminController::class, 'updateBajaEmpleado']);
        });

        // Rutas CRUD Ubicaciones
        Route::middleware('permission:sidebar_submenu_administrador_gestionubicaciones')->group(function () {
            Route::apiResource('/admin/ubicaciones', UbicacionController::class);
        });


    });
});

/*
Route::prefix('HSS2')->group(function () {

});
*/
