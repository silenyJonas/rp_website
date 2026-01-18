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
    /**
     * Získání seznamu uživatelů (loginů) s filtry a paginací.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);
        $isDeleted = filter_var($request->input('is_deleted', false), FILTER_VALIDATE_BOOLEAN);

        // user_email zde slouží jako vyhledávací pole pro login
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
            $query->withTrashed();

            // Nezahrnovat uživatele s rolí 'primeadmin'
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('role_name', 'primeadmin');
            });

            // Logika řazení
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

            // Filtrování smazaných
            if ($onlyTrashed || $isDeleted) {
                $query->whereNotNull('user_login.deleted_at');
            } else {
                $query->whereNull('user_login.deleted_at');
            }

            if ($userLoginId) {
                $query->where('user_login.user_login_id', $userLoginId);
            }

            // Vyhledávání v loginu (sloupec user_email)
            if ($userEmail) {
                $query->where('user_login.user_email', 'like', '%' . $userEmail . '%');
            }

            // Filtrování podle dat (vytvoření, aktualizace, poslední přihlášení)
            $dateFields = [
                'created_at' => $createdAt,
                'updated_at' => $updatedAt,
                'last_login_at' => $lastLoginAt
            ];

            foreach ($dateFields as $column => $value) {
                if ($value) {
                    if (is_numeric($value) && strlen($value) <= 2) {
                        $query->where(function ($q) use ($column, $value) {
                            $q->whereRaw("DAY(user_login.$column) = ?", [$value])
                              ->orWhereRaw("MONTH(user_login.$column) = ?", [$value]);
                        });
                    } else {
                        $query->whereDate("user_login.$column", '=', $value);
                    }
                }
            }

            if ($roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('role_name', 'like', '%' . $roleName . '%');
                });
            }

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
            Log::error('Chyba UserLogin index: ' . $e->getMessage());
            return response()->json([
                'message' => 'Něco se pokazilo při načítání uživatelů.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Uložení nového uživatele (loginu).
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
            'user_email' => $validatedData['user_email'], // Zde se ukládá login název
            'user_password_hash' => Hash::make($validatedData['user_password_hash'])
        ]);

        if (isset($validatedData['role_id'])) {
            $user->roles()->attach($validatedData['role_id']);
        }

        $this->logAction($request, 'create', 'UserLogin', "Vytvoření nového uživatele: {$user->user_email}", $user->user_login_id, false);
        $user->load('roles.permissions');

        return response()->json(new UserLoginResource($user), 201);
    }

    /**
     * Zobrazení detailu uživatele.
     */
    public function show(UserLogin $userLogin): JsonResponse
    {
        $userLogin->load('roles.permissions');

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Tento uživatel nemůže být zobrazen.',
                'error_code' => 'FORBIDDEN_USER'
            ], 403);
        }

        return response()->json(new UserLoginResource($userLogin));
    }

    /**
     * Aktualizace uživatele.
     */
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

        // Kontrola úpravy vlastní role
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

        $this->logAction($request, 'update', 'UserLogin', "Aktualizace údajů uživatele: {$userLogin->user_email}", $userLogin->user_login_id);
        $userLogin->load('roles.permissions');

        return response()->json(new UserLoginResource($userLogin));
    }

    /**
     * Změna hesla (Vlastní nebo administrátorská).
     */
    public function changePassword(PasswordChangeRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
        $authenticatedUser = $request->user();

        if (!$authenticatedUser) {
            return response()->json(['message' => 'Uživatel není přihlášen.', 'error_code' => 'UNAUTHENTICATED'], 401);
        }
        
        $targetUserId = $validatedData['target_user_id'] ?? null;

        // Scénář: Administrátor mění heslo jinému uživateli
        if ($targetUserId && (int)$targetUserId !== (int)$authenticatedUser->user_login_id) {
            $targetUser = UserLogin::find($targetUserId);

            if (!$targetUser) {
                return response()->json(['message' => 'Cílový uživatel nenalezen.', 'error_code' => 'USER_NOT_FOUND'], 404);
            }

            $authenticatedUser->load('roles');
            $hasAdminRole = $authenticatedUser->roles->whereIn('role_name', ['admin', 'sysadmin', 'primeadmin'])->count() > 0;

            if (!$hasAdminRole) {
                $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Pokus o změnu hesla bez oprávnění', $targetUser->user_login_id);
                return response()->json(['message' => 'Nemáte dostatečná oprávnění.', 'error_code' => 'INSUFFICIENT_PERMISSIONS'], 403);
            }

            // Ověření hesla provádějícího admina
            if (!Hash::check($validatedData['old_password'], $authenticatedUser->user_password_hash)) {
                $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Nesprávné heslo admina při změně hesla uživateli ID: ' . $targetUser->user_login_id, $targetUser->user_login_id);
                return response()->json(['message' => 'Heslo administrátora je nesprávné.', 'error_code' => 'WRONG_ADMIN_PASSWORD'], 403);
            }

            $targetUser->load('roles');
            if ($targetUser->roles->contains('role_name', 'primeadmin')) {
                return response()->json(['message' => 'Heslo Prime Admina nelze změnit.', 'error_code' => 'CANNOT_CHANGE_PRIMEADMIN_PASSWORD'], 403);
            }

            $targetUser->update(['user_password_hash' => Hash::make($validatedData['new_password'])]);
            $this->logAction($request, 'PasswordChanged', 'UserLogin', 'Heslo změněno administrátorem ' . $authenticatedUser->user_email, $targetUser->user_login_id, false);

        } else { 
            // Scénář: Uživatel mění své vlastní heslo
            $authenticatedUser->load('roles');
            if ($authenticatedUser->roles->contains('role_name', 'primeadmin')) {
                return response()->json(['message' => 'Heslo Prime Admina nelze změnit.', 'error_code' => 'CANNOT_CHANGE_PRIMEADMIN_PASSWORD'], 403);
            }

            if (!Hash::check($validatedData['old_password'], $authenticatedUser->user_password_hash)) {
                $this->logAction($request, 'PasswordChangeFailed', 'UserLogin', 'Nesprávné původní heslo při pokusu o vlastní změnu', $authenticatedUser->user_login_id);
                return response()->json(['message' => 'Původní heslo je nesprávné.', 'error_code' => 'WRONG_OLD_PASSWORD'], 403);
            }

            $authenticatedUser->update(['user_password_hash' => Hash::make($validatedData['new_password'])]);
            $this->logAction($request, 'PasswordChanged', 'UserLogin', 'Uživatel si úspěšně změnil heslo.', $authenticatedUser->user_login_id, false);
        }

        return response()->json(['message' => 'Heslo bylo úspěšně změněno.'], 200);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $userLogin = UserLogin::withTrashed()->with('roles')->findOrFail($id);
        
        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json(['message' => 'Tento uživatel nemůže být smazán.', 'error_code' => 'CANNOT_DELETE_PRIMEADMIN'], 403);
        }

        if ($request->user() && (int)$request->user()->user_login_id === (int)$id) {
            return response()->json(['message' => 'Nelze smazat vlastní přihlášený účet.', 'error_code' => 'CANNOT_DELETE_OWN_ACCOUNT'], 403);
        }

        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);

        if ($forceDelete) {
            $userLogin->forceDelete();
            $this->logAction($request, 'hard_delete', 'UserLogin', "Trvalé smazání loginu: {$userLogin->user_email}", $id);
        } else {
            $userLogin->delete();
            $this->logAction($request, 'soft_delete', 'UserLogin', "Soft smazání loginu: {$userLogin->user_email}", $id);
        }

        return response()->json(null, 204);
    }

    public function restore(int $id): JsonResponse
    {
        $userLogin = UserLogin::withTrashed()->with('roles')->findOrFail($id);

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json(['message' => 'Prime Admin nemůže být obnoven.', 'error_code' => 'CANNOT_RESTORE_PRIMEADMIN'], 403);
        }

        $userLogin->restore();
        $this->logAction(request(), 'restore', 'UserLogin', "Obnova uživatele: {$userLogin->user_email}", $userLogin->user_login_id);

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

            $this->logAction(request(), 'force_delete_all', 'UserLogin', "Vysypání koše uživatelů. Počet smazaných: {$count}");

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Chyba při hromadném trvalém mazání uživatelů: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }

    public function showDetails(UserLogin $userLogin): JsonResponse
    {
        $userLogin->load('roles.permissions');

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json(['message' => 'Detaily Prime Admina nelze zobrazit.', 'error_code' => 'FORBIDDEN_USER_DETAILS'], 403);
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
            
            // Ochrana před logováním hesel
            if(!$create_context_data || $request->has('user_password_hash') || $request->has('new_password')){
                $context_data = "Context data obsahují citlivá data a nejsou zobrazována";
            } else {
                $context_data = json_encode($request->all(), JSON_UNESCAPED_UNICODE);
            }
            
            $userLoginId = $user?->user_login_id;
            $userLoginEmail = $user?->user_email;

            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'UserLogin',
                'affected_entity_id' => $affectedEntityId,
                'user_login_id' => $userLoginId,
                'context_data' => $context_data,
                'user_login_id_plain' => (string)($userLoginId ?? '0'),
                'user_login_email_plain' => $userLoginEmail ?? 'system'
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při logování akce v UserLoginController: ' . $e->getMessage());
        }
    }
}