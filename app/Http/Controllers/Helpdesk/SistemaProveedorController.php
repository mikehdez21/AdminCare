<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\ErrorProveedor;
use App\Models\Helpdesk\ProveedorError;
use App\Models\Helpdesk\SistemaProveedor;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Sistemas de un proveedor de error. Hoy solo Reliv tiene (SIHO / ECE / Surfing): el
 * desplegable de "Sistema" se llena con los del proveedor elegido.
 */
class SistemaProveedorController extends Controller
{
    use ValidatesRequests;

    public function index(Request $request)
    {
        $sistemas = SistemaProveedor::query()
            // El nombre del proveedor lo pinta la tabla de Configuración.
            ->with('proveedorError:id_proveedor_error,nombre_proveedor_error')
            ->when(
                $request->query('id_proveedor_error'),
                fn ($q, $id) => $q->where('id_proveedor_error', $id)
            )
            ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
            ->orderBy('nombre_sistema_proveedor')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Sistemas obtenidos correctamente.',
            'data' => $sistemas,
        ], 200);
    }

    public function store(Request $request)
    {
        $sistema = SistemaProveedor::create($this->validate($request, $this->reglas()));

        return response()->json([
            'success' => true,
            'message' => 'Sistema creado exitosamente.',
            'data' => $sistema,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $sistema = SistemaProveedor::findOrFail($id);

        $sistema->update($this->validate($request, $this->reglas($sistema)));

        return response()->json([
            'success' => true,
            'message' => 'Sistema actualizado exitosamente.',
            'data' => $sistema->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $sistema = SistemaProveedor::findOrFail($id);

        if (ErrorProveedor::where('id_sistema', $id)->exists()) {
            throw ValidationException::withMessages([
                'id_sistema_proveedor' => 'No se puede eliminar el sistema porque tiene errores asociados. Desactívelo para retirarlo de los formularios sin perder el histórico.',
            ]);
        }

        $sistema->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sistema eliminado correctamente.',
        ], 200);
    }

    /**
     * @param  SistemaProveedor|null  $sistema  El sistema en edición, si lo hay.
     */
    private function reglas(?SistemaProveedor $sistema = null): array
    {
        // El nombre es único dentro del proveedor, que es lo que fija la llave.
        $proveedorId = $sistema?->id_proveedor_error;

        $unico = Rule::unique(SistemaProveedor::class, 'nombre_sistema_proveedor')
            ->where(fn ($q) => $q->where('id_proveedor_error', $proveedorId));

        if ($sistema !== null) {
            $unico->ignore($sistema->id_sistema_proveedor, 'id_sistema_proveedor');
        }

        return [
            'id_proveedor_error' => ['required', 'integer', Rule::exists(ProveedorError::class, 'id_proveedor_error')],
            'nombre_sistema_proveedor' => ['required', 'string', 'max:100', $unico],
            'estatus_activo' => ['sometimes', 'boolean'],
        ];
    }
}
