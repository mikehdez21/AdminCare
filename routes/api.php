<?php

use Illuminate\Support\Facades\Route;

// Api/Controllers
use App\Http\Controllers\ApiStatusController;
use App\Http\Controllers\AuthController;

// Admin/Controllers 
use App\Http\Controllers\AdminControllers\UserController as UserAdminController;
use App\Http\Controllers\AdminControllers\RolesController as RolesAdminController;
use App\Http\Controllers\AdminControllers\DepartamentosController as DepartamentosAdminController;
use App\Http\Controllers\AdminControllers\EmpleadoController as EmpleadoAdminController;



// AlmacenGeneral_Controllers
use App\Http\Controllers\AlmacenGeneral\ProveedorController;
use App\Http\Controllers\AlmacenGeneral\ClasificacionController;
use App\Http\Controllers\AlmacenGeneral\FacturaController;
use App\Http\Controllers\AlmacenGeneral\ActivosFijosController;
use App\Http\Controllers\AlmacenGeneral\CodigosQRController;

//  -   // AlmacenGeneral
use App\Http\Controllers\FillTypes\AlmacenGeneral\TypesProveedorController;
use App\Http\Controllers\FillTypes\AlmacenGeneral\TypesFacturaController;

Route::prefix('HSS1')->group(function () {

    // Rutas Publicas ::public

    // ::auth (Register y Login)
    Route::get('/auth/check', [AuthController::class, 'check'])->name('check');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');

    // Mantener aquí las rutas TEMPORALMENTE para pruebas en DEV, ya en producción final pasar dentro del group middlware de auth (Sessions)
    Route::get('/almacenGeneral/tipos-proveedor', [TypesProveedorController::class, 'getTiposProveedor']);
    Route::get('/almacenGeneral/formas-pago', [TypesProveedorController::class, 'getFormasPago']);
    Route::get('/almacenGeneral/tipos-regimen', [TypesProveedorController::class, 'getTiposRegimen']);
    Route::get('/almacenGeneral/descuentos-proveedor', [TypesProveedorController::class, 'getDescuentosProveedor']);
    Route::get('/almacenGeneral/tipos-facturacion', [TypesProveedorController::class, 'getTiposFacturacion']);
    Route::get('/almacenGeneral/tipos-moneda', [TypesProveedorController::class, 'getTiposMoneda']);

    Route::get('/almacenGeneral/tipos-facturas', [TypesFacturaController::class, 'getTiposFacturas']);

    Route::apiResource('/almacenGeneral/proveedores', ProveedorController::class);
    Route::apiResource('/almacenGeneral/clasificaciones', ClasificacionController::class);
    Route::apiResource('/almacenGeneral/facturas', FacturaController::class);
    Route::apiResource('/almacenGeneral/activosfijos', ActivosFijosController::class);

    Route::prefix('activosfijos/qr')->group(function () {
        Route::post('generar/{idActivo}', [CodigosQRController::class, 'generarQR']);
        Route::post('generar-con-logo/{idActivo}', [CodigosQRController::class, 'generarQRConLogo']);
        Route::get('scan/{codigoQR}', [CodigosQRController::class, 'escanearQR']);
        Route::get('descargar/{idActivo}', [CodigosQRController::class, 'descargarQR']);
        Route::get('listar', [CodigosQRController::class, 'index']);
        Route::put('desactivar/{idQR}', [CodigosQRController::class, 'desactivar']);
    });






    Route::apiResource('/admin/roles', RolesAdminController::class);
    Route::apiResource('/admin/departamentos', DepartamentosAdminController::class);

    // Rutas CRUD Usuarios
    Route::apiResource('/admin/users', UserAdminController::class);
    Route::put('/admin/empleados/{id}/bajaUsuario', [UserAdminController::class, 'updateBajaUsuario']);


    // Rutas CRUD Empleado
    Route::apiResource('/admin/empleados', EmpleadoAdminController::class);
    Route::put('/admin/empleados/{id}/bajaEmpleado', [EmpleadoAdminController::class, 'updateBajaEmpleado']);

    // Mantener aquí las rutas TEMPORALMENTE para pruebas en DEV, ya en producción final pasar dentro del group middlware de auth (Sessions)


    // Rutas Privadas ::private
    Route::group(['middleware' => 'auth'], function () {

        Route::get('/status', [ApiStatusController::class]);
        //::auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-inactive', [AuthController::class, 'logoutInactive']);

        // Rutas CRUD Admin ::rol

        // Rutas CRUD AlmacenGeneral






        /*
        // Rutas Cliente ::rol
        Route::apiResource('/cliente/empresa', EmpresaCliente::class);

        Route::apiResource('/admin/categorias', CategoriaController::class);
        Route::apiResource('/admin/empresa', EmpresaController::class);


        // Rutas Empresa ::rol
        */
    });
});

/*
Route::prefix('HSS2')->group(function () {

});
*/
