<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesLeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'user_login_id'      => $this->user_login_id,
            'salesman_name'      => $this->salesman_name,
            'first_contact_date' => $this->first_contact_date,
            'subject_name'       => $this->subject_name,
            'contact_person'     => $this->contact_person,
            'contact_email'      => $this->contact_email,
            'contact_phone'      => $this->contact_phone,
            'contact_other'      => $this->contact_other,
            'location'           => $this->location,
            'source_channel'     => $this->source_channel,
            'source_url'         => $this->source_url,
            'description'        => $this->description,
            'priority'           => $this->priority ?? 'Neutrální',
            'status'             => $this->status ?? 'nové',
            'last_contact_date'  => $this->last_contact_date,
            'next_step'          => $this->next_step,
            'rejection_reason'   => $this->rejection_reason,
            'created_at'         => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'         => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'         => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}