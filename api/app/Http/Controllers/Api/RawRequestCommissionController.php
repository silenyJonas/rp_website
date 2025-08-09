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
//     {
//         $perPage = $request->input('per_page', 15);
//         $page = $request->input('page', 1);
//         $noPagination = $request->input('no_pagination', false);
//         $withTrashed = $request->input('with_trashed', false);
//         $onlyTrashed = $request->input('only_trashed', false);

//         $search = $request->input('search');
//         $status = $request->input('status');
//         $priority = $request->input('priority');
//         $email = $request->input('email');

//         $query = RawRequestCommission::query();
//         $query->latest();

//         if ($onlyTrashed) {
//             $query->onlyTrashed();
//         } elseif ($withTrashed) {
//             $query->withTrashed();
//         }

//         if ($search) {
//             $query->where(function ($q) use ($search) {
//                 $q->where('thema', 'like', '%' . $search . '%')
//                     ->orWhere('order_description', 'like', '%' . $search . '%')
//                     ->orWhere('contact_email', 'like', '%' . $search . '%')
//                     ->orWhere('contact_phone', 'like', '%' . $search . '%');
//             });
//         }

//         if ($status) {
//             $query->where('status', $status);
//         }

//         if ($priority) {
//             $query->where('priority', $priority);
//         }

//         if ($email) {
//             $query->where('contact_email', 'like', '%' . $email . '%');
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
    $perPage = $request->input('per_page', 15);
    $page = $request->input('page', 1);
    $noPagination = $request->input('no_pagination', false);
    $onlyTrashed = $request->input('only_trashed', false);

    $search = $request->input('search');
    $status = $request->input('status');
    $priority = $request->input('priority');
    $email = $request->input('email');
    $sortBy = $request->input('sort_by');
    $sortDirection = $request->input('sort_direction', 'asc');

    $query = RawRequestCommission::query();

    if ($onlyTrashed) {
        $query->onlyTrashed();
    }

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('thema', 'like', '%' . $search . '%')
                ->orWhere('order_description', 'like', '%' . $search . '%')
                ->orWhere('contact_email', 'like', '%' . $search . '%')
                ->orWhere('contact_phone', 'like', '%' . $search . '%');
        });
    }

    if ($status) {
        $query->where('status', $status);
    }

    if ($priority) {
        $query->where('priority', $priority);
    }

    if ($email) {
        $query->where('contact_email', 'like', '%' . $email . '%');
    }

    // NOVÝ KÓD PRO ŘAZENÍ
    if ($sortBy) {
        // Kontrola, zda je směr řazení platný
        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';
        $query->orderBy($sortBy, $sortDirection);
    } else {
        // Výchozí řazení, pokud není zadáno žádné
        $query->latest();
    }
    // KONEC NOVÉHO KÓDU

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
