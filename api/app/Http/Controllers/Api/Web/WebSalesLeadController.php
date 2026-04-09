<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Web\WebSalesLead;
use App\Models\Web\WebLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\Web\WebSalesLead\StoreWebSalesLeadRequest;
use App\Http\Resources\Web\WebSalesLeadResource;

class WebSalesLeadController extends Controller
{
    /**
     * Seznam obchodních leadů s filtrací.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = WebSalesLead::query();
        
        // Zpracování koše
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // --- FILTRACE ---
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('subject_name', 'like', "%$s%")
                ->orWhere('contact_person', 'like', "%$s%")
                ->orWhere('contact_email', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        foreach (['id', 'status', 'priority', 'source_channel'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }

        foreach (['subject_name', 'contact_person', 'contact_email', 'contact_phone', 'location', 'salesman_name'] as $f) {
            if ($request->filled($f)) $query->where($f, 'like', '%' . $request->input($f) . '%');
        }

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
        
        // Logování exportu (pokud je no_pagination true)
        if ($noPagination) {
            $this->logAction($request, 'export', 'WebSalesLead', "Hromadný export obchodních leadů.");
            $data = $query->get();
            return response()->json(WebSalesLeadResource::collection($data));
        }

        $data = $query->paginate($perPage);

        return response()->json([
            'data'         => WebSalesLeadResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nového leadu.
     */
    public function store(StoreWebSalesLeadRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user() ?? auth('sanctum')->user();

            if (empty($validated['salesman_name']) && $user) {
                $validated['salesman_name'] = $user->full_name ?? $user->user_email;
            }

            if (empty($validated['user_id']) && $user) {
                $validated['user_id'] = $user->id;
            }

            $lead = WebSalesLead::create($validated);
            
            $this->logAction($request, 'create', 'WebSalesLead', "Vytvořen nový lead: {$lead->subject_name}", $lead->id);
            
            return response()->json(new WebSalesLeadResource($lead), 201);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebSalesLead', "Chyba při vytváření leadu: " . $e->getMessage());
            return response()->json(['message' => 'Vytvoření leadu selhalo.'], 500);
        }
    }

    /**
     * Detail leadu.
     */
    public function show($id): JsonResponse
    {
        $lead = WebSalesLead::withTrashed()->findOrFail($id);
        return response()->json(new WebSalesLeadResource($lead));
    }

    /**
     * Aktualizace leadu.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $lead = WebSalesLead::findOrFail($id);
            $lead->update($request->all());
            
            $this->logAction($request, 'update', 'WebSalesLead', "Aktualizace leadu ID: {$lead->id} ({$lead->subject_name})", $lead->id);
            
            return response()->json(new WebSalesLeadResource($lead));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebSalesLead', "Chyba při aktualizaci leadu ID {$id}: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Aktualizace leadu selhala.'], 500);
        }
    }

    /**
     * Smazání (Soft / Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $item = WebSalesLead::withTrashed()->findOrFail($id);
            
            $forceDelete ? $item->forceDelete() : $item->delete();
            
            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'WebSalesLead', "Smazání leadu ID: $id", $id);

            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebSalesLead', "Chyba při mazání leadu ID $id: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Smazání leadu selhalo.'], 500);
        }
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $item = WebSalesLead::withTrashed()->findOrFail($id);
            $item->restore();
            
            $this->logAction($request, 'restore', 'WebSalesLead', "Obnova leadu ID: $id", $id);
            
            return response()->json(new WebSalesLeadResource($item));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebSalesLead', "Chyba při obnově leadu ID $id: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Obnova leadu selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše (Vysypat koš).
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        try {
            $count = WebSalesLead::onlyTrashed()->count();
            WebSalesLead::onlyTrashed()->forceDelete();
            
            $this->logAction($request, 'force_delete_all', 'WebSalesLead', "Hromadné smazání koše leadů. Počet: $count");
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebSalesLead', "Chyba při vyprazdňování koše leadů: " . $e->getMessage());
            return response()->json(['message' => 'Vysypání koše selhalo.'], 500);
        }
    }
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();

            WebLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'WebSalesLead',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_plain'     => $user?->user_email ?? 'System/Automated'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (WebSalesLead): " . $e->getMessage());
        }
    }
    /**
     * Sjednocené logování (WebLog).
     */
   
}