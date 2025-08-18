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
    
//     /**
//      * Aktualizace uživatelského účtu.
//      *
//      * @param UpdateUserLoginRequest $request
//      * @param UserLogin $userLogin
//      * @return JsonResponse
//      */
//     public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse
//     {
//         $validatedData = $request->validated();
//         $updateData = [];
//         if (isset($validatedData['user_password_hash'])) {
//             $updateData['user_password_hash'] = Hash::make($validatedData['user_password_hash']);
//         }
//         if (isset($validatedData['user_email'])) {
//             $updateData['user_email'] = $validatedData['user_email'];
//         }
//         $userLogin->update($updateData);
//         if ($request->has('role_id')) {
//             $userLogin->roles()->sync([$validatedData['role_id']]);
//         }
        
//         // Logování aktualizace uživatele
//         $this->logAction($request, 'update', 'UserLogin', 'Aktualizace údajů uživatele', $userLogin->user_login_id);
        
//         $userLogin->load('roles');
//         return response()->json(new UserLoginResource($userLogin));
//     }
    
//     /**
//      * Smazání nebo trvalé smazání uživatele.
//      *
//      * @param Request $request
//      * @param int $id
//      * @return JsonResponse
//      */
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
use App\Models\BusinessLog; // Důležitý import pro logování

class UserLoginController extends Controller
{
    /**
     * Získání seznamu uživatelů s podporou filtrování, řazení a paginace.
     *
     * @param Request $request
     * @return JsonResponse
     */
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
        
        // Změněno na role_name
        $roleName = $request->input('role_name');
        

        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = UserLogin::query();
        
