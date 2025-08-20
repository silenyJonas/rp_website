<?php

// namespace App\Http\Controllers\Api;
// use App\Http\Controllers\Controller;
// use App\Models\UserLogin;
// use Illuminate\Http\Request;
// use App\Http\Requests\StoreUserLoginRequest;
// use App\Http\Requests\UpdateUserLoginRequest;
// use App\Http\Resources\UserLoginResource;
// use Illuminate\Http\JsonResponse;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Log;
// use App\Models\Role;
// use App\Models\BusinessLog; // Důležitý import pro logování
// use App\Http\Requests\PasswordChangeRequest; // NOVÝ IMPORT

// class UserLoginController extends Controller
// {
//     /**
//      * Získání seznamu uživatelů s podporou filtrování, řazení a paginace.
//      *
//      * @param Request $request
//      * @return JsonResponse
//      */
//     public function index(Request $request): JsonResponse
//     {
//         $perPage = $request->input('per_page', 15);
//         $page = $request->input('page', 1);
//         $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
//         $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);
//         $isDeleted = filter_var($request->input('is_deleted', false), FILTER_VALIDATE_BOOLEAN);
        
//         $userEmail = $request->input('user_email');
//         $userLoginId = $request->input('user_login_id');
//         $createdAt = $request->input('created_at');
//         $updatedAt = $request->input('updated_at');
//         $lastLoginAt = $request->input('last_login_at');
        
//         // Změněno na role_name
//         $roleName = $request->input('role_name');
        

//         $sortBy = $request->input('sort_by');
//         $sortDirection = $request->input('sort_direction', 'asc');

//         $query = UserLogin::query();
        
//         try {
//             // Vždy použijeme withTrashed(), aby se zabránilo ambiguitě s 'deleted_at' při JOINu
//             $query->withTrashed();

//             // Sjednocená logika pro řazení
//             if ($sortBy) {
//                 $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
                
//                 // Změněno na role_name
//                 if ($sortBy === 'role_name') {
//                     // Přidání aliasů a JOINů
//                     $query->leftJoin('user_roles as ur', 'user_login.user_login_id', '=', 'ur.user_login_id')
//                         ->leftJoin('roles as r', 'ur.role_id', '=', 'r.role_id')
//                         ->orderBy('r.role_name', $sortDirection);
                        
//                     // Zajištění, že se vybírají jen sloupce z user_login, aby se předešlo dalším konfliktům
//                     $query->select('user_login.*');
//                 } else {
//                     $query->orderBy($sortBy, $sortDirection);
//                 }
//             } else {
//                 // ZMĚNA: Řazení podle user_login_id sestupně
//                 $query->orderBy('user_login.user_login_id', 'desc');
//             }

//             // Aplikujeme filtry po joinu s explicitním názvem tabulky, abychom předešli ambiguitě
//             if ($onlyTrashed) {
//                 $query->whereNotNull('user_login.deleted_at');
//             } elseif ($isDeleted) {
//                 $query->whereNotNull('user_login.deleted_at');
//             } else {
//                 $query->whereNull('user_login.deleted_at');
//             }

//             // Apply other filters conditionally based on if they have a value
//             if ($userLoginId) {
//                 $query->where('user_login.user_login_id', $userLoginId);
//             }

//             if ($userEmail) {
//                 $query->where('user_login.user_email', 'like', '%' . $userEmail . '%');
//             }
            
//             if ($createdAt) {
//                 if (is_numeric($createdAt) && strlen($createdAt) <= 2) {
//                     $query->where(function($q) use ($createdAt) {
//                         $q->whereRaw('DAY(user_login.created_at) = ?', [$createdAt])
//                             ->orWhereRaw('MONTH(user_login.created_at) = ?', [$createdAt]);
//                     });
//                 } else {
//                     $query->whereDate('user_login.created_at', '=', $createdAt);
//                 }
//             }

//             if ($updatedAt) {
//                 if (is_numeric($updatedAt) && strlen($updatedAt) <= 2) {
//                     $query->where(function($q) use ($updatedAt) {
//                         $q->whereRaw('DAY(user_login.updated_at) = ?', [$updatedAt])
//                             ->orWhereRaw('MONTH(user_login.updated_at) = ?', [$updatedAt]);
//                     });
//                 } else {
//                     $query->whereDate('user_login.updated_at', '=', $updatedAt);
//                 }
//             }

