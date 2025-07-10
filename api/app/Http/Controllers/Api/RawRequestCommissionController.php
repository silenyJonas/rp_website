<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawRequestCommission;
use App\Http\Requests\StoreRawRequestCommissionRequest;
use App\Http\Requests\UpdateRawRequestCommissionRequest;
use App\Http\Resources\RawRequestCommissionResource;
use Illuminate\Http\JsonResponse;

class RawRequestCommissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
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
