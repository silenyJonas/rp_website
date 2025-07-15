<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RawRequestCommissionController extends Controller
{
    /**
     * Získá seznam záznamů RawRequestCommission s paginací a filtrováním.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Získáme počet položek na stránku z požadavku, výchozí je 15.
        $perPage = $request->input('per_page', 15);
        // Získáme aktuální stránku z požadavku, výchozí je 1.
        $page = $request->input('page', 1);

        // Získáme parametry filtru z požadavku
        $search = $request->input('search'); // Obecný vyhledávací text
        $status = $request->input('status'); // Filtr podle statusu
        $priority = $request->input('priority'); // Filtr podle priority
        $email = $request->input('email'); // Filtr podle emailu

        // Začneme dotaz na model
        $query = RawRequestCommission::query();

        // Aplikujeme filtry
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('thema', 'like', '%' . $search . '%')
                  ->orWhere('order_description', 'like', '%' . $search . '%')
                  ->orWhere('contact_email', 'like', '%' . $search . '%')
                  ->orWhere('contact_phone', 'like', '%' . $search . '%');
            });
            Log::info('Applying search filter.', ['search' => $search]);
        }

        if ($status) {
            $query->where('status', $status);
            Log::info('Applying status filter.', ['status' => $status]);
        }

        if ($priority) {
            $query->where('priority', $priority);
            Log::info('Applying priority filter.', ['priority' => $priority]);
        }

        if ($email) {
            $query->where('contact_email', 'like', '%' . $email . '%');
            Log::info('Applying email filter.', ['email' => $email]);
        }

        // Aplikujeme paginaci na filtrovaný dotaz.
        $commissions = $query->paginate($perPage, ['*'], 'page', $page);

        Log::info('Fetched paginated and filtered raw request commissions.', [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $commissions->total(),
            'filters' => ['search' => $search, 'status' => $status, 'priority' => $priority, 'email' => $email]
        ]);

        return response()->json($commissions);
    }

    /**
     * Uloží nový záznam RawRequestCommission.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'thema' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'order_description' => 'required|string',
            'status' => 'required|string|in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno',
            'priority' => 'required|string|in:Nízká,Neutrální,Vysoká',
        ]);

        $commission = RawRequestCommission::create($validatedData);

        Log::info('Raw request commission created.', ['id' => $commission->id]);

        return response()->json($commission, 201);
    }

    /**
     * Získá konkrétní záznam RawRequestCommission.
     *
     * @param  \App\Models\RawRequestCommission  $rawRequestCommission
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(RawRequestCommission $rawRequestCommission)
    {
        Log::info('Showing raw request commission.', ['id' => $rawRequestCommission->id]);
        return response()->json($rawRequestCommission);
    }

    /**
     * Aktualizuje existující záznam RawRequestCommission.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\RawRequestCommission  $rawRequestCommission
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, RawRequestCommission $rawRequestCommission)
    {
        $validatedData = $request->validate([
            'thema' => 'sometimes|required|string|max:255',
            'contact_email' => 'sometimes|required|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'order_description' => 'sometimes|required|string',
            'status' => 'sometimes|required|string|in:Nově zadané,Zpracovává se,Dokončeno,Zrušeno',
            'priority' => 'sometimes|required|string|in:Nízká,Neutrální,Vysoká',
        ]);

        $rawRequestCommission->update($validatedData);

        Log::info('Raw request commission updated.', ['id' => $rawRequestCommission->id]);

        return response()->json($rawRequestCommission);
    }

    /**
     * Smaže záznam RawRequestCommission.
     *
     * @param  \App\Models\RawRequestCommission  $rawRequestCommission
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(RawRequestCommission $rawRequestCommission)
    {
        $rawRequestCommission->delete();

        Log::info('Raw request commission deleted.', ['id' => $rawRequestCommission->id]);

        return response()->json(null, 204);
    }
}
