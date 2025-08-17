<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class BusinessLogController extends Controller
{
    /**
     * Získání seznamu business logů s podporou filtrování, řazení a paginace.
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

        $businessLogId = $request->input('business_log_id');
        $createdAt = $request->input('created_at');
        $origin = $request->input('origin');
        $eventType = $request->input('event_type');
        $module = $request->input('module');
        $description = $request->input('description');
        $affectedEntityType = $request->input('affected_entity_type');
        $affectedEntityId = $request->input('affected_entity_id');
        $userLoginId = $request->input('user_login_id');
        $userEmail = $request->input('user_email');
        $contextData = $request->input('context_data');
        
        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = BusinessLog::query();

        // Samostatné filtrování pro každé pole
        if ($businessLogId) {
            $query->where('business_log_id', $businessLogId);
        }

        // Oprava: Filtrování podle data vytvoření. Pokud je vstupní hodnota pouze den, filtrujeme podle dne.
        if ($createdAt) {
            // Zkontrolujeme, zda se jedná o datum nebo jen den
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $createdAt)) {
                $query->whereDate('created_at', '=', $createdAt);
            } else {
                $query->whereDay('created_at', '=', $createdAt);
            }
        }
        
        if ($origin) {
            $query->where('origin', 'like', '%' . $origin . '%');
        }
        
        if ($eventType) {
            $query->where('event_type', $eventType);
        }

        if ($module) {
            $query->where('module', 'like', '%' . $module . '%');
        }

        if ($description) {
            $query->where('description', 'like', '%' . $description . '%');
        }
        
        if ($affectedEntityType) {
            $query->where('affected_entity_type', 'like', '%' . $affectedEntityType . '%');
        }

        if ($affectedEntityId) {
            $query->where('affected_entity_id', $affectedEntityId);
        }

        // Vylepšení filtrování uživatele
        if ($userLoginId) {
            $query->where('user_login_id', $userLoginId);
        }
        
        if ($userEmail) {
            $query->whereHas('user', function ($q) use ($userEmail) {
                $q->where('user_email', 'like', '%' . $userEmail . '%');
            });
        }
        
        if ($contextData) {
            $query->where('context_data', 'like', '%' . $contextData . '%');
        }
        
        // Kód pro řazení
        if ($sortBy) {
            $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
            
            // Speciální ošetření pro řazení podle user.user_email
            if ($sortBy === 'user.user_email') {
                $query->leftJoin('user_logins', 'business_logs.user_login_id', '=', 'user_logins.user_login_id')
                      ->orderBy('user_logins.user_email', $sortDirection)
                      ->select('business_logs.*'); // Zajištění, že vybíráme sloupce z původní tabulky
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }
        } else {
            $query->latest('business_log_id');
        }
        
        // Načítání relace s UserLogin pro zobrazení emailu v logu
        $query->with('user');

        if ($noPagination) {
            $logs = $query->get();
        } else {
            $logs = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return response()->json($logs);
    }

    /**
     * Zobrazení detailů konkrétního logu s navázanými daty.
     *
     * @param BusinessLog $businessLog
     * @return JsonResponse
     */
    public function showDetails(BusinessLog $businessLog): JsonResponse
    {
        // Načtení relace 'user'
        $businessLog->load('user');

        // Vytvoření pole s požadovanými sloupci
        $selectedData = [
            'business_log_id' => $businessLog->business_log_id,
            'origin' => $businessLog->origin,
            'event_type' => $businessLog->event_type,
            'module' => $businessLog->module,
            'description' => $businessLog->description,
            'affected_entity_type' => $businessLog->affected_entity_type,
            'affected_entity_id' => $businessLog->affected_entity_id,
            'user' => [
                'user_login_id' => $businessLog->user_login_id,
                'user_email' => $businessLog->user ? $businessLog->user->user_email : 'Neznámý uživatel'
            ],
            'context_data' => $businessLog->context_data,
            'created_at' => $businessLog->created_at,
            'updated_at' => $businessLog->updated_at,
        ];

        return response()->json($selectedData);
    }

    /**
     * Uloží nový záznam do business logu.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validace vstupních dat
        $validatedData = $request->validate([
            'origin' => 'required|string|max:255',
            'event_type' => 'required|string|max:50',
            'module' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'affected_entity_type' => 'nullable|string|max:50',
            'affected_entity_id' => 'nullable|integer',
            'context_data' => 'nullable|string',
        ]);

        // Získání user_login_id z ověřeného požadavku.
        // Toto je klíčový krok, kdy získáme ID z JWT tokenu
        // a NE ze vstupních dat od frontendu.
        $userId = $request->user()->user_login_id; // Předpokládá, že user() získá ID z tokenu

        // Vytvoření nového záznamu v logu
        try {
            BusinessLog::create([
                'origin' => $validatedData['origin'],
                'event_type' => $validatedData['event_type'],
                'module' => $validatedData['module'],
                'description' => $validatedData['description'],
                'affected_entity_type' => $validatedData['affected_entity_type'],
                'affected_entity_id' => $validatedData['affected_entity_id'],
                'user_login_id' => $userId,
                'context_data' => $validatedData['context_data'],
            ]);

            return response()->json(['message' => 'Logovací záznam úspěšně vytvořen.'], 201);
        } catch (\Exception $e) {
            // Logování chyby do systémového logu
            Log::error('Chyba při vytváření business logu: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json(['message' => 'Nepodařilo se vytvořit logovací záznam.', 'error' => $e->getMessage()], 500);
        }
    }
}
