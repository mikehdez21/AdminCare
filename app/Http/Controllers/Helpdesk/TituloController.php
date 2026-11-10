<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\SubcategoriaTicket;
use App\Models\Helpdesk\TituloTicket;
use App\Services\Helpdesk\TicketService;
use App\Support\Permisos;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TituloController extends Controller
{
    use ValidatesRequests;

    /**
     * La gestión interna del Helpdesk y los técnicos que atienden la mesa ven las
     * actividades internas; el resto no.
     */
    public function __construct(private readonly TicketService $ticketService) {}

    /**
     * Títulos de una subcategoría, para la pantalla de Configuración.
     *
     * `id_subcategoria_ticket` es opcional: sin él devuelve todos, que es lo que
     * la pantalla necesita al abrir sin selección previa.
     */
    public function index(Request $request)
    {
        // La carga anidada va con sintaxis de closure y no encadenada en la lista
        // de columnas (`subcategoria:a,b,categoria:d,e`): Laravel parte el texto
        // por comas y `"categoria"` acababa elegidos como columna de la tabla de
        // subcategorías, que no existe. El 500羞辱aba el listado entero de
        // títulos, y con él la tercera columna de la pantalla.
        $titulos = TituloTicket::with([
            'subcategoria' => fn ($q) => $q
                ->select('id_subcategoria_ticket', 'id_categoria_ticket', 'nombre_subcategoria')
                ->with('categoria:id_categoria_ticket,nombre_categoria'),
        ])
            ->when(
                $request->query('id_subcategoria_ticket'),
                fn ($q, $id) => $q->where('id_subcategoria_ticket', $id)
            )
            ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
            ->orderBy('nombre_titulo_ticket')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Títulos obtenidos correctamente.',
            'data' => $titulos,
        ], 200);
    }

    /**
     * Títulos que puede elegir el solicitante dentro de una categoría.
     *
     * Aplana las subcategorías para que el solicitante nunca tenga que conocerlas:
     * cada título viaja con su `id_subcategoria_ticket` y `nombre_subcategoria`
     * para que el servidor resuelva la clasificación completa al guardar.
     *
     * Las subcategorías **no públicas** son actividades internas del personal que
     * atiende tickets, así que no aparecen aquí salvo para ese personal. Como el
     * selector de subcategoría del alta se deriva de estos títulos, con filtrarlos
     * aquí desaparecen las dos opciones de una vez.
     */
    public function porCategoria(Request $request, $id)
    {
        $categoriaId = (int) $id;

        // La categoría debe existir y estar activa: un id inválido devuelve 404,
        // no una lista vacía que el frontend interpretaría como "sin títulos".
        SubcategoriaTicket::where('id_categoria_ticket', $categoriaId)->activos()->firstOrFail();

        $veActividadesInternas = $this->atiendeTickets($request);

        $titulos = TituloTicket::with('subcategoria:id_subcategoria_ticket,nombre_subcategoria')
            ->whereHas('subcategoria', function ($q) use ($categoriaId, $veActividadesInternas) {
                $q->where('id_categoria_ticket', $categoriaId);

                if (! $veActividadesInternas) {
                    $q->where('es_publico', true);
                }
            })
            ->activos()
            ->orderBy('nombre_titulo_ticket')
            ->get()
            ->map(fn (TituloTicket $titulo) => [
                'id_titulo_ticket' => $titulo->id_titulo_ticket,
                'nombre_titulo_ticket' => $titulo->nombre_titulo_ticket,
                'descripcion_titulo_ticket' => $titulo->descripcion_titulo_ticket,
                'id_subcategoria_ticket' => $titulo->subcategoria->id_subcategoria_ticket,
                'nombre_subcategoria' => $titulo->subcategoria->nombre_subcategoria,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Títulos obtenidos correctamente.',
            'data' => $titulos,
        ], 200);
    }

    /**
     * Si quien consulta puede ver las actividades internas (subcategorías no
     * públicas).
     *
     * Son del departamento que atiende tickets —hace falta la marca en el usuario y
     * en su departamento— y también del rol Admin, que ve todo lo demás del módulo.
     * Es el espejo de `puedeVerErrorProveedor` en el frontend.
     *
     * Falla cerrado: sin usuario (o sin departamento cargado) las actividades
     * internas no se listan.
     */
    private function atiendeTickets(Request $request): bool
    {
        $usuario = $request->user();

        if ($usuario === null) {
            return false;
        }

        return Permisos::tiene($usuario, 'helpdesk.internas', 'lectura')
            || $this->ticketService->atiendeHelpdesk($usuario);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas($request));

        $titulo = TituloTicket::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Título creado exitosamente.',
            'data' => $titulo,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $titulo = TituloTicket::findOrFail($id);

        $data = $this->validate($request, $this->reglas($request, $titulo));
        $titulo->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Título actualizado exitosamente.',
            'data' => $titulo->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $titulo = TituloTicket::findOrFail($id);

        // Es el único nivel que el solicitante elige, así que casi siempre tendrá
        // tickets: la baja real es desactivar, no borrar.
        if ($titulo->tickets()->exists()) {
            throw ValidationException::withMessages([
                'id_titulo_ticket' => 'No se puede eliminar el título porque tiene tickets asociados. Desactívelo para retirarlo de los formularios sin perder el histórico.',
            ]);
        }

        $titulo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Título eliminado correctamente.',
        ], 200);
    }

    /**
     * @param  TituloTicket|null  $titulo  El título en edición, si lo hay.
     */
    private function reglas(Request $request, ?TituloTicket $titulo = null): array
    {
        // En `update` la subcategoría puede no venir en el payload. Si no viene se
        // conserva la actual: validar contra `null` haría que el filtro de
        // unicidad no encontrara nada, dejaría pasar el duplicado y lo reporta la
        // llave foránea como 500.
        $subcategoriaId = $request->input('id_subcategoria_ticket', $titulo?->id_subcategoria_ticket);

        $unico = Rule::unique(TituloTicket::class, 'nombre_titulo_ticket')
            ->where(fn ($q) => $q->where('id_subcategoria_ticket', $subcategoriaId));

        if ($titulo !== null) {
            $unico->ignore($titulo->id_titulo_ticket);
        }

        $presente = $titulo === null ? 'required' : 'sometimes';

        return [
            'id_subcategoria_ticket' => [$presente, 'integer', Rule::exists(SubcategoriaTicket::class, 'id_subcategoria_ticket')],
            'nombre_titulo_ticket' => [$presente, 'string', 'max:150', $unico],
            'descripcion_titulo_ticket' => 'nullable|string|max:2000',
            'estatus_activo' => 'sometimes|boolean',
        ];
    }
}
