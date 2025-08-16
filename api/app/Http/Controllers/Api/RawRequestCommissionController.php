<?php

// namespace App\Http\Controllers\Api;
// use App\Http\Controllers\Controller;
// use App\Models\RawRequestCommission;
// use Illuminate\Http\Request;
// use App\Http\Requests\StoreRawRequestCommissionRequest;
// use App\Http\Requests\UpdateRawRequestCommissionRequest;
// use Illuminate\Http\JsonResponse;
// class RawRequestCommissionController extends Controller
// {
//     public function index(Request $request): JsonResponse
// {
//     $perPage = $request->input('per_page', 15);
//     $page = $request->input('page', 1);
//     $noPagination = $request->input('no_pagination', false);
//     $onlyTrashed = $request->input('only_trashed', false);

//     $search = $request->input('search');
//     $status = $request->input('status');
//     $priority = $request->input('priority');
//     $email = $request->input('email');
//     $sortBy = $request->input('sort_by');
//     $sortDirection = $request->input('sort_direction', 'asc');

//     $query = RawRequestCommission::query();

//     if ($onlyTrashed) {
//         $query->onlyTrashed();
//     }

//     if ($search) {
//         $query->where(function ($q) use ($search) {
//             $q->where('thema', 'like', '%' . $search . '%')
//                 ->orWhere('order_description', 'like', '%' . $search . '%')
//                 ->orWhere('contact_email', 'like', '%' . $search . '%')
//                 ->orWhere('contact_phone', 'like', '%' . $search . '%');
//         });
//     }

//     if ($status) {
//         $query->where('status', $status);
//     }

//     if ($priority) {
//         $query->where('priority', $priority);
//     }

//     if ($email) {
//         $query->where('contact_email', 'like', '%' . $email . '%');
//     }

//     // NOVÝ KÓD PRO ŘAZENÍ
//     if ($sortBy) {
//         // Kontrola, zda je směr řazení platný
//         $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';
//         $query->orderBy($sortBy, $sortDirection);
//     } else {
//         // Výchozí řazení, pokud není zadáno žádné
//         $query->latest();
//     }
//     // KONEC NOVÉHO KÓDU

//     if ($noPagination) {
//         $commissions = $query->get();
//     } else {
//         $commissions = $query->paginate($perPage, ['*'], 'page', $page);
//     }

//     return response()->json($commissions);
// }

//     public function store(StoreRawRequestCommissionRequest $request): JsonResponse
//     {
//         $validatedData = $request->validated();

//         if (!isset($validatedData['status'])) {
//             $validatedData['status'] = 'Nově zadané';
//         }
        
//         if (!isset($validatedData['priority'])) {
//             $validatedData['priority'] = 'Nízká';
//         }

//         $commission = RawRequestCommission::create($validatedData);

//         return response()->json($commission, 201);
//     }

//     public function show(RawRequestCommission $rawRequestCommission): JsonResponse
//     {
//         return response()->json($rawRequestCommission);
//     }

//     public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
//     {
//         $rawRequestCommission->update($request->validated());
//         return response()->json($rawRequestCommission);
//     }

//     public function destroy(Request $request, $id): JsonResponse
//     {
//         // Přidáno: Ověření, že $id je validní číslo, pro prevenci chyb 500.
//         if (!is_numeric($id)) {
//             return response()->json(['message' => 'Invalid ID format.'], 404);
//         }

//         $forceDelete = $request->input('force_delete', false);
//         $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);

//         if ($forceDelete) {
//             $rawRequestCommission->forceDelete();
//         } else {
//             $rawRequestCommission->delete();
//         }

//         return response()->json(null, 204);
//     }

//     public function restore(int $id): JsonResponse
//     {
//         $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);
//         $rawRequestCommission->restore();
//         return response()->json($rawRequestCommission);
//     }

//     public function forceDeleteAllTrashed(): JsonResponse
//     {
//         try {
//             RawRequestCommission::onlyTrashed()->forceDelete();
//             return response()->json(null, 204);
//         } catch (\Exception $e) {
//             // Logování chyby pro snadnější debugování
//             \Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
//             return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
//         }
//     }
// }


