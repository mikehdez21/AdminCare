<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use App\Models\Helpdesk\CategoriaTicket;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Nivel 1 de la jerarquía de clasificación. El solicitante elige un título y el
 * servidor resuelve categoría y subcategoría a partir de él; estas operaciones
 * las usa la pantalla de Configuración.
 */
class CategoriaController extends Controller
{
    use ValidatesRequests;

    public function index(Request $request)
    {
        $categorias = CategoriaTicket::with('departamentoDefault:id_departamento,nombre_departamento')
            // Sin el flag solo se devuelven las activas, que es lo que necesitan los
            // formularios de alta. La pantalla de Configuración pide
            // `incluir_inactivos=1` para ver también las dadas de baja y poder
            // reactivarlas sin recrearlas.
            ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
            ->orderBy('nombre_categoria')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Categorías obtenidas correctamente.',
            'data' => $categorias,
        ], 200);
    }

    public function show($id)
    {
        $categoria = CategoriaTicket::activos()
            ->with([
                'departamentoDefault:id_departamento,nombre_departamento',
                'subcategorias' => fn ($q) => $q->activos()->orderBy('nombre_subcategoria'),
            ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Categoría obtenida correctamente.',
            'data' => $categoria,
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $this->validate($request, $this->reglas());

        $categoria = CategoriaTicket::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada exitosamente.',
            'data' => $categoria,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $categoria = CategoriaTicket::findOrFail($id);

        $data = $this->validate($request, $this->reglas($categoria));
        $categoria->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente.',
            'data' => $categoria->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $categoria = CategoriaTicket::findOrFail($id);

        // Sin cascade a propósito: los tickets guardan la categoría para poder
        // reconstruir el histórico. Se informa qué dependencia bloquea el borrado
        // en lugar de dejar que reviente la llave foránea.
        if ($categoria->tickets()->exists()) {
            throw ValidationException::withMessages([
                'id_categoria_ticket' => 'No se puede eliminar la categoría porque tiene tickets asociados.',
            ]);
        }

        if ($categoria->subcategorias()->exists()) {
            throw ValidationException::withMessages([
                'id_categoria_ticket' => 'No se puede eliminar la categoría porque tiene subcategorías asociadas. Elimine o mueva sus subcategorías primero.',
            ]);
        }

        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada correctamente.',
        ], 200);
    }

    /**
     * @param  CategoriaTicket|null  $categoria  La categoría en edición, si existe.
     */
    private function reglas(?CategoriaTicket $categoria = null): array
    {
        $unico = Rule::unique(CategoriaTicket::class, 'nombre_categoria');

        if ($categoria !== null) {
            $unico->ignore($categoria->id_categoria_ticket);
        }

        return [
            'nombre_categoria' => [$categoria === null ? 'required' : 'sometimes', 'string', 'max:150', $unico],
            'descripcion_categoria' => 'nullable|string|max:2000',
            // Departamento que atenderá los tickets de esta categoría. Acepta
            // cualquiera: la restricción de que dé soporte es de negocio y se
            // valida al asignar, no al clasificar.
            'id_departamento_default' => ['nullable', 'integer', Rule::exists(Departamento::class, 'id_departamento')],
            'estatus_activo' => 'sometimes|boolean',
        ];
    }
}
