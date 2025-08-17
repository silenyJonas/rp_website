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

        $search = $request->input('search');
        $eventType = $request->input('event_type');
        $module = $request->input('module');
        $origin = $request->input('origin');
        $userLoginId = $request->input('user_login_id');
        $id = $request->input('id');
        $createdAt = $request->input('created_at');
        
        $sortBy = $request->input('sort_by');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = BusinessLog::query();

        // Filtrování podle klíčového slova ve více polích
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('origin', 'like', '%' . $search . '%')
                    ->orWhere('event_type', 'like', '%' . $search . '%')
                    ->orWhere('module', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }
        
        // Samostatné filtrování pro každé pole
        if ($id) {
            $query->where('business_log_id', $id);
        }

        if ($eventType) {
            $query->where('event_type', $eventType);
        }

        if ($module) {
            $query->where('module', $module);
        }

        if ($origin) {
            $query->where('origin', 'like', '%' . $origin . '%');
        }

        if ($userLoginId) {
            $query->where('user_login_id', $userLoginId);
        }
        
        // Filtrování podle dne vytvoření
        if ($createdAt) {
            $query->whereDate('created_at', '=', $createdAt);
        }

        // Kód pro řazení
        if ($sortBy) {
            $sortDirection = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';
            // Pamatujte, že `id` v tomto modelu je 'business_log_id'
            $sortBy = ($sortBy === 'id') ? 'business_log_id' : $sortBy;
            $query->orderBy($sortBy, $sortDirection);
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
