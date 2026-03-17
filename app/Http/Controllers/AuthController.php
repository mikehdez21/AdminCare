<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
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

            return response()->json([
                'success' => true,
                'message' => 'Usuario autenticado.',
                'user' => $user
            ], 200);
        } catch (QueryException $e) {
            // Manejar errores específicos de base de datos
            if (strpos($e->getMessage(), 'sessions') !== false || 
                strpos($e->getMessage(), 'no existe la relación') !== false) {
                return $this->buildDbErrorResponse($e, 'Error en base de datos. Contacta a Sistemas.');
            }
            return $this->buildDbErrorResponse($e, 'Error de conexión a la base de datos.');
            
        } catch (\Exception $e) {
            // Manejo de errores generales
            return $this->buildInternalErrorResponse($e);
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
                "error" => "Error al registrar usuario",
                "details" => $e->getMessage()
            ], 500);
        }
    }

    // LOGIN
    public function login(Request $request)
    {
        // Respuesta inicial
        $response = ["success" => false];

        // Try-catch que envuelve TODO el método para capturar errores de sesiones
        try {
            // Intentar validaciones y lógica principal
            try {
                // Validación de los datos
                $validator = Validator::make($request->all(), [
                    'email_usuario' => 'required',
                    'password' => 'required',
                ]);

                // Si hay errores de validación
                if ($validator->fails()) {
                    return response()->json(["error" => $validator->errors()], 422);
                }

                // Obtener el usuario por correo
                $user = User::where('email_usuario', $request->email_usuario)->first();

                // Verificar si el usuario existe
                if (!$user) {
                    $response['message'] = 'El usuario no existe!';
                    return response()->json($response, 401);
                }

                // Verificar si el usuario está activo
                if (!$user->estatus_activo) {
                    $response['message'] = 'Tu cuenta está desactivada. Contacta a Sistemas!';
                    return response()->json($response, 403);
                }

                // Intentar autenticar al usuario
                if (Auth::attempt(['email_usuario' => $request->email_usuario, 'password' => $request->password])) {

                    $roleName = $user->getRoleNames()->first() ?? 'No definido';
                    $departamento = $user->departamento ? $user->departamento->nombre_departamento : 'No definido';

                    // Generar token de Sanctum para evitar problemas de cookies cross-domain
                    $token = $user->createToken('auth_token')->plainTextToken;

                    $response['user'] = $user; // Obtener el usuario autenticado
                    $response['rol'] = $roleName; // Agregar el nombre del rol a la respuesta
                    $response['departamento'] = $departamento; // Agregar el nombre del rol a la respuesta
                    $response['token'] = $token; // Devolver el token al frontend

                    $response['message'] = 'Login exitoso!';
                    $response['success'] = true;

                    // Actualiza el último acceso
                    $user->update(['ultimo_acceso' => now()]);
                } else {
                    // Si la autenticación falla
                    $response['message'] = 'Credenciales inválidas!';
                }

            } catch (QueryException $e) {
                // Manejar errores específicos de base de datos
                $errorCode = $e->getCode();
                $errorMessage = $e->getMessage();
                
                // Verificar si es un error de tabla no encontrada (PostgreSQL: 42P01, MySQL: 1146)
                if ($errorCode == '42P01' || $errorCode == '1146' || strpos($errorMessage, 'no existe la relación') !== false || strpos($errorMessage, "doesn't exist") !== false) {
                    return $this->buildDbErrorResponse($e, 'Error en base de datos. Contacta a Sistemas.');
                } else {
                    return $this->buildDbErrorResponse($e, 'Error de conexión a la base de datos. Intenta más tarde.');
                }
                
            } catch (\Exception $e) {
                // Manejar cualquier otro tipo de error
                return $this->buildInternalErrorResponse($e);
            }

            return response()->json($response, 200);

        } catch (QueryException $e) {
            // Catch global para errores de sesiones que ocurren antes del código principal
            $errorMessage = $e->getMessage();
            
            if (strpos($errorMessage, 'sessions') !== false || 
                strpos($errorMessage, 'no existe la relación') !== false ||
                $e->getCode() == '42P01') {
                return $this->buildDbErrorResponse($e, 'Error en base de datos. Contacta a Sistemas.');
            } else {
                return $this->buildDbErrorResponse($e, 'Error de conexión a la base de datos. Intenta más tarde.');
            }
            
        } catch (\Exception $e) {
            // Catch global para cualquier otro error
            return $this->buildInternalErrorResponse($e);
        }
    }

    // LOGOUT
    public function logout(Request $request)
    {
        // Respuesta inicial
        $response = ["success" => false];

        try {
            // Verificar si el usuario está autenticado
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado.'
                ], 401);
            }
            
            // Revocar token de Sanctum actual
            $user = Auth::user();
            $user->tokens()->where('name', 'auth_token')->delete();

            $response = [
                "success" => true,
                "message" => "Sesión cerrada exitosamente.",
            ];
        } catch (QueryException $e) {
            // Manejar errores específicos de base de datos
            if (strpos($e->getMessage(), 'sessions') !== false || 
                strpos($e->getMessage(), 'no existe la relación') !== false) {
                return $this->buildDbErrorResponse($e, 'Error en base de datos. Contacta a Sistemas.');
            } else {
                return $this->buildDbErrorResponse($e, 'Error de conexión a la base de datos.');
            }
            
        } catch (\Exception $e) {
            // Manejo de errores generales
            return $this->buildInternalErrorResponse($e);
        }

        return response()->json($response, 200);
    }

    // Cerrar sesión por inactividad
    public function logoutInactive(Request $request)
    {
        // Aquí podrías implementar la lógica para detectar inactividad
        // y cerrar sesión si es necesario

        // Cerrar sesión del usuario autenticado
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            "success" => true,
            "message" => "Sesión cerrada por inactividad."
        ]);
    }

    private function buildDbErrorResponse(QueryException $e, string $message)
    {
        $errorId = (string) Str::uuid();
        $isDebug = (bool) config('app.debug');

        Log::error('AuthController DB error', [
            'error_id' => $errorId,
            'code' => $e->getCode(),
            'message' => $e->getMessage(),
        ]);

        $payload = [
            'success' => false,
            'message' => $message . ' Ref: ' . $errorId,
            'error_id' => $errorId,
            'error_code' => (string) $e->getCode(),
        ];

        if ($isDebug) {
            $payload['details'] = $e->getMessage();
        }

        return response()->json($payload, 500);
    }

    private function buildInternalErrorResponse(\Throwable $e)
    {
        $errorId = (string) Str::uuid();
        $isDebug = (bool) config('app.debug');

        Log::error('AuthController internal error', [
            'error_id' => $errorId,
            'message' => $e->getMessage(),
        ]);

        $payload = [
            'success' => false,
            'message' => 'Error interno del servidor. Contacta a Sistemas. Ref: ' . $errorId,
            'error_id' => $errorId,
        ];

        if ($isDebug) {
            $payload['details'] = $e->getMessage();
        }

        return response()->json($payload, 500);
    }
}