//             if ($lastLoginAt) {
//                 if (is_numeric($lastLoginAt) && strlen($lastLoginAt) <= 2) {
//                     $query->where(function($q) use ($lastLoginAt) {
//                         $q->whereRaw('DAY(user_login.last_login_at) = ?', [$lastLoginAt])
//                             ->orWhereRaw('MONTH(user_login.last_login_at) = ?', [$lastLoginAt]);
//                     });
//                 } else {
//                     $query->whereDate('user_login.last_login_at', '=', $lastLoginAt);
//                 }
//             }

//             // Změněno na role_name
//             if ($roleName) {
//                 $query->whereHas('roles', function ($q) use ($roleName) {
//                     $q->where('role_name', 'like', '%' . $roleName . '%');
//                 });
//             }

//             // Vždy načíst role pro každý výsledek
//             $query->with('roles');

//             if ($noPagination) {
//                 $users = UserLoginResource::collection($query->get());
//             } else {
//                 $users = $query->paginate($perPage, ['*'], 'page', $page);
//                 $users->getCollection()->transform(function ($user) {
//                     return new UserLoginResource($user);
//                 });
//             }
            
//             return response()->json($users);

//         } catch (\Exception $e) {
//             Log::error('Chyba při zpracování požadavku: ' . $e->getMessage());
//             return response()->json(['message' => 'Něco se pokazilo. Prosím, zkontrolujte parametry dotazu.', 'error' => $e->getMessage()], 500);
//         }
//     }

//     /**
//      * Uložení nového uživatele.
//      *
//      * @param StoreUserLoginRequest $request
//      * @return JsonResponse
//      */
//     public function store(StoreUserLoginRequest $request): JsonResponse
//     {
//         $validatedData = $request->validated();
//         $user = UserLogin::create([
//             'user_email' => $validatedData['user_email'],
//             'user_password_hash' => Hash::make($validatedData['user_password_hash'])
//         ]);
//         if ($request->has('role_id')) {
//             $user->roles()->attach($validatedData['role_id']);
//         }
        
//         // Logování vytvoření uživatele
//         $this->logAction($request, 'create', 'UserLogin', 'Vytvoření nového uživatele', $user->user_login_id);
        
//         return response()->json(new UserLoginResource($user), 201);
//     }

//     /**
//      * Zobrazení konkrétního uživatele.
//      *
//      * @param UserLogin $userLogin
//      * @return JsonResponse
//      */
//     public function show(UserLogin $userLogin): JsonResponse
//     {
//         $userLogin->load('roles');
//         return response()->json(new UserLoginResource($userLogin));
//     }
    
//     public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse
//     {
//         $validatedData = $request->validated();
//         $authenticatedUser = $request->user();
        
//         // Získání aktuální role uživatele.
//         $currentRole = $userLogin->roles->first();

//         // Kontrola, zda se přihlášený uživatel pokouší upravit svou vlastní roli.
//         if ($authenticatedUser && (int)$authenticatedUser->user_login_id === (int)$userLogin->user_login_id) {
//             // Kontrola, zda se v požadavku nachází 'role_id' a zda se liší od stávající role.
//             if ($request->has('role_id') && $currentRole && (int)$validatedData['role_id'] !== (int)$currentRole->role_id) {
//                 return response()->json([
//                     'message' => 'Nelze upravit vlastní roli.',
//                     'error_code' => 'CANNOT_EDIT_OWN_ROLE'
//                 ], 403);
//             }
//         }

//         $updateData = [];
//         if (isset($validatedData['user_password_hash'])) {
//             $updateData['user_password_hash'] = Hash::make($validatedData['user_password_hash']);
//         }
//         if (isset($validatedData['user_email'])) {
//             $updateData['user_email'] = $validatedData['user_email'];
//         }

//         // Aktualizace uživatele pouze s povolenými daty.
//         $userLogin->update($updateData);

//         // Synchronizace rolí pouze tehdy, pokud je v datech 'role_id'.
//         // Předchozí kontrola již zabránila neoprávněným změnám.
//         if (isset($validatedData['role_id'])) {
//             $userLogin->roles()->sync([$validatedData['role_id']]);
//         }
        
