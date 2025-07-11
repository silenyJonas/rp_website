<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use App\Http\Requests\UpdateRawRequestCommissionRequest;
use App\Http\Resources\RawRequestCommissionResource;
use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request; // <-- ZAJISTĚTE, ŽE TOTO JE IMPORTED
use Illuminate\Support\Facades\Log; // <-- ZAJISTĚTE, ŽE TOTO JE IMPORTED
use Illuminate\Support\Facades\Auth;

class RawRequestCommissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index(): JsonResponse
    // {
    //     return RawRequestCommissionResource::collection(
    //         RawRequestCommission::all()
    //     )->response();
    // }
    public function index(Request $request): JsonResponse // <-- ZAJISTĚTE, ŽE ZDE JE Request $request
    {
        // --- DEBUG KÓD ZAČÁTEK ---
         Log::info('Auth check result: ' . Auth::check());
        Log::info('User ID: ' . (Auth::user() ? Auth::user()->id : 'N/A'));
        // --- DEBUG KÓD KONEC ---

        return RawRequestCommissionResource::collection(
            RawRequestCommission::all()
        )->response();
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRawRequestCommissionRequest $request): JsonResponse
    {
        $commision = RawRequestCommission::create($request->validated());

        return (new RawRequestCommissionResource($commision))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RawRequestCommission $raw_request_commission): JsonResponse
    {
        return (new RawRequestCommissionResource($raw_request_commission))->response();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateRawRequestCommissionRequest $request,
        RawRequestCommission $raw_request_commission
    ): JsonResponse {
        $raw_request_commission->update($request->validated());

        return (new RawRequestCommissionResource($raw_request_commission))->response();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RawRequestCommission $raw_request_commission): JsonResponse
    {
        $raw_request_commission->delete();

        return response()->json(null, 204);
    }
}
