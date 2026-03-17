<?php

//use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiStatusController;



//$role = Role::create(['name' => 'JAlmacenGeneral']);

Route::get('/status', [ApiStatusController::class, 'index']);

// Compatibilidad para QR historicos que apuntan al backend.
Route::get('/activosfijos/qraf/{codigoQR}', function (string $codigoQR) {
    $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
    return redirect()->away($frontendUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR));
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
