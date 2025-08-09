<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use Illuminate\Http\Request;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use App\Http\Requests\UpdateRawRequestCommissionRequest;
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
        $onlyTrashed = $request->input('only_trashed', false);

        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $email = $request->input('email');

        $query = RawRequestCommission::query();
        $query->latest();

        if ($onlyTrashed) {
            $query->onlyTrashed();
        } elseif ($withTrashed) {
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

        if (!isset($validatedData['status'])) {
            $validatedData['status'] = 'Nově zadané';
        }
        
        if (!isset($validatedData['priority'])) {
            $validatedData['priority'] = 'Nízká';
        }

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
     * @param UpdateRawRequestCommissionRequest $request
     * @param RawRequestCommission $rawRequestCommission
     * @return JsonResponse
     */
    public function update(UpdateRawRequestCommissionRequest $request, RawRequestCommission $rawRequestCommission): JsonResponse
    {
        $rawRequestCommission->update($request->validated());
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
        $rawRequestCommission = RawRequestCommission::withTrashed()->findOrFail($id);
        $rawRequestCommission->restore();
        return response()->json($rawRequestCommission);
    }
}
