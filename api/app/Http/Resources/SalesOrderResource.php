<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage; // Přidáno pro generování URL

class SalesOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'lead_id'           => $this->lead_id,
            'salesman_name'     => $this->salesman_name,
            'ico'               => $this->ico,
            'client_name'       => $this->client_name,
            'client_address'    => $this->client_address,
            'client_phone'      => $this->client_phone,
            'client_email'      => $this->client_email,
            'order_description' => $this->order_description,
            
            // PŘIDÁNO: Cesta k souboru (přímo z DB)
            'attachment_path'   => $this->attachment_path,
            
            // VOLITELNÉ: Plná URL adresa pro snadné stažení v Angularu
            'attachment_url'    => $this->attachment_path 
                                    ? asset('storage/' . $this->attachment_path) 
                                    : null,

            'created_at'        => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'        => $this->deleted_at?->format('Y-m-d H:i:s'),
            'lead'              => $this->whenLoaded('lead')
        ];
    }
}