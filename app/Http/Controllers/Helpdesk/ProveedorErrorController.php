<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use App\Models\Helpdesk\ErrorProveedor;
use App\Models\Helpdesk\ProveedorError;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Catálogo de proveedores de error: Reliv, Vayver, Eden y HSS.
 *
 * `requiere_sistema` es el switch del catálogo: cuando está encendido, capturar el
 * error de ese proveedor pide sistema, no. de ticket externo, módulo y personal SAC.
 * HSS vive aquí también porque `ErroresProveedor.id_soluciona_error` apunta a esta
 * misma lista.
 */
class ProveedorErrorController extends Controller
{
    use ValidatesRequests;

    public function index(Request $request)
    {
        $proveedores = ProveedorError::query()
            ->with('departamento:id_departamento,nombre_departamento')
            ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
            ->orderBy('nombre_proveedor_error')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Proveedores obtenidos correctamente.',
            'data' => $proveedores,
        ], 200);
    }

    public function store(Request $request)
    {
        $proveedor = ProveedorError::create($this->validate($request, $this->reglas()));

        return response()->json([
            'success' => true,
            'message' => 'Proveedor creado exitosamente.',
            'data' => $proveedor,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $proveedor = ProveedorError::findOrFail($id);

        $proveedor->update($this->validate($request, $this->reglas($proveedor)));

        return response()->json([
            'success' => true,
            'message' => 'Proveedor actualizado exitosamente.',
            'data' => $proveedor->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $proveedor = ProveedorError::findOrFail($id);

        // El histórico lo necesita: los errores ya capturados apuntan aquí y la FK es
        // `restrict`, así que borrarlo reventaría como 500.
        if (ErrorProveedor::where('id_proveedor_error', $id)->orWhere('id_soluciona_error', $id)->exists()) {
            throw ValidationException::withMessages([
                'id_proveedor_error' => 'No se puede eliminar el proveedor porque tiene errores asociados. Desactívelo para retirarlo de los formularios sin perder el histórico.',
            ]);
        }

        if ($proveedor->sistemas()->exists()) {
            throw ValidationException::withMessages([
                'id_proveedor_error' => 'No se puede eliminar el proveedor porque tiene sistemas asociados. Elimínelos primero.',
            ]);
        }

        $proveedor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Proveedor eliminado correctamente.',
        ], 200);
    }

    /**
     * @param  ProveedorError|null  $proveedor  El proveedor en edición, si lo hay.
     */
    private function reglas(?ProveedorError $proveedor = null): array
    {
        $unico = Rule::unique(ProveedorError::class, 'nombre_proveedor_error');

        if ($proveedor !== null) {
            $unico->ignore($proveedor->id_proveedor_error, 'id_proveedor_error');
        }

        return [
            'nombre_proveedor_error' => ['required', 'string', 'max:100', $unico],
            'id_departamento' => ['nullable', 'integer', Rule::exists(Departamento::class, 'id_departamento')],
            'requiere_sistema' => ['sometimes', 'boolean'],
            'estatus_activo' => ['sometimes', 'boolean'],
        ];
    }
}
