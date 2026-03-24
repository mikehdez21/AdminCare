<?php

//use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiStatusController;
use Illuminate\Http\Request;



//$role = Role::create(['name' => 'JAlmacenGeneral']);


// Compatibilidad para QR historicos que apuntan al backend.
Route::get('/activosfijos/qraf/{codigoQR}', function (Request $request, string $codigoQR) {
    $frontendUrl = rtrim((string) config('app.frontend_url', ''), '/');

    if ($frontendUrl === '') {
        return response('Configuracion pendiente: FRONTEND_URL no definido en backend.', 503);
    }

    $currentHost = $request->getSchemeAndHttpHost();
    if (rtrim($currentHost, '/') === $frontendUrl) {
        return response('Configuracion invalida: FRONTEND_URL no puede ser igual al dominio backend.', 500);
    }

    return redirect()->away($frontendUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR));
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|HSS1).*');

Route::get('/status', [ApiStatusController::class, 'index']);



