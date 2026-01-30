<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use App\Models\BusinessLog;
use App\Http\Resources\RawRequestCommissionResource;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use App\Http\Requests\UpdateRawRequestCommissionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class RawRequestCommissionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = RawRequestCommission::query();
        if ($onlyTrashed) $query->onlyTrashed();

        // Hromadné vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('thema', 'like', "%$s%")
                ->orWhere('order_description', 'like', "%$s%")
                ->orWhere('contact_email', 'like', "%$s%")
                ->orWhere('contact_phone', 'like', "%$s%"));
        }

        // Filtry
        foreach (['id', 'status', 'priority'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }
        foreach (['contact_email', 'contact_phone', 'thema', 'order_description'] as $f) {
            if ($request->filled($f)) $query->where($f, 'like', '%' . $request->input($f) . '%');
        }
        if ($request->filled('created_at')) $query->whereDate('created_at', $request->created_at);
        if ($request->filled('updated_at')) $query->whereDate('updated_at', $request->updated_at);

        // --- ŘAZENÍ: Defaultně nejnovější ID nahoře ---
        $sortBy = $request->filled('sort_by') ? $request->input('sort_by') : 'id';
        $sortDirection = $request->filled('sort_direction') ? $request->input('sort_direction') : 'desc';
        $query->orderBy($sortBy, $sortDirection);

        $data = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN) 
            ? $query->get() 
            : $query->paginate($perPage);

        // Pokud není paginace, vrátíme prostou kolekci
        if (filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN)) {
            return RawRequestCommissionResource::collection($data);
        }

        // --- RUČNÍ FORMÁTOVÁNÍ PRO ANGULAR (Eliminace NaN) ---
        return response()->json([
            'data'         => RawRequestCommissionResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
            'from'         => $data->firstItem(),
            'to'           => $data->lastItem(),
        ]);
    }

    public function store(StoreRawRequestCommissionRequest $request): JsonResponse
    {
        $data = array_merge(['status' => 'Nově zadané', 'priority' => 'Nízká'], $request->validated());
        $commission = RawRequestCommission::create($data);
        $this->logAction($request, 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', $commission->id);
        return response()->json(new RawRequestCommissionResource($commission), 201);
    }

    public function show(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        return response()->json(new RawRequestCommissionResource($rawRequestCommission));
    }

    public function showDetails(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        return $this->show($rawRequestCommission);
    }

    public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
    {
        $rawRequestCommission->update($request->validated());
        $this->logAction($request, 'update', 'RawRequestCommission', 'Aktualizace požadavku na provizi', $rawRequestCommission->id);
        return response()->json(new RawRequestCommissionResource($rawRequestCommission));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = RawRequestCommission::withTrashed()->findOrFail($id);
        
        $forceDelete ? $item->forceDelete() : $item->delete();
        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'RawRequestCommission', 'Smazání požadavku', $id);

        return response()->json(null, 204);
    }

    public function restore(Request $request, $id): JsonResponse
    {
        $item = RawRequestCommission::withTrashed()->findOrFail($id);
        $item->restore();
        $this->logAction($request, 'restore', 'RawRequestCommission', 'Obnova smazaného požadavku', $id);
        return response()->json(new RawRequestCommissionResource($item));
    }

    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $count = RawRequestCommission::onlyTrashed()->count();
        RawRequestCommission::onlyTrashed()->forceDelete();
        $this->logAction($request, 'force_delete_all', 'RawRequestCommission', "Hromadné smazání koše. Počet: $count");
        return response()->json(null, 204);
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user('sanctum') ?? $request->user();

            BusinessLog::create([
                'origin'                 => $request->ip(),
                'event_type'             => $eventType,
                'module'                 => $module,
                'description'            => $description,
                'affected_entity_type'   => $module,
                'affected_entity_id'     => $affectedId,
                'user_login_id'          => $user?->user_login_id,
                'context_data'           => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_login_id_plain'    => (string)($user?->user_login_id ?? '0'),
                'user_login_email_plain' => $user ? $user->user_email : 'Veřejný web (Anonym)'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error: " . $e->getMessage());
        }
    }
}