<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{User, Role, BusinessLog};
use App\Http\Requests\User\{StoreUserRequest, UpdateUserRequest};
use App\Http\Requests\PasswordChangeRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Hash, Log, DB};

class UserController extends Controller
{
    /**
     * Seznam uživatelů s filtrací a řazením.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN) 
                    || filter_var($request->input('is_deleted', false), FILTER_VALIDATE_BOOLEAN);

        $sortBy = $request->input('sort_by', 'id');
        $dir = in_array(strtolower($request->input('sort_direction')), ['asc', 'desc']) ? $request->input('sort_direction') : 'desc';

        $query = User::query()->withTrashed();
        
        // Ochrana: Nikdy nevracet Prime Adminy běžným uživatelům/adminům v seznamu
        $query->whereDoesntHave('roles', fn($q) => $q->where('role_name', 'primeadmin'));
        
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Vyhledávání
        if ($request->filled('full_name')) $query->where('full_name', 'like', "%{$request->full_name}%");
        if ($request->filled('user_email')) $query->where('user_email', 'like', "%{$request->user_email}%");

        // Speciální řazení podle role
        if ($sortBy === 'role_name') {
            $query->select('users.*')
                ->leftJoin('user_roles as ur', 'users.id', '=', 'ur.user_id')
                ->leftJoin('roles as r', 'ur.role_id', '=', 'r.id')
                ->orderBy('r.role_name', $dir);
        } else {
            // Ochrana před nejednoznačnými sloupci (Ambiguous column)
            $sortColumn = str_contains($sortBy, '.') ? $sortBy : "users.$sortBy";
            $query->orderBy($sortColumn, $dir);
        }

        $users = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN) 
            ? $query->with('roles.permissions')->get() 
            : $query->with('roles.permissions')->paginate($perPage);

        if (filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN)) {
            return response()->json(UserResource::collection($users));
        }

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'total' => $users->total(),
            'per_page' => $users->perPage(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
        ]);
    }

    /**
     * Vytvoření uživatele a přiřazení role.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        if (isset($validated['role_id']) && Role::find($validated['role_id'])?->role_name === 'primeadmin') {
            return response()->json(['message' => 'Nelze vytvořit Prime Admina.'], 403);
        }

        DB::beginTransaction();
        try {
            $user = User::create(array_merge($validated, [
                'user_password_hash' => Hash::make($validated['user_password_hash']),
                'commission_rate' => $validated['commission_rate'] ?? 10
            ]));

            if (isset($validated['role_id'])) {
                $user->roles()->attach($validated['role_id']);
            }

            DB::commit();
            $this->logAction($request, 'create', 'User', "Vytvořen uživatel: {$user->user_email}", $user->id);
            
            return response()->json(new UserResource($user->load('roles.permissions')), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Chyba při vytváření uživatele.'], 500);
        }
    }

    /**
     * Zobrazení detailu (pro apiResource).
     */
    public function show(User $user): JsonResponse
    {
        if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
            return response()->json(['message' => 'Zakázaný přístup.'], 403);
        }
        return response()->json(new UserResource($user->load('roles.permissions')));
    }

    /**
     * Aktualizace uživatele.
     */
// app/Http/Controllers/Api/UserController.php

