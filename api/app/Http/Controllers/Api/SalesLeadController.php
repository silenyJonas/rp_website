<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesLead;
use App\Models\BusinessLog;
use App\Http\Resources\SalesLeadResource; // Předpokládám existenci Resource
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SalesLeadController extends Controller
{
    /**
     * Seznam obchodních leadů s filtrací.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = SalesLead::query();
        
        // Zpracování koše
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // --- FILTRACE ---

        // Fulltextové vyhledávání (napříč klíčovými poli)
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('subject_name', 'like', "%$s%")
                ->orWhere('contact_person', 'like', "%$s%")
                ->orWhere('contact_email', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        // Filtry na přesnou shodu (Selecty z tvého Angular configu)
        foreach (['id', 'status', 'priority', 'source_channel'] as $f) {
            if ($request->filled($f)) {
                $query->where($f, $request->input($f));
            }
        }

        // Filtry na LIKE vyhledávání (Textová pole)
        foreach (['subject_name', 'contact_person', 'contact_email', 'contact_phone', 'location', 'salesman_name'] as $f) {
            if ($request->filled($f)) {
                $query->where($f, 'like', '%' . $request->input($f) . '%');
            }
        }

        // Filtry na datum
        if ($request->filled('created_at')) $query->whereDate('created_at', $request->created_at);
        if ($request->filled('last_contact_date')) $query->whereDate('last_contact_date', $request->last_contact_date);

        // --- ŘAZENÍ ---
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = in_array(strtolower($request->input('sort_direction')), ['asc', 'desc']) 
            ? $request->input('sort_direction') 
            : 'desc';
        
        $query->orderBy($sortBy, $sortDirection);

        // --- EXEKUCE ---
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return response()->json(SalesLeadResource::collection($data));
        }

        return response()->json([
            'data'         => SalesLeadResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nového leadu.
     */
    public function store(Request $request): JsonResponse
    {
        // Poznámka: Zde můžeš použít StoreSalesLeadRequest pro validaci
        $validated = $request->validate([
            'subject_name' => 'required|string|max:255',
            'status'       => 'required|string',
            'priority'     => 'required|string',
            'source_channel' => 'required|string',
            // ... další pole dle potřeby
        ]);
        
        $lead = SalesLead::create($validated);
        
        $this->logAction($request, 'create', 'SalesLead', "Vytvořen nový lead: {$lead->subject_name}", $lead->id);
        
        return response()->json(new SalesLeadResource($lead), 201);
    }

    /**
     * Detail leadu.
     */
    public function show($id): JsonResponse
    {
        $lead = SalesLead::withTrashed()->findOrFail($id);
        return response()->json(new SalesLeadResource($lead));
    }

    /**
     * Aktualizace leadu.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $lead = SalesLead::findOrFail($id);
        $lead->update($request->all());
        
        $this->logAction($request, 'update', 'SalesLead', "Aktualizace leadu ID: {$lead->id} ({$lead->subject_name})", $lead->id);
        
        return response()->json(new SalesLeadResource($lead));
    }

    /**
     * Smazání (Soft / Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = SalesLead::withTrashed()->findOrFail($id);
        
        $forceDelete ? $item->forceDelete() : $item->delete();
        
        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'SalesLead', "Smazání leadu ID: $id", $id);

        return response()->json(null, 204);
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        $item = SalesLead::withTrashed()->findOrFail($id);
        $item->restore();
        
        $this->logAction($request, 'restore', 'SalesLead', "Obnova leadu ID: $id", $id);
        
        return response()->json(new SalesLeadResource($item));
    }

    /**
     * Vyprázdnění koše (Vysypat koš).
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $count = SalesLead::onlyTrashed()->count();
        SalesLead::onlyTrashed()->forceDelete();
        
        $this->logAction($request, 'force_delete_all', 'SalesLead', "Hromadné smazání koše leadů. Počet: $count");
        
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
                'affected_entity_type' => 'SalesLead',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'System/Automated'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (SalesLead): " . $e->getMessage());
        }
    }
}