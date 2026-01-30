<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{UserLogin, Role, BusinessLog};
use App\Http\Requests\{StoreUserLoginRequest, UpdateUserLoginRequest, PasswordChangeRequest};
use App\Http\Resources\UserLoginResource;
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Hash, Log};

class UserLoginController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN) || filter_var($request->input('is_deleted', false), FILTER_VALIDATE_BOOLEAN);

        $query = UserLogin::query()->withTrashed();
        
        // Ochrana PrimeAdmin a filtrace smazaných
        $query->whereDoesntHave('roles', fn($q) => $q->where('role_name', 'primeadmin'));
        $onlyTrashed ? $query->whereNotNull('user_login.deleted_at') : $query->whereNull('user_login.deleted_at');

        // Dynamické filtry (Like)
        foreach (['user_email', 'contact_email', 'full_name', 'personal_id_num'] as $f) {
            if ($request->filled($f)) $query->where("user_login.$f", 'like', "%{$request->input($f)}%");
        }
        if ($request->filled('user_login_id')) $query->where('user_login.user_login_id', $request->user_login_id);

        // Datumové filtry (speciální logika pro den/měsíc vs celé datum)
        foreach (['created_at', 'updated_at', 'last_login_at'] as $col) {
            if ($val = $request->input($col)) {
                if (is_numeric($val) && strlen($val) <= 2) {
                    $query->where(fn($q) => $q->whereRaw("DAY(user_login.$col) = ?", [$val])->orWhereRaw("MONTH(user_login.$col) = ?", [$val]));
                } else {
                    $query->whereDate("user_login.$col", $val);
                }
            }
        }

        if ($request->filled('role_name')) {
            $query->whereHas('roles', fn($q) => $q->where('role_name', 'like', "%{$request->role_name}%"));
        }

        // Řazení
        $sortBy = $request->input('sort_by', 'user_login_id');
        $dir = in_array(strtolower($request->input('sort_direction')), ['asc', 'desc']) ? $request->sort_direction : 'desc';
        
        if ($sortBy === 'role_name') {
            $query->leftJoin('user_roles as ur', 'user_login.user_login_id', '=', 'ur.user_login_id')
                  ->leftJoin('roles as r', 'ur.role_id', '=', 'r.role_id')
                  ->orderBy('r.role_name', $dir)->select('user_login.*');
        } else {
            $query->orderBy($sortBy, $dir);
        }

        $users = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN) 
            ? $query->with('roles.permissions')->get() 
            : $query->with('roles.permissions')->paginate($perPage);

        return response()->json(UserLoginResource::collection($users)->response()->getData(true));
    }

    public function store(StoreUserLoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        if (isset($validated['role_id']) && Role::find($validated['role_id'])?->role_name === 'primeadmin') {
            return response()->json(['message' => 'Nelze vytvořit Prime Admina.', 'error_code' => 'CANNOT_CREATE_PRIMEADMIN'], 403);
        }

        $user = UserLogin::create(array_merge($validated, [
            'user_password_hash' => Hash::make($validated['user_password_hash']),
            'commission_rate' => $validated['commission_rate'] ?? 10
        ]));

        if (isset($validated['role_id'])) $user->roles()->attach($validated['role_id']);

        $this->logAction($request, 'create', 'UserLogin', "Vytvořen uživatel: {$user->user_email}", $user->user_login_id, false);
        return response()->json(new UserLoginResource($user->load('roles.permissions')), 201);
    }

    public function show(UserLogin $userLogin): JsonResponse
    {
        if ($userLogin->load('roles')->roles->contains('role_name', 'primeadmin')) {
            return response()->json(['message' => 'Zakázaný přístup.', 'error_code' => 'FORBIDDEN_USER'], 403);
        }
        return response()->json(new UserLoginResource($userLogin->load('roles.permissions')));
    }

    public function showDetails(UserLogin $userLogin): JsonResponse
    {
        return $this->show($userLogin);
    }

    public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse
    {
        if ($userLogin->load('roles')->roles->contains('role_name', 'primeadmin')) {
            return response()->json(['message' => 'Nelze editovat Prime Admina.', 'error_code' => 'CANNOT_EDIT_PRIMEADMIN'], 403);
        }

        $validated = $request->validated();
        if ($request->user()?->user_login_id == $userLogin->user_login_id && isset($validated['role_id'])) {
            return response()->json(['message' => 'Nelze měnit vlastní roli.', 'error_code' => 'CANNOT_EDIT_OWN_ROLE'], 403);
        }

        if (isset($validated['user_password_hash'])) $validated['user_password_hash'] = Hash::make($validated['user_password_hash']);
        
        $userLogin->update($validated);
        if (isset($validated['role_id'])) $userLogin->roles()->sync([$validated['role_id']]);

        $this->logAction($request, 'update', 'UserLogin', "Aktualizace: {$userLogin->user_email}", $userLogin->user_login_id);
        return response()->json(new UserLoginResource($userLogin->load('roles.permissions')));
    }

    public function changePassword(PasswordChangeRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $auth = $request->user();
        $target = ($id = $request->input('target_user_id')) ? UserLogin::findOrFail($id) : $auth;

        if ($target->load('roles')->roles->contains('role_name', 'primeadmin')) {
            return response()->json(['message' => 'Heslo Prime Admina nelze měnit.', 'error_code' => 'CANNOT_CHANGE_PRIMEADMIN_PASSWORD'], 403);
        }

        // Ověření admin práv při změně cizího hesla
        if ($target->user_login_id !== $auth->user_login_id) {
            if (!$auth->load('roles')->roles->whereIn('role_name', ['admin', 'sysadmin', 'primeadmin'])->count()) {
                return response()->json(['message' => 'Nedostatečná oprávnění.', 'error_code' => 'INSUFFICIENT_PERMISSIONS'], 403);
            }
        }

        if (!Hash::check($validated['old_password'], $auth->user_password_hash)) {
            return response()->json(['message' => 'Původní heslo je nesprávné.', 'error_code' => 'WRONG_OLD_PASSWORD'], 403);
        }

        $target->update(['user_password_hash' => Hash::make($validated['new_password'])]);
        $this->logAction($request, 'PasswordChanged', 'UserLogin', "Změna hesla u: {$target->user_email}", $target->user_login_id, false);

        return response()->json(['message' => 'Heslo bylo úspěšně změněno.']);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = UserLogin::withTrashed()->with('roles')->findOrFail($id);
        if ($user->roles->contains('role_name', 'primeadmin') || $request->user()?->user_login_id == $id) {
            return response()->json(['message' => 'Nelze smazat tento účet.', 'error_code' => 'FORBIDDEN_DELETE'], 403);
        }

        $force = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $logData = ['id' => $user->user_login_id, 'email' => $user->user_email, 'roles' => $user->roles->pluck('role_name')];

        $force ? $user->forceDelete() : $user->delete();
        $this->logAction($request, $force ? 'hard_delete' : 'soft_delete', 'UserLogin', "Smazání uživatele ID: $id", $id, $logData);

        return response()->json(null, 204);
    }

    public function restore(int $id): JsonResponse
    {
        $user = UserLogin::withTrashed()->with('roles')->findOrFail($id);
        if ($user->roles->contains('role_name', 'primeadmin')) return response()->json(['message' => 'Nelze obnovit.', 'error_code' => 'CANNOT_RESTORE'], 403);
        
        $user->restore();
        $this->logAction(request(), 'restore', 'UserLogin', "Obnova: {$user->user_email}", $id);
        return response()->json(new UserLoginResource($user));
    }

    public function forceDeleteAllTrashed(): JsonResponse
    {
        $query = UserLogin::onlyTrashed()->whereDoesntHave('roles', fn($q) => $q->where('role_name', 'primeadmin'));
        $count = $query->count();
        $query->forceDelete();
        $this->logAction(request(), 'force_delete_all', 'UserLogin', "Vysypání koše: $count");
        return response()->json(null, 204);
    }

    protected function logAction(Request $request, string $type, string $mod, string $desc, ?int $id = null, $context = true)
    {
        try {
            $user = $request->user();
            $data = is_array($context) ? $context : ($context === true ? $request->all() : []);
            
            foreach (['user_password_hash', 'new_password', 'old_password', 'password'] as $f) {
                if (isset($data[$f])) $data[$f] = '********';
            }

            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $type,
                'module' => $mod,
                'description' => $desc,
                'affected_entity_type' => 'UserLogin',
                'affected_entity_id' => $id,
                'user_login_id' => $user?->user_login_id,
                'context_data' => !empty($data) ? json_encode($data, JSON_UNESCAPED_UNICODE) : "Context data vynechána",
                'user_login_id_plain' => (string)($user?->user_login_id ?? '0'),
                'user_login_email_plain' => $user?->user_email ?? 'system'
            ]);
        } catch (\Exception $e) { Log::error("Log error: " . $e->getMessage()); }
    }
}