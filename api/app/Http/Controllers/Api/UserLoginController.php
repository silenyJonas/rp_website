<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUserLoginRequest;
use App\Http\Requests\UpdateUserLoginRequest;
use App\Http\Resources\UserLoginResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\Role;
use App\Models\BusinessLog;
use App\Http\Requests\PasswordChangeRequest;

class UserLoginController extends Controller
{
    
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $isDeleted = filter_var($request->input('is_deleted', false), FILTER_VALIDATE_BOOLEAN);

        $userEmail = $request->input('user_email');
        $userLoginId = $request->input('user_login_id');
        $createdAt = $request->input('created_at');
        $updatedAt = $request->input('updated_at');
        $lastLoginAt = $request->input('last_login_at');

        $roleName = $request->input('role_name');

        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = UserLogin::query();

        try {
            // Vždy použijeme withTrashed(), aby se zabránilo ambiguitě s 'deleted_at' při JOINu
            $query->withTrashed();

            // Nezahrnovat uživatele s rolí 'primeadmin'
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('role_name', 'primeadmin');
            });

            // Řazení
            if ($sortBy) {
                $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';

                if ($sortBy === 'role_name') {
                    $query->leftJoin('user_roles as ur', 'user_login.user_login_id', '=', 'ur.user_login_id')
                        ->leftJoin('roles as r', 'ur.role_id', '=', 'r.role_id')
                        ->orderBy('r.role_name', $sortDirection);

                    $query->select('user_login.*');
                } else {
                    $query->orderBy($sortBy, $sortDirection);
                }
            } else {
                $query->orderBy('user_login.user_login_id', 'desc');
            }

            if ($onlyTrashed) {
                $query->whereNotNull('user_login.deleted_at');
            } elseif ($isDeleted) {
                $query->whereNotNull('user_login.deleted_at');
            } else {
                $query->whereNull('user_login.deleted_at');
            }

            if ($userLoginId) {
                $query->where('user_login.user_login_id', $userLoginId);
            }

            if ($userEmail) {
                $query->where('user_login.user_email', 'like', '%' . $userEmail . '%');
            }

            if ($createdAt) {
                if (is_numeric($createdAt) && strlen($createdAt) <= 2) {
                    $query->where(function ($q) use ($createdAt) {
                        $q->whereRaw('DAY(user_login.created_at) = ?', [$createdAt])
                            ->orWhereRaw('MONTH(user_login.created_at) = ?', [$createdAt]);
                    });
                } else {
                    $query->whereDate('user_login.created_at', '=', $createdAt);
                }
            }

            if ($updatedAt) {
                if (is_numeric($updatedAt) && strlen($updatedAt) <= 2) {
                    $query->where(function ($q) use ($updatedAt) {
                        $q->whereRaw('DAY(user_login.updated_at) = ?', [$updatedAt])
                            ->orWhereRaw('MONTH(user_login.updated_at) = ?', [$updatedAt]);
                    });
                } else {
                    $query->whereDate('user_login.updated_at', '=', $updatedAt);
                }
            }

            if ($lastLoginAt) {
                if (is_numeric($lastLoginAt) && strlen($lastLoginAt) <= 2) {
                    $query->where(function ($q) use ($lastLoginAt) {
                        $q->whereRaw('DAY(user_login.last_login_at) = ?', [$lastLoginAt])
                            ->orWhereRaw('MONTH(user_login.last_login_at) = ?', [$lastLoginAt]);
                    });
                } else {
                    $query->whereDate('user_login.last_login_at', '=', $lastLoginAt);
                }
            }

            if ($roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('role_name', 'like', '%' . $roleName . '%');
                });
            }

            // ÚPRAVA: Načítáme role i oprávnění pro Resource
            $query->with(['roles.permissions']);

            if ($noPagination) {
                $users = UserLoginResource::collection($query->get());
            } else {
                $users = $query->paginate($perPage, ['*'], 'page', $page);
                $users->getCollection()->transform(function ($user) {
                    return new UserLoginResource($user);
                });
            }

            return response()->json($users);
        } catch (\Exception $e) {
            Log::error('Chyba při zpracování požadavku: ' . $e->getMessage());
            return response()->json([
                'message' => 'Něco se pokazilo. Prosím, zkontrolujte parametry dotazu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Uložení nového uživatele.
     */
    public function store(StoreUserLoginRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        if (isset($validatedData['role_id'])) {
            $role = Role::find($validatedData['role_id']);
            if ($role && $role->role_name === 'primeadmin') {
                return response()->json([
                    'message' => 'Uživatel s rolí Prime Admin nemůže být vytvořen.',
                    'error_code' => 'CANNOT_CREATE_PRIMEADMIN'
                ], 403);
            }
        }

        $user = UserLogin::create([
            'user_email' => $validatedData['user_email'],
            'user_password_hash' => Hash::make($validatedData['user_password_hash'])
        ]);

        if (isset($validatedData['role_id'])) {
            $user->roles()->attach($validatedData['role_id']);
        }

        $this->logAction($request, 'create', 'UserLogin', 'Vytvoření nového uživatele', $user->user_login_id, false);
        
        // ÚPRAVA: Načtení oprávnění i pro nově vytvořeného uživatele
        $user->load('roles.permissions');

        return response()->json(new UserLoginResource($user), 201);
    }

    /**
     * Zobrazení konkrétního uživatele.
     */
    public function show(UserLogin $userLogin): JsonResponse
    {
        // ÚPRAVA: Načtení rolí i s oprávněními
        $userLogin->load('roles.permissions');

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Tento uživatel nemůže být zobrazen.',
                'error_code' => 'FORBIDDEN_USER'
            ], 403);
        }

        return response()->json(new UserLoginResource($userLogin));
    }

    public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse
    {
        $userLogin->load('roles');

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Údaje uživatele Prime Admin nemohou být upraveny.',
                'error_code' => 'CANNOT_EDIT_PRIMEADMIN'
            ], 403);
        }

        $validatedData = $request->validated();
        $authenticatedUser = $request->user();
        $currentRole = $userLogin->roles->first();

        if ($authenticatedUser && (int)$authenticatedUser->user_login_id === (int)$userLogin->user_login_id) {
            if ($request->has('role_id') && $currentRole && (int)$validatedData['role_id'] !== (int)$currentRole->role_id) {
                return response()->json([
                    'message' => 'Nelze upravit vlastní roli.',
                    'error_code' => 'CANNOT_EDIT_OWN_ROLE'
                ], 403);
            }
        }

        $updateData = [];
        if (isset($validatedData['user_password_hash'])) {
            $updateData['user_password_hash'] = Hash::make($validatedData['user_password_hash']);
        }
        if (isset($validatedData['user_email'])) {
            $updateData['user_email'] = $validatedData['user_email'];
        }

        $userLogin->update($updateData);

        if (isset($validatedData['role_id'])) {
            $userLogin->roles()->sync([$validatedData['role_id']]);
        }

        $this->logAction($request, 'update', 'UserLogin', 'Aktualizace údajů uživatele', $userLogin->user_login_id);

        // ÚPRAVA: Načtení rolí i s oprávněními pro odpověď
        $userLogin->load('roles.permissions');
        return response()->json(new UserLoginResource($userLogin));
    }