// namespace App\Http\Controllers\Api;
// use App\Http\Controllers\Controller;
// use App\Models\RawRequestCommission;
// use Illuminate\Http\Request;
// use App\Http\Requests\StoreRawRequestCommissionRequest;
// use App\Http\Requests\UpdateRawRequestCommissionRequest;
// use Illuminate\Http\JsonResponse;
// class RawRequestCommissionController extends Controller
// {
//     /**
//      * Získání seznamu provizí s podporou paginace a filtrování.
//      *
//      * @param Request $request
//      * @return JsonResponse
//      */
//     public function index(Request $request): JsonResponse
//     {
//         // Získání parametrů s použitím názvů, které jsou kompatibilní s Angular frontendem
//         $perPage = $request->input('per_page', 15);
//         $page = $request->input('page', 1);
//         $noPagination = $request->input('no_pagination', false);
//         $onlyTrashed = $request->input('only_trashed', false);

//         $search = $request->input('search');
//         $status = $request->input('status');
//         $priority = $request->input('priority');
//         $contactEmail = $request->input('contact_email'); // Změněno z 'email'
//         $contactPhone = $request->input('contact_phone'); // Přidáno pro samostatné filtrování
//         $thema = $request->input('thema'); // Přidáno pro samostatné filtrování
//         $orderDescription = $request->input('order_description'); // Přidáno pro samostatné filtrování
//         $sortBy = $request->input('sort_by'); // Změněno z 'sortBy' pro shodu s Angular
//         $sortDirection = $request->input('sort_direction', 'asc'); // Změněno z 'sortDirection'

//         $query = RawRequestCommission::query();

//         // Pokud je `onlyTrashed` true, načti pouze smazané záznamy.
//         // Jinak (a to je výchozí stav) SoftDeletes automaticky odfiltruje smazané záznamy.
//         if ($onlyTrashed) {
//             $query->onlyTrashed();
//         }

//         // Filtrování podle klíčového slova ve více polích
//         if ($search) {
//             $query->where(function ($q) use ($search) {
//                 $q->where('thema', 'like', '%' . $search . '%')
//                     ->orWhere('order_description', 'like', '%' . $search . '%')
//                     ->orWhere('contact_email', 'like', '%' . $search . '%')
//                     ->orWhere('contact_phone', 'like', '%' . $search . '%');
//             });
//         }
        
//         // Samostatné filtrování pro každé pole
//         if ($status) {
//             $query->where('status', $status);
//         }

//         if ($priority) {
//             $query->where('priority', $priority);
//         }

//         if ($contactEmail) {
//             $query->where('contact_email', 'like', '%' . $contactEmail . '%');
//         }

//         if ($contactPhone) {
//             $query->where('contact_phone', 'like', '%' . $contactPhone . '%');
//         }
        
//         if ($thema) {
//             $query->where('thema', 'like', '%' . $thema . '%');
//         }

//         if ($orderDescription) {
//             $query->where('order_description', 'like', '%' . $orderDescription . '%');
//         }

//         // Kód pro řazení
//         if ($sortBy) {
//             // Kontrola, zda je směr řazení platný
//             $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';
//             $query->orderBy($sortBy, $sortDirection);
//         } else {
//             // Výchozí řazení podle data vytvoření
//             $query->latest();
//         }

//         if ($noPagination) {
//             $commissions = $query->get();
//         } else {
//             $commissions = $query->paginate($perPage, ['*'], 'page', $page);
//         }

//         return response()->json($commissions);
//     }

//     public function store(StoreRawRequestCommissionRequest $request): JsonResponse
//     {
//         $validatedData = $request->validated();

//         if (!isset($validatedData['status'])) {
//             $validatedData['status'] = 'Nově zadané';
//         }
        
//         if (!isset($validatedData['priority'])) {
//             $validatedData['priority'] = 'Nízká';
//         }

//         $commission = RawRequestCommission::create($validatedData);

//         return response()->json($commission, 201);
//     }

//     public function show(RawRequestCommission $rawRequestCommission): JsonResponse
//     {
//         return response()->json($rawRequestCommission);
//     }

//     public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
//     {
//         $rawRequestCommission->update($request->validated());
//         return response()->json($rawRequestCommission);
//     }

