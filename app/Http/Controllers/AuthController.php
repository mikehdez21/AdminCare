<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
        } catch (\Exception $e) {
            // Manejo de errores
            $response['message'] = 'Error al verificar Auth: ' . $e->getMessage();
        }

        return response()->json($response, 200);
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
            $departamento = $user->departamentos ? $user->departamentos->nombre_departamento : 'No definido';


            $response['user'] = $user; // Obtener el usuario autenticado
            $response['rol'] = $roleName; // Agregar el nombre del rol a la respuesta
            $response['departamento'] = $departamento; // Agregar el nombre del rol a la respuesta


            session(['user_id' => $user->id_usuario]); // Almacenar información en la sesión, como el ID del usuario


            $response['message'] = 'Login exitoso!';
            $response['success'] = true;

            // Actualiza el último acceso
            $user->update(['ultimo_acceso' => now()]);
        } else {
            // Si la autenticación falla
            $response['message'] = 'Credenciales inválidas!';
        }

        return response()->json($response, 200);
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
            // Cerrar sesión del usuario (Sessions)
            Auth::logout();

            // Invalidar la sesión y regenerar el token CSRF
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $response = [
                "success" => true,
                "message" => "Sesión cerrada exitosamente.",
            ];
        } catch (\Exception $e) {
            // Manejo de errores
            $response['message'] = 'Error al cerrar sesión: ' . $e->getMessage();
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
}