//         // Logování aktualizace uživatele
//         $this->logAction($request, 'update', 'UserLogin', 'Aktualizace údajů uživatele', $userLogin->user_login_id);
        
//         $userLogin->load('roles');
//         return response()->json(new UserLoginResource($userLogin));
//     }

//     /**
//      * Změna hesla pro konkrétního uživatele.
//      *
//      * @param PasswordChangeRequest $request
//      * @param UserLogin $userLogin
//      * @return JsonResponse
//      */
//     public function changePassword(PasswordChangeRequest $request, UserLogin $userLogin): JsonResponse
//     {
//         $validatedData = $request->validated();
        
//         // Hashování nového hesla pro účely logování před kontrolou
//         $newPasswordHash = Hash::make($validatedData['new_password']);

//         // Kontrola, zda se původní heslo shoduje s tím v databázi.
//         // Hash::check porovnává nehashované heslo s hashovaným.
//         if (!Hash::check($validatedData['old_password'], $userLogin->user_password_hash)) {
//             // Logování neúspěšného pokusu včetně hashe nového hesla
//             Log::info('Neúspěšná změna hesla. Uživatel ID: ' . $userLogin->user_login_id . '. Důvod: Špatné původní heslo. Původní hash: ' . $userLogin->user_password_hash . ' | Nový hash (neuložen): ' . $newPasswordHash);

//             return response()->json([
//                 'message' => 'Původní heslo je nesprávné.',
//                 'error_code' => 'WRONG_OLD_PASSWORD'
//             ], 403);
//         }

//         // Aktualizace hesla.
//         $userLogin->update([
//             'user_password_hash' => $newPasswordHash,
//         ]);

//         // Logování úspěšné změny hesla.
//         Log::info('Heslo bylo úspěšně změněno pro uživatele ID: ' . $userLogin->user_login_id . '. Původní hash: ' . $userLogin->user_password_hash . ' | Nový hash: ' . $newPasswordHash);

//         return response()->json(['message' => 'Heslo bylo úspěšně změněno.'], 200);
//     }

//     public function destroy(Request $request, $id): JsonResponse
//     {
//         // Kontrola, zda se přihlášený uživatel pokouší smazat svůj vlastní účet
//         $authenticatedUser = $request->user();
//         if ($authenticatedUser && (int)$authenticatedUser->user_login_id === (int)$id) {
//             return response()->json([
//                 'message' => 'Nelze smazat účet, za který jste právě přihlášený/á.',
//                 'error_code' => 'CANNOT_DELETE_OWN_ACCOUNT' // Vlastní chybový kód pro frontend
//             ], 403);
//         }

//         if (!is_numeric($id)) {
//             return response()->json(['message' => 'Invalid ID format.'], 404);
//         }
//         $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
//         $userLogin = UserLogin::withTrashed()->findOrFail($id);
        
//         if ($forceDelete) {
//             $userLogin->forceDelete();
//             // Logování trvalého smazání
//             $this->logAction($request, 'hard_delete', 'UserLogin', 'Trvalé smazání uživatele', $id);
//         } else {
//             $userLogin->delete();
//             // Logování soft smazání
//             $this->logAction($request, 'soft_delete', 'UserLogin', 'Soft smazání uživatele', $id);
//         }
        
//         return response()->json(null, 204);
//     }
    
//     /**
//      * Obnova smazaného uživatele.
//      *
//      * @param int $id
//      * @return JsonResponse
//      */
//     public function restore(int $id): JsonResponse
//     {
//         $userLogin = UserLogin::withTrashed()->findOrFail($id);
//         $userLogin->restore();
        
//         // Logování obnovy uživatele
//         $this->logAction(request(), 'restore', 'UserLogin', 'Obnova smazaného uživatele', $userLogin->user_login_id);
        
//         return response()->json(new UserLoginResource($userLogin));
//     }
    
//     /**
//      * Trvalé smazání všech smazaných uživatelů.
//      *
//      * @return JsonResponse
//      */
//     public function forceDeleteAllTrashed(): JsonResponse
//     {
//         try {
//             $count = UserLogin::onlyTrashed()->count();
//             UserLogin::onlyTrashed()->forceDelete();
            
