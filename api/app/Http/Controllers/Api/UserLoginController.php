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

class UserLoginController extends Controller{
    public function index(Request $request): JsonResponse{
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
        $roleName = $request->input('roles.0.role_name');
        
        Log::info('roles.0.role_name:', [$roleName]);

        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = UserLogin::query();
        
        try {
            // Vždy použijeme withTrashed(), aby se zabránilo ambiguitě s 'deleted_at' při JOINu
            $query->withTrashed();

            // Sjednocená logika pro řazení
            if ($sortBy) {
                $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
                if ($sortBy === 'roles.0.role_name') {
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
                $query->latest();
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
    public function store(StoreUserLoginRequest $request): JsonResponse{
        $validatedData = $request->validated();
        $user = UserLogin::create([
            'user_email' => $validatedData['user_email'],
            'user_password_hash' => Hash::make($validatedData['user_password_hash'])
        ]);
        if ($request->has('role_id')) {
            $user->roles()->attach($validatedData['role_id']);
        }
        return response()->json(new UserLoginResource($user), 201);
    }
    public function show(UserLogin $userLogin): JsonResponse{
        $userLogin->load('roles');
        return response()->json(new UserLoginResource($userLogin));
    }
    public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse{
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
        $userLogin->load('roles');
        return response()->json(new UserLoginResource($userLogin));
    }
    public function destroy(Request $request, $id): JsonResponse{
        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid ID format.'], 404);
        }
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $userLogin = UserLogin::withTrashed()->findOrFail($id);
        if ($forceDelete) {
            $userLogin->forceDelete();
        } else {
            $userLogin->delete();
        }
        return response()->json(null, 204);
    }
    public function restore(int $id): JsonResponse{
        $userLogin = UserLogin::withTrashed()->findOrFail($id);
        $userLogin->restore();
        return response()->json(new UserLoginResource($userLogin));
    }
    public function forceDeleteAllTrashed(): JsonResponse{
        try {
            UserLogin::onlyTrashed()->forceDelete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }
}

