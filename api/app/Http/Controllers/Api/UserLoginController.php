<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUserLoginRequest;
use App\Http\Requests\UpdateUserLoginRequest;
use App\Http\Resources\UserLoginResource;
use Illuminate\Http\JsonResponse;

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
        // Získání parametrů s použitím názvů, které jsou kompatibilní s frontendem
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $search = $request->input('search');
        $userEmail = $request->input('user_email');
        $id = $request->input('id');
        $createdAt = $request->input('created_at');
        $updatedAt = $request->input('updated_at');

        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = UserLogin::query();

        // Pokud je `onlyTrashed` true, načti pouze smazané záznamy.
        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        // Filtrování podle klíčového slova
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('user_email', 'like', '%' . $search . '%');
            });
        }
        
        // Samostatné filtrování pro každé pole
        if ($id) {
            $query->where('user_login_id', $id);
        }

        if ($userEmail) {
            $query->where('user_email', 'like', '%' . $userEmail . '%');
        }
        
        if ($createdAt) {
            $query->whereDate('created_at', '=', $createdAt);
        }

        if ($updatedAt) {
            $query->whereDate('updated_at', '=', $updatedAt);
        }

        // Kód pro řazení
        if ($sortBy) {
            $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }

        // Načtení relací (rolí)
        $query->with('roles');

        if ($noPagination) {
            $users = $query->get();
        } else {
            $users = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return response()->json(UserLoginResource::collection($users));
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
        $validatedData['user_password_hash'] = \Hash::make($validatedData['user_password']);
        $user = UserLogin::create($validatedData);
        
        // Případně přiřazení role
        if ($request->has('roles')) {
            $user->roles()->sync($request->input('roles'));
        }

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
     * Aktualizace konkrétního uživatele.
     *
     * @param UpdateUserLoginRequest $request
     * @param UserLogin $userLogin
     * @return JsonResponse
     */
    public function update(UpdateUserLoginRequest $request, UserLogin $userLogin): JsonResponse
    {
        $validatedData = $request->validated();
        if (isset($validatedData['user_password'])) {
            $validatedData['user_password_hash'] = \Hash::make($validatedData['user_password']);
            unset($validatedData['user_password']);
        }
        $userLogin->update($validatedData);

        if ($request->has('roles')) {
            $userLogin->roles()->sync($request->input('roles'));
        }

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
            UserLogin::onlyTrashed()->forceDelete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            \Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }
}