public function changePassword(PasswordChangeRequest $request): JsonResponse
{
    // Získáme validovaná data z požadavku
    $validatedData = $request->validated();

    // Vytvoříme kopii dat pro logování a odstraníme z ní citlivé údaje
    $loggableData = $validatedData;
    unset($loggableData['old_password']);
    unset($loggableData['new_password']);
    unset($loggableData['new_password_confirmation']);
    
    Log::info('Požadavek na změnu hesla - ověřená data (sanitizovaná):', $loggableData);

    $authenticatedUser = $request->user();

    if (!$authenticatedUser) {
        Log::error('Chyba: Uživatel není přihlášen.');
        return response()->json(['message' => 'Uživatel není přihlášen.', 'error_code' => 'UNAUTHENTICATED'], 401);
    }
    
    $targetUserId = $validatedData['target_user_id'] ?? null;
    Log::info('target_user_id: '. $targetUserId);

    // Scénář: Administrátor mění heslo jinému uživateli
    if ($targetUserId && (int)$targetUserId !== (int)$authenticatedUser->user_login_id) {
        Log::info('Scénář: Administrátor mění heslo jinému uživateli.');
        
        $targetUser = UserLogin::find($targetUserId);

        if (!$targetUser) {
            Log::error("Chyba: Cílový uživatel s ID {$targetUserId} nenalezen.");
            return response()->json(['message' => 'Cílový uživatel nenalezen.', 'error_code' => 'USER_NOT_FOUND'], 404);
        }
        
        Log::info("Nalezen aktuální uživatel (admin) ID: {$authenticatedUser->user_login_id} a cílový uživatel ID: {$targetUser->user_login_id}.");

        // Zkontroluje, zda má aktuální uživatel práva admina
        $authenticatedUser->load('roles');
        $hasAdminRole = $authenticatedUser->roles->contains('role_name', 'admin') || 
                        $authenticatedUser->roles->contains('role_name', 'sysadmin') ||
                        $authenticatedUser->roles->contains('role_name', 'primeadmin');
        Log::info("Kontrola oprávnění pro admina ID {$authenticatedUser->user_login_id}. Má oprávnění: " . ($hasAdminRole ? 'Ano' : 'Ne'));
        if (!$hasAdminRole) {
            $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Pokus o změnu hesla uživateli bez dostatečných oprávnění', $targetUser->user_login_id);
            return response()->json(['message' => 'Nemáte dostatečná oprávnění.', 'error_code' => 'INSUFFICIENT_PERMISSIONS'], 403);
        }

        // Kontrola hesla admina (přihlášeného uživatele)
        $isOldPasswordCorrect = Hash::check($validatedData['old_password'], $authenticatedUser->user_password_hash);
        Log::info("Výsledek ověření hesla admina (ID: {$authenticatedUser->user_login_id}): " . ($isOldPasswordCorrect ? 'Úspěšné' : 'Neúspěšné'));
        if (!$isOldPasswordCorrect) {
            $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Nesprávné heslo administrátora při pokusu o změnu hesla uživateli ID: ' . $targetUser->user_login_id, $targetUser->user_login_id);
            return response()->json([
                'message' => 'Heslo administrátora je nesprávné.',
                'error_code' => 'WRONG_ADMIN_PASSWORD'
            ], 403);
        }

        // Kontrola, jestli cílový uživatel není primeadmin
        $targetUser->load('roles');
        $isTargetPrimeAdmin = $targetUser->roles->contains('role_name', 'primeadmin');
        Log::info("Kontrola role cílového uživatele ID {$targetUser->user_login_id}. Je primeadmin: " . ($isTargetPrimeAdmin ? 'Ano' : 'Ne'));
        if ($isTargetPrimeAdmin) {
            $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Pokus o změnu hesla primeadmina', $targetUser->user_login_id);
            return response()->json([
                'message' => 'Heslo uživatele Prime Admin nelze změnit.',
                'error_code' => 'CANNOT_CHANGE_PRIMEADMIN_PASSWORD'
            ], 403);
        }

        // Změna hesla cílovému uživateli
        $newPasswordHash = Hash::make($validatedData['new_password']);
        $updateResult = $targetUser->update(['user_password_hash' => $newPasswordHash]);
        Log::info('Výsledek DB operace update: ' . ($updateResult ? 'Úspěšné' : 'Neúspěšné'));
        
        $this->logAction($request, 'PasswordChanged', 'UserLogin', 'Heslo bylo úspěšně změněno administrátorem ' . $authenticatedUser->user_login_id, $targetUser->user_login_id, false);

    } else { // Scénář: Uživatel mění své vlastní heslo
        Log::info('Scénář: Uživatel mění své vlastní heslo.');
        
        // Kontrola, jestli uživatel není primeadmin
        $authenticatedUser->load('roles');
        $isAuthPrimeAdmin = $authenticatedUser->roles->contains('role_name', 'primeadmin');
        Log::info("Kontrola role přihlášeného uživatele ID {$authenticatedUser->user_login_id}. Je primeadmin: " . ($isAuthPrimeAdmin ? 'Ano' : 'Ne'));
        if ($isAuthPrimeAdmin) {
               $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Pokus o změnu vlastního hesla primeadmina', $authenticatedUser->user_login_id);
            return response()->json([
                'message' => 'Heslo uživatele Prime Admin nelze změnit.',
                'error_code' => 'CANNOT_CHANGE_PRIMEADMIN_PASSWORD'
            ], 403);
        }

        // Ověření starého hesla
        $isOldPasswordCorrect = Hash::check($validatedData['old_password'], $authenticatedUser->user_password_hash);
        Log::info("Výsledek ověření původního hesla (ID: {$authenticatedUser->user_login_id}): " . ($isOldPasswordCorrect ? 'Úspěšné' : 'Neúspěšné'));
        if (!$isOldPasswordCorrect) {
            $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Nesprávné původní heslo při pokusu o změnu vlastního hesla', $authenticatedUser->user_login_id);
            return response()->json([
                'message' => 'Původní heslo je nesprávné.',
                'error_code' => 'WRONG_OLD_PASSWORD'
            ], 403);
        }

        // Změna hesla
        $newPasswordHash = Hash::make($validatedData['new_password']);
        $updateResult = $authenticatedUser->update(['user_password_hash' => $newPasswordHash]);
        Log::info('Výsledek DB operace update: ' . ($updateResult ? 'Úspěšné' : 'Neúspěšné'));

        $this->logAction($request, 'PasswordChanged', 'UserLogin', 'Heslo bylo úspěšně změněno.', $authenticatedUser->user_login_id, false);
    }

    return response()->json(['message' => 'Heslo bylo úspěšně změněno.'], 200);
}

    public function destroy(Request $request, $id): JsonResponse
    {
        $userLogin = UserLogin::withTrashed()->with('roles')->findOrFail($id);
        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Tento uživatel nemůže být smazán.',
                'error_code' => 'CANNOT_DELETE_PRIMEADMIN'
            ], 403);
        }

        $authenticatedUser = $request->user();
        if ($authenticatedUser && (int)$authenticatedUser->user_login_id === (int)$id) {
            return response()->json([
                'message' => 'Nelze smazat účet, za který jste právě přihlášený/á.',
                'error_code' => 'CANNOT_DELETE_OWN_ACCOUNT'
            ], 403);
        }

        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid ID format.'], 404);
        }

        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);

        if ($forceDelete) {
            $userLogin->forceDelete();
            $this->logAction($request, 'hard_delete', 'UserLogin', 'Trvalé smazání uživatele', $id);
        } else {
            $userLogin->delete();
            $this->logAction($request, 'soft_delete', 'UserLogin', 'Soft smazání uživatele', $id);
        }

        return response()->json(null, 204);
    }

    public function restore(int $id): JsonResponse
    {
        $userLogin = UserLogin::withTrashed()->with('roles')->findOrFail($id);

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Uživatel s rolí Prime Admin nemůže být obnoven.',
                'error_code' => 'CANNOT_RESTORE_PRIMEADMIN'
            ], 403);
        }

        $userLogin->restore();
        $this->logAction(request(), 'restore', 'UserLogin', 'Obnova smazaného uživatele', $userLogin->user_login_id);

        return response()->json(new UserLoginResource($userLogin));
    }

    public function forceDeleteAllTrashed(): JsonResponse
    {
        try {
            $query = UserLogin::onlyTrashed()->whereDoesntHave('roles', function ($q) {
                $q->where('role_name', 'primeadmin');
            });

            $count = $query->count();
            $query->forceDelete();

            $this->logAction(request(), 'force_delete_all', 'UserLogin', "Trvalé smazání všech smazaných uživatelů. Počet: {$count}");

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }

    public function showDetails(UserLogin $userLogin): JsonResponse
    {
        // ÚPRAVA: Načtení rolí i s oprávněními
        $userLogin->load('roles.permissions');

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Detaily tohoto uživatele nelze zobrazit.',
                'error_code' => 'FORBIDDEN_USER_DETAILS'
            ], 403);
        }

        $selectedData = [
            'id' => $userLogin->user_login_id,
            'user_email' => $userLogin->user_email,
            'last_login_at' => $userLogin->last_login_at,
            'created_at' => $userLogin->created_at,
            'updated_at' => $userLogin->updated_at,
            'deleted_at' => $userLogin->deleted_at,
            'roles' => $userLogin->roles->map(function ($role) {
                return [
                    'role_id' => $role->role_id,
                    'role_name' => $role->role_name,
                    'description' => $role->description,
                ];
            }),
            // ÚPRAVA: Přidání oprávnění i do detailu
            'user_permissions' => $userLogin->roles->flatMap(function ($role) {
                return $role->permissions->pluck('permission_key');
            })->unique()->values(),
        ];

        return response()->json($selectedData);
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null, $create_context_data = true)
    {
        try {
            $user = $request->user();
            if($create_context_data){
                $context_data = json_encode($request->all());
            }
            else{
                $context_data = "Context data obsahují citlivá data a nejsou zobrazována";     
            }
            
            if($request->password_hash){
                $context_data = "Context data obsahují citlivá data a nejsou zobrazována";
            }
            
            $userLoginId = $request->user()?->user_login_id;
            $userLoginEmail = $request->user()?->user_email;
            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'UserLogin',
                'affected_entity_id' => $affectedEntityId,
                'user_login_id' => $userLoginId,
                'context_data' => $context_data,
                'user_login_id_plain' => (string)$userLoginId,
                'user_login_email_plain' => $userLoginEmail
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při logování akce v UserLoginController: ' . $e->getMessage());
        }
    }
}