//     public function destroy(Request $request, $id): JsonResponse
//     {
//         // Přidáno: Ověření, že $id je validní číslo, pro prevenci chyb 500.
//         if (!is_numeric($id)) {
//             return response()->json(['message' => 'Invalid ID format.'], 404);
//         }

//         $forceDelete = $request->input('force_delete', false);
//         $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);

//         if ($forceDelete) {
//             $rawRequestCommission->forceDelete();
//         } else {
//             $rawRequestCommission->delete();
//         }

//         return response()->json(null, 204);
//     }

//     public function restore(int $id): JsonResponse
//     {
//         $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);
//         $rawRequestCommission->restore();
//         return response()->json($rawRequestCommission);
//     }

//     public function forceDeleteAllTrashed(): JsonResponse
//     {
//         try {
//             RawRequestCommission::onlyTrashed()->forceDelete();
//             return response()->json(null, 204);
//         } catch (\Exception $e) {
//             // Logování chyby pro snadnější debugování
//             \Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
//             return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
//         }
//     }
// }

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use Illuminate\Http\Request;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use App\Http\Requests\UpdateRawRequestCommissionRequest;
use Illuminate\Http\JsonResponse;
class RawRequestCommissionController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        // Získání parametrů s použitím názvů, které jsou kompatibilní s Angular frontendem
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = $request->input('no_pagination', false);
        $onlyTrashed = $request->input('only_trashed', false);

        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $contactEmail = $request->input('contact_email'); // Změněno z 'email'
        $contactPhone = $request->input('contact_phone'); // Přidáno pro samostatné filtrování
        $thema = $request->input('thema'); // Přidáno pro samostatné filtrování
        $orderDescription = $request->input('order_description'); // Přidáno pro samostatné filtrování
        $sortBy = $request->input('sort_by'); // Změněno z 'sortBy' pro shodu s Angular
        $sortDirection = $request->input('sort_direction', 'asc'); // Změněno z 'sortDirection'
        $id = $request->input('id'); // NOVÝ FILTR: Načtení ID z požadavku

        $query = RawRequestCommission::query();

        // Pokud je `onlyTrashed` true, načti pouze smazané záznamy.
        // Jinak (a to je výchozí stav) SoftDeletes automaticky odfiltruje smazané záznamy.
        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        // NOVÝ FILTR: Podpora vyhledávání podle ID
        if ($id) {
            $query->where('id', $id);
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

        // Kód pro řazení
        if ($sortBy) {
            // Kontrola, zda je směr řazení platný
            $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';
            $query->orderBy($sortBy, $sortDirection);
        } else {
            // Výchozí řazení podle data vytvoření
            $query->latest();
        }

        if ($noPagination) {
            $commissions = $query->get();
        } else {
            $commissions = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return response()->json($commissions);
    }

    public function store(StoreRawRequestCommissionRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        if (!isset($validatedData['status'])) {
            $validatedData['status'] = 'Nově zadané';
        }
        
        if (!isset($validatedData['priority'])) {
            $validatedData['priority'] = 'Nízká';
        }

        $commission = RawRequestCommission::create($validatedData);

        return response()->json($commission, 201);
    }

    public function show(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        return response()->json($rawRequestCommission);
    }

    public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
    {
        $rawRequestCommission->update($request->validated());
        return response()->json($rawRequestCommission);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        // Přidáno: Ověření, že $id je validní číslo, pro prevenci chyb 500.
        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid ID format.'], 404);
        }

        $forceDelete = $request->input('force_delete', false);
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);

        if ($forceDelete) {
            $rawRequestCommission->forceDelete();
        } else {
            $rawRequestCommission->delete();
        }

        return response()->json(null, 204);
    }

    public function restore(int $id): JsonResponse
    {
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);
        $rawRequestCommission->restore();
        return response()->json($rawRequestCommission);
    }

    public function forceDeleteAllTrashed(): JsonResponse
    {
        try {
            RawRequestCommission::onlyTrashed()->forceDelete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            // Logování chyby pro snadnější debugování
            \Log::error('Chyba při hromadném trvalém mazání: ' . $e->getMessage());
            return response()->json(['message' => 'Něco se pokazilo.', 'error' => $e->getMessage()], 500);
        }
    }
}
