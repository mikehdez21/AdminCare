<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Models\Helpdesk\ErrorProveedor;
use App\Models\Helpdesk\ModuloSIHO;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Catálogo de módulos de SIHO, para el desplegable de "Módulo" de un error de
 * proveedor. Es plano: los módulos son del sistema, no de cada proveedor.
 */
class ModuloSIHOController extends Controller
{
    use ValidatesRequests;

    public function index(Request $request)
    {
        $modulos = ModuloSIHO::query()
            ->when(! $request->boolean('incluir_inactivos'), fn ($q) => $q->activos())
            ->orderBy('nombre_modulo')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Módulos obtenidos correctamente.',
            'data' => $modulos,
        ], 200);
    }

    public function store(Request $request)
    {
        $modulo = ModuloSIHO::create($this->validate($request, $this->reglas()));

        return response()->json([
            'success' => true,
            'message' => 'Módulo creado exitosamente.',
            'data' => $modulo,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $modulo = ModuloSIHO::findOrFail($id);

        $modulo->update($this->validate($request, $this->reglas($modulo)));

        return response()->json([
            'success' => true,
            'message' => 'Módulo actualizado exitosamente.',
            'data' => $modulo->refresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $modulo = ModuloSIHO::findOrFail($id);

        if (ErrorProveedor::where('id_modulo_sistema', $id)->exists()) {
            throw ValidationException::withMessages([
                'id_modulo_siho' => 'No se puede eliminar el módulo porque tiene errores asociados. Desactívelo para retirarlo de los formularios sin perder el histórico.',
            ]);
        }

        $modulo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Módulo eliminado correctamente.',
        ], 200);
    }

    /**
     * @param  ModuloSIHO|null  $modulo  El módulo en edición, si lo hay.
     */
    private function reglas(?ModuloSIHO $modulo = null): array
    {
        $unico = Rule::unique(ModuloSIHO::class, 'nombre_modulo');

        if ($modulo !== null) {
            $unico->ignore($modulo->id_modulo_siho, 'id_modulo_siho');
        }

        return [
            'nombre_modulo' => ['required', 'string', 'max:150', $unico],
            'estatus_activo' => ['sometimes', 'boolean'],
        ];
    }
}
