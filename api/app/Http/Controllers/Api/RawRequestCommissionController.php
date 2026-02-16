<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use App\Models\BusinessLog;
use App\Http\Resources\RawRequestCommissionResource;
use App\Http\Requests\RawRequestCommission\StoreRawRequestCommissionRequest;
use App\Http\Requests\RawRequestCommission\UpdateRawRequestCommissionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class RawRequestCommissionController extends Controller
{
    /**
     * Seznam požadavků na provize.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = RawRequestCommission::query();
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Fulltextové vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('thema', 'like', "%$s%")
                ->orWhere('order_description', 'like', "%$s%")
                ->orWhere('contact_email', 'like', "%$s%")
                ->orWhere('contact_phone', 'like', "%$s%"));
        }

        // Filtry na přesnou shodu
        foreach (['id', 'status', 'priority'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }

        // Filtry na LIKE vyhledávání
        foreach (['contact_email', 'contact_phone', 'thema', 'order_description'] as $f) {
            if ($request->filled($f)) $query->where($f, 'like', '%' . $request->input($f) . '%');
        }

        if ($request->filled('created_at')) $query->whereDate('created_at', $request->created_at);

        // Řazení
        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return RawRequestCommissionResource::collection($data);
        }

        return response()->json([
            'data'         => RawRequestCommissionResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nového požadavku.
     */
    public function store(StoreRawRequestCommissionRequest $request): JsonResponse
    {
        // Výchozí hodnoty se dají definovat přímo zde, pokud nejsou v Requestu
        $validated = $request->validated();
        
        $commission = RawRequestCommission::create($validated);
        
        $this->logAction($request, 'create', 'RawRequestCommission', "Vytvořen požadavek na provizi: {$commission->thema}", $commission->id);
        
        return response()->json(new RawRequestCommissionResource($commission), 201);
    }

    /**
     * Detail požadavku.
     */
    public function show(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        return response()->json(new RawRequestCommissionResource($rawRequestCommission));
    }

    /**
     * Aktualizace požadavku.
     */
    public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
    {
        $rawRequestCommission->update($request->validated());
        
        $this->logAction($request, 'update', 'RawRequestCommission', "Aktualizace požadavku ID: {$rawRequestCommission->id}", $rawRequestCommission->id);
        
        return response()->json(new RawRequestCommissionResource($rawRequestCommission));
    }

    /**
     * Smazání (Soft / Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = RawRequestCommission::withTrashed()->findOrFail($id);
        
        $forceDelete ? $item->forceDelete() : $item->delete();
        
        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'RawRequestCommission', "Smazání požadavku na provizi ID: $id", $id);

        return response()->json(null, 204);
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        $item = RawRequestCommission::withTrashed()->findOrFail($id);
        $item->restore();
        
        $this->logAction($request, 'restore', 'RawRequestCommission', "Obnova požadavku ID: $id", $id);
        
        return response()->json(new RawRequestCommissionResource($item));
    }

    /**
     * Vyprázdnění koše.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $count = RawRequestCommission::onlyTrashed()->count();
        RawRequestCommission::onlyTrashed()->forceDelete();
        
        $this->logAction($request, 'force_delete_all', 'RawRequestCommission', "Hromadné smazání koše provizí. Počet: $count");
        
        return response()->json(null, 204);
    }

    /**
     * Sjednocené logování (BusinessLog).
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();

            BusinessLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'RawRequestCommission',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'Veřejný formulář'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (RawRequestCommission): " . $e->getMessage());
        }
    }
}