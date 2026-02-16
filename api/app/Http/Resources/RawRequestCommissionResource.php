<?php



namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RawRequestCommissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'thema'             => $this->thema,
            'contact_email'     => $this->contact_email,
            'contact_phone'     => $this->contact_phone,
            'order_description' => $this->order_description,
            'status'            => $this->status,
            'priority'          => $this->priority,
            'note'              => $this->note,
            'created_at'        => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'        => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
