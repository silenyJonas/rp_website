<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Získání seznamu rolí s podporou paginace a filtrování.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = Role::query();

        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        $roles = $query->paginate($perPage);

        return response()->json(RoleResource::collection($roles));
    }

    /**
     * Uložení nové role.
     *
     * @param StoreRoleRequest $request
     * @return JsonResponse
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->validated());
        return response()->json(new RoleResource($role), 201);
    }

    /**
     * Zobrazení konkrétní role.
     *
     * @param Role $role
     * @return JsonResponse
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json(new RoleResource($role));
    }

    /**
     * Aktualizace konkrétní role.
     *
     * @param UpdateRoleRequest $request
     * @param Role $role
     * @return JsonResponse
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->validated());
        return response()->json(new RoleResource($role));
    }

    /**
     * Smazání nebo trvalé smazání role.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $role = Role::withTrashed()->findOrFail($id);

        if ($forceDelete) {
            $role->forceDelete();
        } else {
            $role->delete();
        }

        return response()->json(null, 204);
    }

    /**
     * Obnova smazané role.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        $role = Role::withTrashed()->findOrFail($id);
        $role->restore();
        return response()->json(new RoleResource($role));
    }
}