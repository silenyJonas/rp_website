<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use App\Models\BusinessLog;
use Illuminate\Http\Request;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use App\Http\Requests\UpdateRawRequestCommissionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class RawRequestCommissionController extends Controller
{
    /**
     * Získání seznamu požadavků na provize s podporou filtrování, řazení a paginace.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Získání parametrů s použitím názvů, které jsou kompatibilní s Angular frontendem
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $contactEmail = $request->input('contact_email');
        $contactPhone = $request->input('contact_phone');
        $thema = $request->input('thema');
        $orderDescription = $request->input('order_description');
        $id = $request->input('id');
        $createdAt = $request->input('created_at');
        $updatedAt = $request->input('updated_at');

        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = RawRequestCommission::query();

        // Pokud je `onlyTrashed` true, načti pouze smazané záznamy.
        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        // Filtrování podle klíčového slova ve více polích
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('thema', 'like', '%' . $search . '%')
                    ->orWhere('order_description', 'like', '%' . $search . '%')
                    ->orWhere('contact_email', 'like', '%' . $search . '%')
                    ->orWhere('contact_phone', 'like', '%' . $search . '%');
            });
        }
        
        // Samostatné filtrování pro každé pole
        if ($id) {
            $query->where('id', $id);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($contactEmail) {
            $query->where('contact_email', 'like', '%' . $contactEmail . '%');
        }

        if ($contactPhone) {
            $query->where('contact_phone', 'like', '%' . $contactPhone . '%');
        }
        
        if ($thema) {
            $query->where('thema', 'like', '%' . $thema . '%');
        }

        if ($orderDescription) {
            $query->where('order_description', 'like', '%' . $orderDescription . '%');
        }
        
        // NOVÁ LOGIKA pro filtrování POUZE podle dne created_at a updated_at
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

        // Kvůli chybějícím vazbám nenačítáme žádné relace
        // $query->with(['user', 'commissionDetails', 'rawRequestAttachments']);

        if ($noPagination) {
            $commissions = $query->get();
        } else {
            $commissions = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return response()->json($commissions);
    }

    /**
     * Uložení nového požadavku.
     *
     * @param StoreRawRequestCommissionRequest $request
     * @return JsonResponse
     */
    public function store(StoreRawRequestCommissionRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
        $validatedData['status'] = $validatedData['status'] ?? 'Nově zadané';
        $validatedData['priority'] = $validatedData['priority'] ?? 'Nízká';
        $commission = RawRequestCommission::create($validatedData);

        // Zde dochází k logování akce pro uložení nového požadavku.
        // Metoda logAction je volána s typem události 'create' a id nově vytvořeného záznamu.
        $this->logAction($request, 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', $commission->id);

        return response()->json($commission, 201);
    }

    /**
     * Zobrazení konkrétního požadavku.
     *
     * @param RawRequestCommission $rawRequestCommission
     * @return JsonResponse
     */
    public function show(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        return response()->json($rawRequestCommission);
    }

    /**
     * Zobrazení detailů konkrétního požadavku s navázanými daty.
     *
     * @param RawRequestCommission $rawRequestCommission
     * @return JsonResponse
     */
    public function showDetails(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        // Vytvoření pole s požadovanými sloupci
        $selectedData = [
            'id' => $rawRequestCommission->id,
            'thema' => $rawRequestCommission->thema,
            'contact_email' => $rawRequestCommission->contact_email,
            'contact_phone' => $rawRequestCommission->contact_phone,
            'order_description' => $rawRequestCommission->order_description,
            'status' => $rawRequestCommission->status,
            'priority' => $rawRequestCommission->priority,
            'created_at' => $rawRequestCommission->created_at,
            'updated_at' => $rawRequestCommission->updated_at,
            'note' => $rawRequestCommission->note,
        ];

        return response()->json($selectedData);
    }

    /**
     * Aktualizace konkrétního požadavku.
     *
     * @param UpdateRawRequestCommissionRequest $request
     * @param RawRequestCommission $rawRequestCommission
     * @return JsonResponse
     */
    public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
    {
        $rawRequestCommission->update($request->validated());

        // Zde dochází k logování akce pro aktualizaci požadavku.
        $this->logAction($request, 'update', 'RawRequestCommission', 'Aktualizace požadavku na provizi', $rawRequestCommission->id);

        return response()->json($rawRequestCommission);
    }

    /**
     * Smazání nebo trvalé smazání požadavku.
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
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);

        if ($forceDelete) {
            $rawRequestCommission->forceDelete();
            // Zde dochází k logování pro trvalé smazání
            $this->logAction($request, 'hard_delete', 'RawRequestCommission', 'Trvalé smazání požadavku na provizi', $id);
        } else {
            $rawRequestCommission->delete();
            // Zde dochází k logování pro soft smazání
            $this->logAction($request, 'soft_delete', 'RawRequestCommission', 'Soft smazání požadavku na provizi', $id);
        }

        return response()->json(null, 204);
    }

    /**
     * Obnova smazaného požadavku.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);
        $rawRequestCommission->restore();
        
        // Zde dochází k logování pro obnovení záznamu.
        $this->logAction(request(), 'restore', 'RawRequestCommission', 'Obnova smazaného požadavku na provizi', $rawRequestCommission->id);

        return response()->json($rawRequestCommission);
    }

    /**
     * Trvalé smazání všech smazaných požadavků.
     *
     * @return JsonResponse
     */
    public function forceDeleteAllTrashed(): JsonResponse
    {
        try {
            $count = RawRequestCommission::onlyTrashed()->count();
            RawRequestCommission::onlyTrashed()->forceDelete();
            
            // Zde dochází k logování pro hromadné smazání
            $this->logAction(request(), 'force_delete_all', 'RawRequestCommission', "Trvalé smazání všech smazaných požadavků na provize. Počet: {$count}");

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ukládá akci do business logu.
     *
     * @param Request $request
     * @param string $eventType
     * @param string $module
     * @param string $description
     * @param int|null $affectedEntityId
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null)
    {
        try {
            // Používáme operátor null-safe pro bezpečný přístup k user_login_id.
            // Pokud je $request->user() null (nepřihlášený uživatel), celý výraz vyhodnotí na null.
            // Tím se zabrání chybě a zároveň se správně zaznamená, že akci provedl neautentizovaný uživatel.
            $userLoginId = $request->user()?->user_login_id;

            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'RawRequestCommission',
                'affected_entity_id' => $affectedEntityId,
                'user_login_id' => $userLoginId,
                'context_data' => json_encode($request->all()),
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při logování akce: ' . $e->getMessage());
        }
    }
}
