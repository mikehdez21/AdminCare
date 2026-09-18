<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ApiStatusController extends Controller
{
    public function index()
    {
        try {
            if (DB::connection()->getDriverName() !== 'sqlite') {
                throw new \RuntimeException('Unsupported health-check database.');
            }
            DB::connection()->getPdo();
            DB::select('select 1');
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Servicio no disponible.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return response()->json(['success' => true, 'status_code' => Response::HTTP_OK], Response::HTTP_OK);
    }

    public function dbStatus()
    {
        try {
            if (DB::connection()->getDriverName() !== 'sqlite') {
                throw new \RuntimeException('Unsupported health-check database.');
            }
            DB::connection()->getPdo();
            DB::select('select 1');

            return response()->json([
                'success' => true,
                'database' => config('database.default'),
                'status_code' => Response::HTTP_OK,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'La base de datos no está disponible.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }
    }
}
