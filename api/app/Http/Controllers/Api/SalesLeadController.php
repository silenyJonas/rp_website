<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesLead;
use App\Models\BusinessLog;
use App\Http\Resources\SalesLeadResource;
use App\Http\Requests\StoreSalesLeadRequest;
use App\Http\Requests\UpdateSalesLeadRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SalesLeadController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = SalesLead::query();
        if ($onlyTrashed) $query->onlyTrashed();

        // Hromadné vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('subject_name', 'like', "%$s%")
                ->orWhere('contact_email', 'like', "%$s%")
                ->orWhere('contact_person', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        // Individuální filtry - přesná shoda
        foreach (['id', 'status', 'priority'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }
        // Individuální filtry - částečná shoda (like)
        foreach (['subject_name', 'location', 'salesman_name', 'contact_email', 'contact_phone', 'contact_other'] as $f) {
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

        // Pokud není paginace, vrátíme prostou kolekci přes Resource
        if (filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN)) {
            return SalesLeadResource::collection($data);
        }

        // --- RUČNÍ FORMÁTOVÁNÍ PRO KOMPATIBILITU S ANGULAR PAGINACÍ ---
        return response()->json([
            'data'         => SalesLeadResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
            'from'         => $data->firstItem(),
            'to'           => $data->lastItem(),
        ]);
    }

    public function store(StoreSalesLeadRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = array_merge($request->validated(), [
            'user_login_id' => $user->user_login_id,
            'salesman_name' => $user->user_email
        ]);
        
        $lead = SalesLead::create($data);
        $this->logAction($request, 'create', 'SalesLead', "Vytvořen lead: {$lead->subject_name}", $lead->id);
        return response()->json(new SalesLeadResource($lead), 201);
    }

    public function show(SalesLead $salesLead): JsonResponse
    {
        return response()->json(new SalesLeadResource($salesLead));
    }

    public function showDetails(SalesLead $salesLead): JsonResponse
    {
        return $this->show($salesLead);
    }

    public function update(UpdateSalesLeadRequest $request, SalesLead $salesLead): JsonResponse
    {
        $salesLead->update($request->validated());
        $this->logAction($request, 'update', 'SalesLead', "Aktualizace leadu: {$salesLead->subject_name}", $salesLead->id);
        return response()->json(new SalesLeadResource($salesLead));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $lead = SalesLead::withTrashed()->findOrFail($id);
        
        $forceDelete ? $lead->forceDelete() : $lead->delete();
        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'SalesLead', "Smazání leadu ID: $id", $id);

        return response()->json(null, 204);
    }

    public function restore(Request $request, $id): JsonResponse
    {
        $lead = SalesLead::withTrashed()->findOrFail($id);
        $lead->restore();
        $this->logAction($request, 'restore', 'SalesLead', "Obnova leadu: {$lead->subject_name}", $lead->id);
        return response()->json(new SalesLeadResource($lead));
    }

    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $count = SalesLead::onlyTrashed()->count();
        SalesLead::onlyTrashed()->forceDelete();
        $this->logAction($request, 'force_delete_all', 'SalesLead', "Smazání koše leadů. Počet: $count");
        return response()->json(null, 204);
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();
            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'SalesLead',
                'affected_entity_id' => $affectedId,
                'user_login_id' => $user?->user_login_id,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_login_id_plain' => (string)($user?->user_login_id ?? '0'),
                'user_login_email_plain' => $user?->user_email ?? 'system'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (SalesLead): " . $e->getMessage());
        }
    }
}