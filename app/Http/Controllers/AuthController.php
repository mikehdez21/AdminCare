<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Permisos\AlcanceService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(private readonly AlcanceService $alcance)
    {
    }
    //  CHECK
    public function check()
    {
        try {
            // Verificar si el usuario está autenticado
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado.'
                ], 401);
            }

            $user = Auth::user();
            $payload = $this->buildAuthPayload($user);

            return response()->json(array_merge([
                'success' => true,
                'message' => 'Usuario autenticado.',
            ], $payload), 200);
        } catch (\Illuminate\Database\QueryException $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'No fue posible verificar la sesión.'
            ], 500);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor. Contacta a Sistemas.'
            ], 500);
        }
    }

    // PERMISOS DEL USUARIO AUTENTICADO
    public function permissions()
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado.'
                ], 401);
            }

            $user = User::find(Auth::id());

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado.'
                ], 404);
            }

            $scopes = $user->getAllPermissions()
                ->pluck('name')
                ->unique()
                ->values();


            return response()->json([
                'success' => true,
                'message' => 'Permisos obtenidos correctamente.',
                'permissions' => $scopes,
                'alcances' => $this->alcance->alcancesDeRoles($user),
            ], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'No fue posible obtener los permisos.'
            ], 500);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor. Contacta a Sistemas.'
            ], 500);
        }
    }

    // REGISTER
    public function register(Request $request)
    {
        // Validación de los datos
        $validator = Validator::make($request->all(), [
            'nombre_usuario' => 'required|string|max:255|unique:tableUsuarios,nombre_usuario',
            'email_usuario' => 'required|email',
            'password' => 'required|string|min:8|confirmed', // Longitud mínima para la contraseña
            'estatus_activo' => 'required|boolean',
        ]);
        // Si hay errores de validación
        if ($validator->fails()) {
            return response()->json(["Error al validar: " => $validator->errors()], 422); // Cambiado a 422
        }

        try {
            // Preparar datos para la creación del usuario
            $input = $request->all();
            $input["password"] = bcrypt($input['password']); // Cifrado de la contraseña

            // Crear el usuario
            $user = User::create($input);
            $user->assignRole('Admin'); // Asignar rol al usuario con SPATIE - Tabla roles / model_has_roles

            return response()->json([
                "success" => true,
                "message" => "Usuario registrado exitosamente!",
                "user" => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "error" => "No fue posible registrar el usuario."
            ], 500);
        }
    }

    // LOGIN
    public function login(Request $request)
    {
        $response = ["success" => false];

        try {
            $validator = Validator::make($request->all(), [
                'user' => 'required',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json(["error" => $validator->errors()], 422);
            }

            $user = User::where('nombre_usuario', $request->user)->first();

            if (!$user) {
                $response['message'] = 'El usuario no existe!';
                return response()->json($response, 401);
            }

            if (!$user->estatus_activo) {
                $response['message'] = 'Tu cuenta está desactivada. Contacta a Sistemas!';
                return response()->json($response, 403);
            }

            if (Auth::attempt(['nombre_usuario' => $request->user, 'password' => $request->password])) {
                $response = array_merge($response, $this->buildAuthPayload($user));
                session(['user_id' => $user->id_usuario]);
                $response['message'] = 'Login exitoso!';
                $response['success'] = true;

                User::whereKey($user->getKey())->update([
                    'ultimo_acceso' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $response['message'] = 'Credenciales inválidas!';
            }

            return response()->json($response, 200);
        } catch (\Throwable $e) {
            report($e);
            $errorId = $this->logLoginFailure($request, $e);

            return response()->json([
                'success' => false,
                'message' => 'No fue posible iniciar sesión. Intenta más tarde.',
                'error_id' => $errorId,
            ], 500);
        }
    }

    private function logLoginFailure(Request $request, \Throwable $exception): string
    {
        $errorId = (string) Str::uuid();

        Log::error('Authentication login failed', [
            'error_id' => $errorId,
            'exception' => get_class($exception),
            'code' => (string) $exception->getCode(),
            'path' => $request->path(),
            'method' => $request->method(),
        ]);

        return $errorId;
    }

    // LOGOUT
    public function logout(Request $request)
    {
        try {
            // Verificar si el usuario está autenticado
            if (!Auth::guard('web')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado.'
                ], 401);
            }

            // Cerrar sesión del usuario (Sessions)
            Auth::guard('web')->logout();

            // Invalidar la sesión y regenerar el token CSRF
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente.',
            ], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            report($e);
            $errorId = $this->logLogoutFailure($request, $e);

            return response()->json([
                'success' => false,
                'message' => 'No fue posible cerrar la sesión.',
                'error_id' => $errorId,
            ], 500);
        } catch (\Throwable $e) {
            report($e);
            $errorId = $this->logLogoutFailure($request, $e);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor. Contacta a Sistemas.',
                'error_id' => $errorId,
            ], 500);
        }
    }

    private function logLogoutFailure(Request $request, \Throwable $exception): string
    {
        $errorId = (string) Str::uuid();

        Log::error('Authentication logout failed', [
            'error_id' => $errorId,
            'exception' => get_class($exception),
            'code' => (string) $exception->getCode(),
            'path' => $request->path(),
            'method' => $request->method(),
        ]);

        return $errorId;
    }

    // Cerrar sesión por inactividad
    public function logoutInactive(Request $request)
    {
        // Aquí podrías implementar la lógica para detectar inactividad
        // y cerrar sesión si es necesario

        // Cerrar sesión del usuario autenticado
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            "success" => true,
            "message" => "Sesión cerrada por inactividad."
        ]);
    }

    // Construye la carga útil de autenticación de un usuario (usuario, rol, permisos, departamento)
    private function buildAuthPayload(User $user): array
    {
        $roleName = $user->getRoleNames()->first() ?? 'No definido';
        $departamento = $user->departamento?->nombre_departamento ?? 'No asignado';

        $scopes = $user->getAllPermissions()
            ->pluck('name')
            ->unique()
            ->values();

        $user->loadMissing('empleado:id_empleado,nombre_empleado,apellido_paterno,apellido_materno');

        $departamentosAtiende = $this->alcance->departamentosQueAtiende($user)
            ->map(fn ($departamento) => [
                'id_departamento' => (int) $departamento->id_departamento,
                'nombre_departamento' => $departamento->nombre_departamento,
            ])
            ->values()
            ->all();

        $user->setAttribute('departamentos_atiende', $departamentosAtiende);

        return [
            'user' => $user,
            'rol' => $roleName,
            'permissions' => $scopes,
            'alcances' => $this->alcance->alcancesDeRoles($user),
            'departamento' => $departamento,
        ];
    }
}
