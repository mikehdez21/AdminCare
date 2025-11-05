<?php

//use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiStatusController;


//$role = Role::create(['name' => 'JAlmacenGeneral']);


Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');

Route::get('/status', [ApiStatusController::class, 'index']);