        try {
            // Vždy použijeme withTrashed(), aby se zabránilo ambiguitě s 'deleted_at' při JOINu
            $query->withTrashed();

            // Sjednocená logika pro řazení
            if ($sortBy) {
                $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
                
                // Změněno na role_name
                if ($sortBy === 'role_name') {
                    // Přidání aliasů a JOINů
                    $query->leftJoin('user_roles as ur', 'user_login.user_login_id', '=', 'ur.user_login_id')
                        ->leftJoin('roles as r', 'ur.role_id', '=', 'r.role_id')
                        ->orderBy('r.role_name', $sortDirection);
                        
                    // Zajištění, že se vybírají jen sloupce z user_login, aby se předešlo dalším konfliktům
                    $query->select('user_login.*');
                } else {
                    $query->orderBy($sortBy, $sortDirection);
                }
            } else {
                // ZMĚNA: Řazení podle user_login_id sestupně
                $query->orderBy('user_login.user_login_id', 'desc');
            }

            // Aplikujeme filtry po joinu s explicitním názvem tabulky, abychom předešli ambiguitě
            if ($onlyTrashed) {
                $query->whereNotNull('user_login.deleted_at');
            } elseif ($isDeleted) {
                $query->whereNotNull('user_login.deleted_at');
            } else {
                $query->whereNull('user_login.deleted_at');
            }

            // Apply other filters conditionally based on if they have a value
            if ($userLoginId) {
                $query->where('user_login.user_login_id', $userLoginId);
            }

            if ($userEmail) {
                $query->where('user_login.user_email', 'like', '%' . $userEmail . '%');
            }
            
            if ($createdAt) {
                if (is_numeric($createdAt) && strlen($createdAt) <= 2) {
                    $query->where(function($q) use ($createdAt) {
                        $q->whereRaw('DAY(user_login.created_at) = ?', [$createdAt])
                            ->orWhereRaw('MONTH(user_login.created_at) = ?', [$createdAt]);
                    });
                } else {
                    $query->whereDate('user_login.created_at', '=', $createdAt);
                }
            }

            if ($updatedAt) {
                if (is_numeric($updatedAt) && strlen($updatedAt) <= 2) {
                    $query->where(function($q) use ($updatedAt) {
                        $q->whereRaw('DAY(user_login.updated_at) = ?', [$updatedAt])
                            ->orWhereRaw('MONTH(user_login.updated_at) = ?', [$updatedAt]);
                    });
                } else {
                    $query->whereDate('user_login.updated_at', '=', $updatedAt);
                }
            }

            if ($lastLoginAt) {
                if (is_numeric($lastLoginAt) && strlen($lastLoginAt) <= 2) {
                    $query->where(function($q) use ($lastLoginAt) {
                        $q->whereRaw('DAY(user_login.last_login_at) = ?', [$lastLoginAt])
                            ->orWhereRaw('MONTH(user_login.last_login_at) = ?', [$lastLoginAt]);
                    });
                } else {
                    $query->whereDate('user_login.last_login_at', '=', $lastLoginAt);
                }
            }

            // Změněno na role_name
            if ($roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('role_name', 'like', '%' . $roleName . '%');
                });
            }

            // Vždy načíst role pro každý výsledek
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
            return response()->json(['message' => 'Něco se pokazilo. Prosím, zkontrolujte parametry dotazu.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Uložení nového uživatele.
     *
     * @param StoreUserLoginRequest $request
     * @return JsonResponse
     */
    public function store(StoreUserLoginRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
        $user = UserLogin::create([
            'user_email' => $validatedData['user_email'],
            'user_password_hash' => Hash::make($validatedData['user_password_hash'])
        ]);
        if ($request->has('role_id')) {
            $user->roles()->attach($validatedData['role_id']);
        }
        
        // Logování vytvoření uživatele
        $this->logAction($request, 'create', 'UserLogin', 'Vytvoření nového uživatele', $user->user_login_id);
        
        return response()->json(new UserLoginResource($user), 201);
    }

    /**
     * Zobrazení konkrétního uživatele.
     *
     * @param UserLogin $userLogin
     * @return JsonResponse
     */
    public function show(UserLogin $userLogin): JsonResponse
    {
        $userLogin->load('roles');
        return response()->json(new UserLoginResource($userLogin));
    }
    
    /**
     * Aktualizace uživatelského účtu.
     *
     * @param UpdateUserLoginRequest $request
     * @param UserLogin $userLogin
     * @return JsonResponse
     */
    public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse
    {
        // Kontrola, zda se přihlášený uživatel pokouší upravit svou vlastní roli
        $authenticatedUser = $request->user();
        if ($authenticatedUser && (int)$authenticatedUser->user_login_id === (int)$userLogin->user_login_id) {
            if ($request->has('role_id')) {
                return response()->json([
                    'message' => 'Nelze upravit vlastní roli.',
                    'error_code' => 'CANNOT_EDIT_OWN_ROLE'
                ], 403);
            }
        }

        $validatedData = $request->validated();
        $updateData = [];
        if (isset($validatedData['user_password_hash'])) {
            $updateData['user_password_hash'] = Hash::make($validatedData['user_password_hash']);
        }
        if (isset($validatedData['user_email'])) {
            $updateData['user_email'] = $validatedData['user_email'];
        }
        $userLogin->update($updateData);
        if ($request->has('role_id')) {
            $userLogin->roles()->sync([$validatedData['role_id']]);
        }
        
        // Logování aktualizace uživatele
        $this->logAction($request, 'update', 'UserLogin', 'Aktualizace údajů uživatele', $userLogin->user_login_id);
        
        $userLogin->load('roles');
        return response()->json(new UserLoginResource($userLogin));
    }
    
    /**
     * Smazání nebo trvalé smazání uživatele.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        // Kontrola, zda se přihlášený uživatel pokouší smazat svůj vlastní účet
        $authenticatedUser = $request->user();
        if ($authenticatedUser && (int)$authenticatedUser->user_login_id === (int)$id) {
            return response()->json([
                'message' => 'Nelze smazat účet, za který jste právě přihlášený/á.',
                'error_code' => 'CANNOT_DELETE_OWN_ACCOUNT' // Vlastní chybový kód pro frontend
            ], 403);
        }

        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid ID format.'], 404);
        }
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $userLogin = UserLogin::withTrashed()->findOrFail($id);
        
        if ($forceDelete) {
            $userLogin->forceDelete();
            // Logování trvalého smazání
            $this->logAction($request, 'hard_delete', 'UserLogin', 'Trvalé smazání uživatele', $id);
        } else {
            $userLogin->delete();
            // Logování soft smazání
            $this->logAction($request, 'soft_delete', 'UserLogin', 'Soft smazání uživatele', $id);
        }
        
        return response()->json(null, 204);
    }
    
    /**
     * Obnova smazaného uživatele.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        $userLogin = UserLogin::withTrashed()->findOrFail($id);
        $userLogin->restore();
        
        // Logování obnovy uživatele
        $this->logAction(request(), 'restore', 'UserLogin', 'Obnova smazaného uživatele', $userLogin->user_login_id);
        
        return response()->json(new UserLoginResource($userLogin));
    }
    
    /**
     * Trvalé smazání všech smazaných uživatelů.
     *
     * @return JsonResponse
     */
    public function forceDeleteAllTrashed(): JsonResponse
    {
        try {
            $count = UserLogin::onlyTrashed()->count();
            UserLogin::onlyTrashed()->forceDelete();
            
            // Logování hromadného smazání
            $this->logAction(request(), 'force_delete_all', 'UserLogin', "Trvalé smazání všech smazaných uživatelů. Počet: {$count}");
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Zobrazení detailů konkrétního uživatele.
     *
     * @param UserLogin $userLogin
     * @return JsonResponse
     */
    public function showDetails(UserLogin $userLogin): JsonResponse
    {
        // Načtení přiřazených rolí k uživateli
        $userLogin->load('roles');

        // Vytvoření pole s požadovanými daty
        $selectedData = [
            'id' => $userLogin->user_login_id,
            'user_email' => $userLogin->user_email,
            'last_login_at' => $userLogin->last_login_at,
            'created_at' => $userLogin->created_at,
            'updated_at' => $userLogin->updated_at,
            'deleted_at' => $userLogin->deleted_at,
            // Načtení názvů rolí
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

    /**
     * Ukládá akci do business logu.
     *
     * @param Request $request
     * @param string $eventType
     * @param string $module
     * @param string $description
     * @param int|null $affectedEntityId
     */
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