public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // 1. Zabezpečení proti editaci PrimeAdmina
        if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
            return response()->json(['message' => 'Prime Admin je nedotknutelný.'], 403);
        }

        $validated = $request->validated();

        // 2. Ošetření hesla - pokud je prázdné, neupdatujeme ho
        if (!empty($validated['user_password_hash'])) {
            $validated['user_password_hash'] = Hash::make($validated['user_password_hash']);
        } else {
            unset($validated['user_password_hash']);
        }

        DB::beginTransaction();
        try {
            // 3. Update polí přímo v tabulce users
            $user->update($validated);

            // 4. Update role v tabulce user_roles (M:N relace)
            if (isset($validated['role_id'])) {
                // Pokud uživatel needituje sám sebe, změníme roli
                if ($request->user()->id !== $user->id) {
                    $user->roles()->sync([$validated['role_id']]);
                }
            }

            DB::commit();
            return response()->json(new UserResource($user->load('roles.permissions')));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Chyba při updatu uživatele: " . $e->getMessage());
            return response()->json(['message' => 'Chyba serveru při ukládání.'], 500);
        }
    }

    /**
     * Změna hesla.
     */
    // public function changePassword(PasswordChangeRequest $request, $id): JsonResponse
    // {
    //     $user = User::findOrFail($id);
    //     $validated = $request->validated();
    //     $auth = $request->user();

    //     if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
    //         return response()->json(['message' => 'Heslo Prime Admina nelze měnit.'], 403);
    //     }

    //     if ($user->id !== $auth->id && !$auth->roles()->whereIn('role_name', ['admin', 'sysadmin', 'primeadmin'])->exists()) {
    //         return response()->json(['message' => 'Nedostatečná oprávnění.'], 403);
    //     }

    //     // Ověření starého hesla
    //     if (!Hash::check($validated['old_password'], $user->user_password_hash)) {
    //         return response()->json(['message' => 'Původní heslo je nesprávné.'], 403);
    //     }

    //     $user->update(['user_password_hash' => Hash::make($validated['new_password'])]);
    //     $this->logAction($request, 'PasswordChanged', 'User', "Změna hesla u: {$user->user_email}", $user->id);

    //     return response()->json(['message' => 'Heslo úspěšně změněno.']);
    // }
    public function changePassword(PasswordChangeRequest $request, $id): JsonResponse
{
    $user = User::findOrFail($id);
    $validated = $request->validated();
    $auth = $request->user();

    // 1. Ochrana Prime Admina
    if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
        return response()->json(['message' => 'Heslo Prime Admina nelze měnit.'], 403);
    }

    // 2. Kontrola oprávnění (buď jsem to já, nebo jsem admin)
    $isAdmin = $auth->roles()->whereIn('role_name', ['admin', 'sysadmin', 'primeadmin'])->exists();
    $isOwner = $user->id === $auth->id;

    if (!$isOwner && !$isAdmin) {
        return response()->json(['message' => 'Nedostatečná oprávnění.'], 403);
    }

    // 3. LOGIKA OVĚŘENÍ HESLA:
    // Pokud měním heslo sám sobě (isOwner), MUSÍM zadat správné staré heslo.
    // Pokud jsem admin a měním heslo někomu jinému, staré heslo mě nezajímá.
    if ($isOwner) {
        if (!isset($validated['old_password']) || !Hash::check($validated['old_password'], $user->user_password_hash)) {
            return response()->json(['message' => 'Původní heslo je nesprávné.'], 403);
        }
    }

    // 4. Samotná změna
    $user->update(['user_password_hash' => Hash::make($validated['new_password'])]);
    
    $this->logAction(
        $request, 
        'PasswordChanged', 
        'User', 
        "Změna hesla u: {$user->user_email} " . ($isAdmin && !$isOwner ? "(provedl admin)" : ""), 
        $user->id
    );

    return response()->json(['message' => 'Heslo úspěšně změněno.']);
}
    /**
     * Obnova smazaného uživatele.
     */
    public function restore($id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        $this->logAction(request(), 'restore', 'User', "Obnoven uživatel: {$user->user_email}", $user->id);
        return response()->json(new UserResource($user->load('roles.permissions')));
    }

    /**
     * Smazání uživatele.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        
        if ($user->roles()->where('role_name', 'primeadmin')->exists() || $request->user()?->id == $id) {
            return response()->json(['message' => 'Nelze smazat tento účet.'], 403);
        }

        $force = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $force ? $user->forceDelete() : $user->delete();
        
        $this->logAction($request, $force ? 'hard_delete' : 'soft_delete', 'User', "Smazáno ID: $id", $id);
        return response()->json(null, 204);
    }

    /**
     * Hromadné vysypání koše.
     */
    public function forceDeleteAllTrashed(): JsonResponse
    {
        $query = User::onlyTrashed()->whereDoesntHave('roles', fn($q) => $q->where('role_name', 'primeadmin'));
        $count = $query->count();
        $query->forceDelete();
        
        $this->logAction(request(), 'force_delete_all', 'User', "Vysypání koše. Smazáno: $count");
        return response()->json(null, 204);
    }

    /**
     * Interní logování akcí.
     */
    // protected function logAction(Request $request, string $type, string $mod, string $desc, ?int $id = null)
    // {
    //     try {
    //         $user = $request->user();
    //         BusinessLog::create([
    //             'origin'               => $request->ip(),
    //             'event_type'           => $type,
    //             'module'               => $mod,
    //             'description'          => $desc,
    //             'affected_entity_type' => 'User',
    //             'affected_entity_id'   => $id,
    //             'user_id'              => $user?->id,
    //             'context_data'         => json_encode($request->except(['user_password_hash', 'old_password', 'new_password', 'password']), JSON_UNESCAPED_UNICODE),
    //             'user_id_plain'        => (string)($user?->id ?? '0'),
    //             'user_email_plain'     => $user?->user_email ?? 'system'
    //         ]);
    //     } catch (\Exception $e) { 
    //         Log::error("Log error (User): " . $e->getMessage()); 
    //     }
    // }
    protected function logAction(Request $request, string $type, string $mod, string $desc, ?int $id = null)
{
    try {
        $user = $request->user();
        
        // Seznam polí, která jsou citlivá a nesmí se nikdy uložit do logu
        $sensitiveFields = [
            'new_password_confirmation',
            'user_password_hash', 
            'old_password', 
            'new_password', 
            'password', 
            'password_confirmation',
            'current_password'
        ];

        BusinessLog::create([
            'origin'               => $request->ip(),
            'event_type'           => $type,
            'module'               => $mod,
            'description'          => $desc,
            'affected_entity_type' => 'User',
            'affected_entity_id'   => $id,
            'user_id'              => $user?->id,
            // .except() zajistí, že tato pole v JSONu v databázi vůbec nebudou
            'context_data'         => json_encode($request->except($sensitiveFields), JSON_UNESCAPED_UNICODE),
            'user_id_plain'        => (string)($user?->id ?? '0'),
            'user_email_plain'     => $user?->user_email ?? 'system'
        ]);
    } catch (\Exception $e) { 
        Log::error("Log error (User): " . $e->getMessage()); 
    }
}
}