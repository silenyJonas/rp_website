<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'user_login_id'     => $this->user_login_id,
            'user_name_plain'   => $this->user_name_plain,
            'user_email_plain'  => $this->user_email_plain,
            'category'          => $this->category,
            'priority'          => $this->priority,
            'state'             => $this->state,
            'subject'           => $this->subject,
            'description'       => $this->description,
            'attachment_path'   => $this->attachment_path,
            'attachment_url'    => $this->attachment_path ? asset('storage/' . $this->attachment_path) : null,
            'created_at'        => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'        => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}