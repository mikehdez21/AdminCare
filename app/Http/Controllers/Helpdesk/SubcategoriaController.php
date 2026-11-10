<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\CategoriaTicket;
use App\Models\Helpdesk\SubcategoriaTicket;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Clasificación interna de los tickets (nivel 2 de la jerarquía). No es lo que
 * elige el solicitante: sirve para administración y filtrado.
 */
class SubcategoriaController extends Controller
{
    use ValidatesRequests;

    public function index(Request $request)
    {
        $subcategorias = SubcategoriaTicket::query()
            // Igual que en categorías: el flag `incluir_inactivos` es lo que usa la
            // pantalla de Configuración; los formularios de ticket no lo mandan y
            // reciben solo las activas.
            ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
            ->when(
                $request->query('id_categoria_ticket'),
                fn ($q, $id) => $q->where('id_categoria_ticket', $id)
            )
            ->orderBy('nombre_subcategoria')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Subcategorías obtenidas correctamente.',
            'data' => $subcategorias,
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas($request));

        $subcategoria = SubcategoriaTicket::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Subcategoría creada exitosamente.',
            'data' => $subcategoria,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $subcategoria = SubcategoriaTicket::findOrFail($id);

        $data = $this->validate($request, $this->reglas($request, $subcategoria));
        $subcategoria->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Subcategoría actualizada exitosamente.',
            'data' => $subcategoria->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $subcategoria = SubcategoriaTicket::findOrFail($id);

        // Mismo criterio que en la categoría: los tickets históricos apuntan aquí y
        // no se deben perder en cascada.
        if ($subcategoria->tickets()->exists()) {
            throw ValidationException::withMessages([
                'id_subcategoria_ticket' => 'No se puede eliminar la subcategoría porque tiene tickets asociados.',
            ]);
        }

        if ($subcategoria->titulos()->exists()) {
            throw ValidationException::withMessages([
                'id_subcategoria_ticket' => 'No se puede eliminar la subcategoría porque tiene títulos asociados. Elimínelos primero.',
            ]);
        }

        $subcategoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subcategoría eliminada correctamente.',
        ], 200);
    }

    /**
     * El nombre se valida único **dentro de la categoría**, que es lo que fija
     * `uk_subcategoria_categoria_nombre`. Dos categorías distintas pueden tener
     * subcategorías homónimas sin chocar.
     *
     * @param  SubcategoriaTicket|null  $subcategoria  La subcategoría en edición.
     */
    private function reglas(Request $request, ?SubcategoriaTicket $subcategoria = null): array
    {
        // En `update` la categoría puede no venir en el payload. Si no viene se
        // conserva la actual: validar contra `null` haría que el filtro de
        // unicidad no encontrara nada, dejaría pasar el duplicado y lo reportaría
        // la llave foránea como 500.
        $categoriaId = $request->input('id_categoria_ticket', $subcategoria?->id_categoria_ticket);

        $unico = Rule::unique(SubcategoriaTicket::class, 'nombre_subcategoria')
            ->where(fn ($q) => $q->where('id_categoria_ticket', $categoriaId));

        if ($subcategoria !== null) {
            $unico->ignore($subcategoria->id_subcategoria_ticket);
        }

        $presente = $subcategoria === null ? 'required' : 'sometimes';

        return [
            'id_categoria_ticket' => [$presente, 'integer', Rule::exists(CategoriaTicket::class, 'id_categoria_ticket')],
            'nombre_subcategoria' => [$presente, 'string', 'max:150', $unico],
            'descripcion_subcategoria' => 'nullable|string|max:2000',
            'es_publico' => 'sometimes|boolean',
            'estatus_activo' => 'sometimes|boolean',
        ];
    }
}
