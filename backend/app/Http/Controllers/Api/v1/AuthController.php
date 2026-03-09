<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAuth;
use App\Models\UserAccess;
use App\Models\UserPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Controller per la gestione dell'autenticazione.
 */
class AuthController extends Controller
{
    /**
     * PRIMO STEP DEL LOGIN: Ottiene la sfida per l'utente.
     */
    public function controlloUtente($utente)
    {
        // Genera un sale casuale per questa sessione di login
        $sale = hash("sha512", trim(Str::random(200)));

        // Cerca l'utente nel sistema di autenticazione
        $userAuth = UserAuth::where('user', $utente)->first();

        if ($userAuth) {
            // Utente esiste: prepara la sfida per il secondo step
            $userAuth->secretJWT = hash("sha512", trim(Str::random(200)));
            $userAuth->inizioSfida = time();
            $userAuth->save();

            // Il sale viene usato solo per la registrazione, non per il login

            return response()->json([
                'sale' => $sale, // Questo sale è per il client, non per il DB
                'sfida' => $userAuth->secretJWT
            ]);
        } else {
            return response()->json([
                'sale' => $sale
            ]);
        }
    }

    /**
     * Registrazione nuovo utente.
     */
    public function register(Request $request)
    {
        \Log::info('========== TENTATIVO REGISTRAZIONE ==========');
        \Log::info('Dati ricevuti:', $request->all());

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'country_code' => 'required|string|max:3',
            'region' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'zip_code' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            \Log::error('Validazione fallita:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            \Log::info('Validazione passata, creazione utente...');

            // 1. CREAZIONE UTENTE PRINCIPALE
            $user = User::create([
                'name' => $request->name,
                'surname' => $request->surname,
                'email' => $request->email,
                'password' => Hash::make($request->password), // Password con bcrypt per Laravel Auth
                'birth_date' => $request->birth_date,
                'country_code' => $request->country_code,
                'region' => $request->region,
                'city' => $request->city,
                'address' => $request->address,
                'zip_code' => $request->zip_code,
                'role' => 'user',
                'subscription_plan' => 'free',
                'subscription_end_date' => null,
                'credits' => 0.00
            ]);

            \Log::info('Utente creato con ID: ' . $user->id);

            // 2. CREAZIONE RECORD USER_AUTH
            $userAuth = UserAuth::create([
                'user_id' => $user->id,
                'user' => $request->email,
                'obbligoCambio' => false
            ]);

            \Log::info('UserAuth creato con ID: ' . $userAuth->idUserAuth);

            // 3. CREAZIONE PASSWORD CON SALE
            // Il sale DEVE essere salvato nel DB per i futuri login
            $sale = hash("sha512", trim(Str::random(200)));
            $passwordHash = hash("sha512", $request->password . $sale);

            $userPassword = UserPassword::create([
                'user_id' => $user->id,
                'psw' => $passwordHash,
                'sale' => $sale // <-- QUESTO SALE VIENE SALVATO NEL DB
            ]);

            \Log::info('UserPassword creato con ID: ' . $userPassword->idUserPassword);

            // 4. REGISTRAZIONE PRIMO ACCESSO
            $userAccess = UserAccess::create([
                'user_id' => $user->id,
                'autenticato' => true,
                'ip' => $request->ip()
            ]);

            \Log::info('UserAccess creato con ID: ' . $userAccess->id);
            \Log::info('Registrazione completata con successo per email: ' . $request->email);

            // 5. GENERAZIONE TOKEN JWT per login automatico
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'user_id' => $user->id,
                'token' => $token,
                'expires_in' => config('jwt.ttl') * 60
            ], 201);

        } catch (\Exception $e) {
            \Log::error('ECCEZIONE GENERALE: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            \Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * SECONDO STEP DEL LOGIN: Verifica le credenziali e restituisce il token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'sfida' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            // Recupera il record di autenticazione dell'utente
            $userAuth = UserAuth::where('user', $request->email)->first();

            // Verifica che l'utente esista e che la sfida sia corretta
            if (!$userAuth || $userAuth->secretJWT !== $request->sfida) {
                // Registra tentativo fallito
                UserAccess::create([
                    'user_id' => $userAuth ? $userAuth->user_id : null,
                    'autenticato' => false,
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized - Invalid challenge'
                ], 401);
            }

            // Recupera la password corrente
            $currentPassword = UserPassword::where('user_id', $userAuth->user_id)
                ->whereNull('deleted_at')
                ->first();

            if (!$currentPassword) {
                return response()->json(['success' => false, 'error' => 'Password not found'], 401);
            }

            // Verifica la password usando il sale SALVATO NEL DB
            $passwordHash = hash("sha512", $request->password . $currentPassword->sale);

            if ($passwordHash !== $currentPassword->psw) {
                // Registra tentativo fallito
                UserAccess::create([
                    'user_id' => $userAuth->user_id,
                    'autenticato' => false,
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized - Invalid password'
                ], 401);
            }

            // Login riuscito - ottieni l'utente e genera token JWT
            $user = User::find($userAuth->user_id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            // Verifica anche con il sistema standard di Laravel
            if (!Hash::check($request->password, $user->password)) {
                \Log::warning('Password mismatch tra sistema legacy e Laravel per user: ' . $user->email);
                // Non blocco il login se la password legacy è corretta, ma loggo l'incongruenza
            }

            // Genera token JWT
            $token = JWTAuth::fromUser($user);

            // Registra accesso riuscito
            UserAccess::create([
                'user_id' => $user->id,
                'autenticato' => true,
                'ip' => $request->ip()
            ]);

            // Resetta la sfida (non può essere riutilizzata)
            $userAuth->secretJWT = null;
            $userAuth->inizioSfida = null;
            $userAuth->save();

            return response()->json([
                'success' => true,
                'token' => $token,
                'user_id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'role' => $user->role,
                'subscription_plan' => $user->subscription_plan,
                'credits' => $user->credits,
                'expires_in' => config('jwt.ttl') * 60
            ]);

        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout dell'utente.
     * Invalida il token JWT.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            Auth::logout();
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rinnova il token JWT.
     * Utile per mantenere la sessione attiva.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        try {
            $newToken = Auth::refresh();

            return response()->json([
                'success' => true,
                'token' => $newToken,
                'expires_in' => config('jwt.ttl') * 60
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Token refresh failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottiene i dati dell'utente corrente.
     * Utile per verificare lo stato dell'autenticazione.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'email' => $user->email,
                    'role' => $user->role,
                    'subscription_plan' => $user->subscription_plan,
                    'credits' => $user->credits,
                    'birth_date' => $user->birth_date,
                    'country_code' => $user->country_code,
                    'region' => $user->region,
                    'city' => $user->city,
                    'address' => $user->address,
                    'zip_code' => $user->zip_code
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get user data: ' . $e->getMessage()
            ], 500);
        }
    }
}