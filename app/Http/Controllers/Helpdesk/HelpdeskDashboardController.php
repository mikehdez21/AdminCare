<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Services\Helpdesk\TicketQueryService;
use Illuminate\Http\Request;

class HelpdeskDashboardController extends Controller
{
    public function __construct(private readonly TicketQueryService $ticketQueryService) {}

    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Métricas obtenidas correctamente.',
            // El usuario va al servicio: el alcance de las métricas es el mismo que
            // el del listado (`TicketService::scopeVisibleA`).
            'data' => $this->ticketQueryService->dashboardMetrics($request->query(), $request->user()),
        ], 200);
    }
}
