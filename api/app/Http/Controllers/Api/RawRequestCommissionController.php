<?php

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\RawRequestCommission;
// use Illuminate\Http\Request;
// use App\Http\Requests\StoreRawRequestCommissionRequest;

// class RawRequestCommissionController extends Controller
// {
//     /**
//      * Zobrazí seznam všech provizí, včetně soft-deletnutých, pokud je požadováno.
//      *
//      * @param \Illuminate\Http\Request $request
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function index(Request $request)
//     {
//         $perPage = $request->input('per_page', 15);
//         $page = $request->input('page', 1);
//         $noPagination = $request->input('no_pagination', false);
//         $withTrashed = $request->input('with_trashed', false);
//         // Nový parametr pro načtení POUZE soft-deletnutých záznamů.
//         $onlyTrashed = $request->input('only_trashed', false); 

//         $search = $request->input('search');
//         $status = $request->input('status');
//         $priority = $request->input('priority');
//         $email = $request->input('email');

//         $query = RawRequestCommission::query();

//         // Podmínka pro zobrazení pouze soft-deletnutých záznamů.
//         // Tato logika byla upravena, aby správně ošetřovala parametr 'only_trashed'.
//         if ($onlyTrashed) {
//             $query->onlyTrashed();
//         } elseif ($withTrashed) {
//             // Původní logika pro zobrazení soft-deletnutých společně s aktivními.
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

//     /**
//      * Uloží nově vytvořenou provizi.
//      *
//      * @param \App\Http\Requests\StoreRawRequestCommissionRequest $request
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function store(StoreRawRequestCommissionRequest $request)
//     {
//         $validatedData = $request->validated();

//         $validatedData['status'] = 'Nově zadané';
//         $validatedData['priority'] = 'Nízká';

//         $commission = RawRequestCommission::create($validatedData);

//         return response()->json($commission, 201);
//     }

//     /**
//      * Zobrazí konkrétní provizi.
//      *
//      * @param \App\Models\RawRequestCommission $rawRequestCommission
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function show(RawRequestCommission $rawRequestCommission)
//     {
//         return response()->json($rawRequestCommission);
//     }

//     /**
//      * Aktualizuje existující provizi.
//      *
//      * @param \Illuminate\Http\Request $request
//      * @param \App\Models\RawRequestCommission $rawRequestCommission
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function update(Request $request, RawRequestCommission $rawRequestCommission)
//     {
//         $validatedData = $request->validate([
//             'thema' => 'sometimes|required|string|max:255',
//             'contact_email' => 'sometimes|required|email|max:255',
//             'contact_phone' => 'nullable|string|max:255',
//             'order_description' => 'sometimes|required|string|max:255',
//             'status' => 'sometimes|required|string|in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno',
//             'priority' => 'sometimes|required|string|in:Nízká,Neutrální,Vysoká',
//         ]);

//         $rawRequestCommission->update($validatedData);

//         return response()->json($rawRequestCommission);
//     }

//     /**
//      * Smaže provizi. Ve výchozím nastavení provede soft delete.
//      * Pro trvalé smazání (hard delete) použijte parametr ?force_delete=true.
//      *
//      * @param \Illuminate\Http\Request $request
//      * @param int $id
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function destroy(Request $request, int $id)
//     {
//         $forceDelete = $request->input('force_delete', false);
//         $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);

//         if ($forceDelete) {
//             $rawRequestCommission->forceDelete();
//         } else {
//             $rawRequestCommission->delete();
//         }

//         return response()->json(null, 204);
//     }
// }

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use Illuminate\Http\Request;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use Illuminate\Http\JsonResponse;

class RawRequestCommissionController extends Controller
{
    /**
     * Zobrazí zoznam všetkých provízií, vrátane soft-deletnutých, ak je požadované.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = $request->input('no_pagination', false);
        $withTrashed = $request->input('with_trashed', false);
        // Nový parameter pre načítanie POUZE soft-deletnutých záznamov.
        $onlyTrashed = $request->input('only_trashed', false); 

        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $email = $request->input('email');

        $query = RawRequestCommission::query();

        // Podmienka pre zobrazenie iba soft-deletnutých záznamov.
        if ($onlyTrashed) {
            $query->onlyTrashed();
        } elseif ($withTrashed) {
            // Pôvodná logika pre zobrazenie soft-deletnutých spoločne s aktívnymi.
            $query->withTrashed();
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
        
        if ($noPagination) {
            $commissions = $query->get();
        } else {
            $commissions = $query->paginate($perPage, ['*'], 'page', $page);
        }
        
        return response()->json($commissions);
    }

    /**
     * Uloží novo vytvorenú províziu.
     *
     * @param StoreRawRequestCommissionRequest $request
     * @return JsonResponse
     */
    public function store(StoreRawRequestCommissionRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $validatedData['status'] = 'Nově zadané';
        $validatedData['priority'] = 'Nízká';

        $commission = RawRequestCommission::create($validatedData);

        return response()->json($commission, 201);
    }

    /**
     * Zobrazí konkrétnu províziu.
     *
     * @param RawRequestCommission $rawRequestCommission
     * @return JsonResponse
     */
    public function show(RawRequestCommission $rawRequestCommission): JsonResponse
    {
        return response()->json($rawRequestCommission);
    }

    /**
     * Aktualizuje existujúcu províziu.
     *
     * @param Request $request
     * @param RawRequestCommission $rawRequestCommission
     * @return JsonResponse
     */
    public function update(Request $request, RawRequestCommission $rawRequestCommission): JsonResponse
    {
        $validatedData = $request->validate([
            'thema' => 'sometimes|required|string|max:255',
            'contact_email' => 'sometimes|required|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'order_description' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno',
            'priority' => 'sometimes|required|string|in:Nízká,Neutrální,Vysoká',
        ]);

        $rawRequestCommission->update($validatedData);

        return response()->json($rawRequestCommission);
    }

    /**
     * Smaže províziu. Vo východiskovom nastavení vykoná soft delete.
     * Pre trvalé zmazanie (hard delete) použite parameter ?force_delete=true.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $forceDelete = $request->input('force_delete', false);
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);

        if ($forceDelete) {
            $rawRequestCommission->forceDelete();
        } else {
            $rawRequestCommission->delete();
        }

        return response()->json(null, 204);
    }

    /**
     * Obnoví soft-deleted províziu.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        // Najde soft-deleted záznam pomocou withTrashed()
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);
        
        // Zavolá metódu restore() na obnovenie záznamu
        $rawRequestCommission->restore();
        
        return response()->json($rawRequestCommission);
    }
}
