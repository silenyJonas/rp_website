<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{User};
use App\Models\Core\CoreRole;
use App\Models\Web\WebLog;
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
            $sortColumn = str_contains($sortBy, '.') ? $sortBy : "users.$sortBy";
            $query->orderBy($sortColumn, $dir);
        }

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);

        if ($noPagination) {
            $this->logAction($request, 'export', 'User', "Hromadný export uživatelů.");
            $users = $query->with('roles.permissions')->get();
            return response()->json(UserResource::collection($users));
        }

        $users = $query->with('roles.permissions')->paginate($perPage);

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
        
        if (isset($validated['role_id']) && CoreRole::find($validated['role_id'])?->role_name === 'primeadmin') {
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
            $this->logAction($request, 'error', 'User', "Chyba při vytváření uživatele: " . $e->getMessage());
            return response()->json(['message' => 'Chyba při vytváření uživatele.'], 500);
        }
    }

    /**
     * Zobrazení detailu (včetně smazaných v koši a kontroly práv).
     */
    public function show($id): JsonResponse
    {
        // 🔧 1. Ruční vyhledání uživatele podle ID (včetně smazaných v koši)
        $user = User::withTrashed()->findOrFail($id);

        // 🛡️ 2. Bezpečnostní kontrola (blokace zobrazení primeadmina)
        if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
            return response()->json(['message' => 'Zakázaný přístup.'], 403);
        }

        // 🔗 3. Načtení relací a vrácení dat
        return response()->json(new UserResource($user->load('roles.permissions')));
    }

    /**
     * Aktualizace uživatele.
     */
  /**
     * Aktualizace uživatele (ruční načtení podle ID).
     */
    public function update(UpdateUserRequest $request, $id): JsonResponse
    {
        // 🔧 1. Ruční vyhledání uživatele podle ID (shoduje se s URL v api.php)
        $user = User::findOrFail($id);

        if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
            return response()->json(['message' => 'Prime Admin je nedotknutelný.'], 403);
        }

        $validated = $request->validated();

        if (!empty($validated['user_password_hash'])) {
            $validated['user_password_hash'] = Hash::make($validated['user_password_hash']);
        } else {
            unset($validated['user_password_hash']);
        }

        DB::beginTransaction();
        try {
            $user->update($validated);

            if (isset($validated['role_id'])) {
                if ($request->user()->id !== $user->id) {
                    $user->roles()->sync([$validated['role_id']]);
                }
            }

            DB::commit();
            $this->logAction($request, 'update', 'User', "Aktualizace uživatele: {$user->user_email}", $user->id);
            return response()->json(new UserResource($user->load('roles.permissions')));

        } catch (\Exception $e) {
            DB::rollBack();
            $this->logAction($request, 'error', 'User', "Chyba při updatu uživatele ID {$id}: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Chyba serveru při ukládání.'], 500);
        }
    }

    /**
     * Změna hesla.
     */
 public function changePassword(PasswordChangeRequest $request, $id): JsonResponse
{
    try {
        $user = User::findOrFail($id); // Ten, komu měníme heslo
        $validated = $request->validated();
        $auth = $request->user() ?? auth('sanctum')->user(); // Ten, kdo sedí u PC

        // 1. Ochrana Prime Admina (nikdo mu nesmí změnit heslo)
        if ($user->roles()->where('role_name', 'primeadmin')->exists()) {
            return response()->json(['message' => 'Heslo Prime Admina nelze měnit.'], 403);
        }

        $isAdmin = $auth->roles()->whereIn('role_name', ['admin', 'sysadmin', 'primeadmin'])->exists();
        $isOwner = $user->id === $auth->id;

        // 2. Kontrola práv: Můžu měnit heslo jen sobě nebo jsem admin
        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Nedostatečná oprávnění.'], 403);
        }

        /**
         * 3. BEZPEČNOSTNÍ POJISTKA
         * Ověřujeme 'old_password' proti heslu PŘIHLÁŠENÉHO uživatele ($auth).
         * Tím zajistíme, že i admin musí zadat SVÉ heslo, aby mohl změnit heslo někomu jinému.
         */
        if (!isset($validated['old_password']) || !Hash::check($validated['old_password'], $auth->user_password_hash)) {
            return response()->json(['message' => 'Vaše potvrzovací heslo (aktuální heslo) je nesprávné.'], 403);
        }

        // 4. Samotná změna hesla u cílového uživatele
        $user->update(['user_password_hash' => Hash::make($validated['new_password'])]);
        
        $this->logAction(
            $request, 
            'PasswordChanged', 
            'User', 
            "Změna hesla u: {$user->user_email} " . ($isAdmin && !$isOwner ? "(provedl admin: {$auth->user_email})" : ""), 
            $user->id
        );

        return response()->json(['message' => 'Heslo úspěšně změněno.']);
    } catch (\Exception $e) {
        $this->logAction($request, 'error', 'User', "Chyba při změně hesla ID {$id}: " . $e->getMessage(), $id);
        return response()->json(['message' => 'Změna hesla selhala.'], 500);
    }
}

    /**
     * Obnova smazaného uživatele.
     */
    public function restore($id): JsonResponse
    {
        try {
            $user = User::withTrashed()->findOrFail($id);
            $user->restore();

            $this->logAction(request(), 'restore', 'User', "Obnoven uživatel: {$user->user_email}", $user->id);
            return response()->json(new UserResource($user->load('roles.permissions')));
        } catch (\Exception $e) {
            $this->logAction(request(), 'error', 'User', "Chyba při obnově uživatele ID {$id}: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Obnova uživatele selhala.'], 500);
        }
    }

    /**
     * Smazání uživatele.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $user = User::withTrashed()->findOrFail($id);
            
            if ($user->roles()->where('role_name', 'primeadmin')->exists() || $request->user()?->id == $id) {
                return response()->json(['message' => 'Nelze smazat tento účet.'], 403);
            }

            $force = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $force ? $user->forceDelete() : $user->delete();
            
            $this->logAction($request, $force ? 'hard_delete' : 'soft_delete', 'User', "Smazáno ID: $id", $id);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'User', "Chyba při mazání uživatele ID {$id}: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Smazání uživatele selhalo.'], 500);
        }
    }

    /**
     * Hromadné vysypání koše.
     */
    public function forceDeleteAllTrashed(): JsonResponse
    {
        try {
            $query = User::onlyTrashed()->whereDoesntHave('roles', fn($q) => $q->where('role_name', 'primeadmin'));
            $count = $query->count();
            $query->forceDelete();
            
            $this->logAction(request(), 'force_delete_all', 'User', "Vysypání koše. Smazáno: $count");
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction(request(), 'error', 'User', "Chyba při vysypávání koše uživatelů: " . $e->getMessage());
            return response()->json(['message' => 'Vysypání koše selhalo.'], 500);
        }
    }

    /**
     * Interní logování akcí.
     */
    protected function logAction(Request $request, string $type, string $mod, string $desc, ?int $id = null)
    {
        try {
            $user = $request->user() ?? auth('sanctum')->user();
            
            $sensitiveFields = [
                'new_password_confirmation',
                'user_password_hash', 
                'old_password', 
                'new_password', 
                'password', 
                'password_confirmation',
                'current_password'
            ];

            WebLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $type,
                'module'               => $mod,
                'description'          => $desc,
                'affected_entity_type' => 'User',
                'affected_entity_id'   => $id,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->except($sensitiveFields), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'system'
            ]);
        } catch (\Exception $e) { 
            Log::error("Log error (User): " . $e->getMessage()); 
        }
    }
}