//             // Logování hromadného smazání
//             $this->logAction(request(), 'force_delete_all', 'UserLogin', "Trvalé smazání všech smazaných uživatelů. Počet: {$count}");
            
//             return response()->json(null, 204);
//         } catch (\Exception $e) {
//             Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
//             return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
//         }
//     }
    
//     /**
//      * Zobrazení detailů konkrétního uživatele.
//      *
//      * @param UserLogin $userLogin
//      * @return JsonResponse
//      */
//     public function showDetails(UserLogin $userLogin): JsonResponse
//     {
//         // Načtení přiřazených rolí k uživateli
//         $userLogin->load('roles');

//         // Vytvoření pole s požadovanými daty
//         $selectedData = [
//             'id' => $userLogin->user_login_id,
//             'user_email' => $userLogin->user_email,
//             'last_login_at' => $userLogin->last_login_at,
//             'created_at' => $userLogin->created_at,
//             'updated_at' => $userLogin->updated_at,
//             'deleted_at' => $userLogin->deleted_at,
//             // Načtení názvů rolí
//             'roles' => $userLogin->roles->map(function ($role) {
//                 return [
//                     'role_id' => $role->role_id,
//                     'role_name' => $role->role_name,
//                     'description' => $role->description,
//                 ];
//             }),
//         ];

//         return response()->json($selectedData);
//     }

//     /**
//      * Ukládá akci do business logu.
//      *
//      * @param Request $request
//      * @param string $eventType
//      * @param string $module
//      * @param string $description
//      * @param int|null $affectedEntityId
//      */
//     protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null)
//     {
//         try {
//             $user = $request->user();
            
//             BusinessLog::create([
//                 'origin' => $request->ip(),
//                 'event_type' => $eventType,
//                 'module' => $module,
//                 'description' => $description,
//                 'affected_entity_type' => 'UserLogin',
//                 'affected_entity_id' => $affectedEntityId,
//                 'user_login_id' => $user ? $user->user_login_id : null,
//                 'context_data' => json_encode($request->all()),
//             ]);
//         } catch (\Exception $e) {
//             Log::error('Chyba při logování akce v UserLoginController: ' . $e->getMessage());
//         }
//     }
// }

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

            $query->with('roles');

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

        $this->logAction($request, 'create', 'UserLogin', 'Vytvoření nového uživatele', $user->user_login_id);

        return response()->json(new UserLoginResource($user), 201);
    }

    /**
     * Zobrazení konkrétního uživatele.
     */
    public function show(UserLogin $userLogin): JsonResponse
    {
        $userLogin->load('roles');

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

        $userLogin->load('roles');
        return response()->json(new UserLoginResource($userLogin));
    }

    /**
     * Změna hesla pro konkrétního uživatele.
     */
    public function changePassword(PasswordChangeRequest $request, UserLogin $userLogin): JsonResponse
    {
        $userLogin->load('roles');

        if ($userLogin->roles->contains('role_name', 'primeadmin')) {
            return response()->json([
                'message' => 'Heslo uživatele Prime Admin nelze změnit.',
                'error_code' => 'CANNOT_CHANGE_PRIMEADMIN_PASSWORD'
            ], 403);
        }

        $validatedData = $request->validated();
        $newPasswordHash = Hash::make($validatedData['new_password']);

        if (!Hash::check($validatedData['old_password'], $userLogin->user_password_hash)) {
            Log::info('Neúspěšná změna hesla. Uživatel ID: ' . $userLogin->user_login_id);
            return response()->json([
                'message' => 'Původní heslo je nesprávné.',
                'error_code' => 'WRONG_OLD_PASSWORD'
            ], 403);
        }

        $userLogin->update([
            'user_password_hash' => $newPasswordHash,
        ]);

        Log::info('Heslo bylo úspěšně změněno pro uživatele ID: ' . $userLogin->user_login_id);

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
        $userLogin->load('roles');

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
        ];

        return response()->json($selectedData);
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null)
    {
        try {
            $user = $request->user();

            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'UserLogin',
                'affected_entity_id' => $affectedEntityId,
                'user_login_id' => $user ? $user->user_login_id : null,
                'context_data' => json_encode($request->all()),
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při logování akce v UserLoginController: ' . $e->getMessage());
        }
    }
}
