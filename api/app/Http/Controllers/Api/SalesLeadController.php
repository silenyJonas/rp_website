<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesLead;
use App\Models\BusinessLog;
use Illuminate\Http\Request;
use App\Http\Requests\StoreSalesLeadRequest;
use App\Http\Requests\UpdateSalesLeadRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SalesLeadController extends Controller
{
    /**
     * Získání seznamu leadů s podporou filtrování, řazení a paginace.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $search = $request->input('search');
        $id = $request->input('id');
        $subjectName = $request->input('subject_name');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $location = $request->input('location');
        $salesmanName = $request->input('salesman_name');
        $contactEmail = $request->input('contact_email');
        $contactPhone = $request->input('contact_phone');
        $contactOther = $request->input('contact_other');
        $createdAt = $request->input('created_at');
        $updatedAt = $request->input('updated_at');

        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = SalesLead::query();

        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        // Filtrování podle klíčového slova ve více polích
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('subject_name', 'like', '%' . $search . '%')
                    ->orWhere('contact_email', 'like', '%' . $search . '%')
                    ->orWhere('contact_person', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Samostatné filtrování
        if ($id) $query->where('id', $id);
        if ($subjectName) $query->where('subject_name', 'like', '%' . $subjectName . '%');
        if ($status) $query->where('status', $status);
        if ($priority) $query->where('priority', $priority);
        if ($location) $query->where('location', 'like', '%' . $location . '%');
        if ($salesmanName) $query->where('salesman_name', 'like', '%' . $salesmanName . '%');
        if ($contactEmail) $query->where('contact_email', 'like', '%' . $contactEmail . '%');
        if ($contactPhone) $query->where('contact_phone', 'like', '%' . $contactPhone . '%');
        if ($contactOther) $query->where('contact_other', 'like', '%' . $contactOther . '%');

        if ($createdAt) {
            $query->whereDate('created_at', '=', $createdAt);
        }

        if ($updatedAt) {
            $query->whereDate('updated_at', '=', $updatedAt);
        }

        // Řazení
        if ($sortBy) {
            $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }

        if ($noPagination) {
            $leads = $query->get();
        } else {
            $leads = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return response()->json($leads);
    }

    /**
     * Uložení nového leadu.
     */
    public function store(StoreSalesLeadRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
        
        // Automatické doplnění obchodníka z identity uživatele
        $user = $request->user();
        $validatedData['user_login_id'] = $user->user_login_id;
        $validatedData['salesman_name'] = $user->user_email;

        $lead = SalesLead::create($validatedData);

        $this->logAction($request, 'create', 'SalesLead', "Vytvořen nový lead: {$lead->subject_name}", $lead->id);

        return response()->json($lead, 201);
    }

    /**
     * Zobrazení konkrétního leadu.
     */
    public function show(SalesLead $salesLead): JsonResponse
    {
        return response()->json($salesLead);
    }

    /**
     * Zobrazení detailů konkrétního leadu.
     */
    public function showDetails(SalesLead $salesLead): JsonResponse
    {
        return response()->json($salesLead);
    }

    /**
     * Aktualizace leadu.
     */
    public function update(UpdateSalesLeadRequest $request, SalesLead $salesLead): JsonResponse
    {
        $salesLead->update($request->validated());

        $this->logAction($request, 'update', 'SalesLead', "Aktualizace leadu: {$salesLead->subject_name}", $salesLead->id);

        return response()->json($salesLead);
    }

    /**
     * Smazání nebo trvalé smazání leadu.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid ID format.'], 404);
        }

        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $lead = SalesLead::withTrashed()->findOrFail($id);

        if ($forceDelete) {
            $lead->forceDelete();
            $this->logAction($request, 'hard_delete', 'SalesLead', "Trvalé smazání leadu ID: {$id}", $id);
        } else {
            $lead->delete();
            $this->logAction($request, 'soft_delete', 'SalesLead', "Soft smazání leadu: {$lead->subject_name}", $id);
        }

        return response()->json(null, 204);
    }

    /**
     * Obnova smazaného leadu.
     */
    public function restore(int $id): JsonResponse
    {
        $lead = SalesLead::withTrashed()->findOrFail($id);
        $lead->restore();
        
        $this->logAction(request(), 'restore', 'SalesLead', "Obnova smazaného leadu: {$lead->subject_name}", $lead->id);

        return response()->json($lead);
    }

    /**
     * Trvalé smazání všech smazaných leadů (Vysypání koše).
     */
    public function forceDeleteAllTrashed(): JsonResponse
    {
        try {
            $count = SalesLead::onlyTrashed()->count();
            SalesLead::onlyTrashed()->forceDelete();
            
            $this->logAction(request(), 'force_delete_all', 'SalesLead', "Trvalé smazání všech smazaných leadů. Počet: {$count}");

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Chyba při hromadném trvalém mazání leadů: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ukládá akci do business logu podle stanoveného patternu.
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null)
    {
        try {
            $userLoginId = $request->user()?->user_login_id;
            $userLoginEmail = $request->user()?->user_email;

            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'SalesLead',
                'affected_entity_id' => $affectedEntityId,
                'user_login_id' => $userLoginId,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_login_id_plain' => (string)($userLoginId ?? '0'),
                'user_login_email_plain' => $userLoginEmail ?? 'system'
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při logování akce SalesLead: ' . $e->getMessage());
        }
    }
}