<?php

namespace App\Http\Controllers\Api\Core;

use App\Http\Controllers\Controller;
use App\Http\Requests\Core\CoreRole\StoreCoreRoleRequest;
use App\Http\Requests\Core\CoreRole\UpdateCoreRoleRequest;
use App\Http\Resources\Core\CoreRoleResource;
use App\Models\Core\CoreRole;
use App\Models\Web\WebLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CoreRoleController extends Controller
{
    /**
     * Seznam rolí se stránkováním pro GenericTable.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = CoreRole::query();

        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        // Vyhledávání (pokud frontend posílá search query)
        if ($s = $request->input('search')) {
            $query->where('role_name', 'like', "%$s%")
                  ->orWhere('description', 'like', "%$s%");
        }

        $roles = $query->paginate($perPage);

        // Musíme zachovat strukturu pro GenericTable: { data: [], total: X, ... }
        return response()->json([
            'data'         => CoreRoleResource::collection($roles->items()),
            'total'        => $roles->total(),
            'per_page'     => $roles->perPage(),
            'current_page' => $roles->currentPage(),
            'last_page'    => $roles->lastPage(),
        ]);
    }

    /**
     * Vytvoření nové role přes StoreRoleRequest.
     */
    public function store(StoreCoreRoleRequest $request): JsonResponse
    {
        $role = CoreRole::create($request->validated());

        $this->logAction($request, 'create', 'CoreRole', "Vytvořena role: {$role->role_name}", $role->id);

        return response()->json(new CoreRoleResource($role), 201);
    }

    /**
     * Detail role.
     */
    public function show(CoreRole $role): JsonResponse
    {
        return response()->json(new CoreRoleResource($role));
    }

    /**
     * Aktualizace přes UpdateCoreRoleRequest (ošetřuje unikátnost jména mimo aktuální ID).
     */
    public function update(UpdateCoreRoleRequest $request, CoreRole $role): JsonResponse
    {
        $role->update($request->validated());

        $this->logAction($request, 'update', 'CoreRole', "Aktualizace role: {$role->role_name}", $role->id);

        return response()->json(new CoreRoleResource($role));
    }

    /**
     * Smazání (Soft / Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $role = CoreRole::withTrashed()->findOrFail($id);

        if ($forceDelete) {
            $role->forceDelete();
        } else {
            $role->delete();
        }

        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'CoreRole', "Smazání role ID: $id", $id);

        return response()->json(null, 204);
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $role = CoreRole::withTrashed()->findOrFail($id);
        $role->restore();

        $this->logAction($request, 'restore', 'CoreRole', "Obnova role: {$role->role_name}", $role->id);

        return response()->json(new CoreRoleResource($role));
    }

    /**
     * Logování akcí (sjednoceno s ostatními moduly).
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();
            WebLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'CoreRole',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'system'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (RoleController): " . $e->getMessage());
        }
    }
}