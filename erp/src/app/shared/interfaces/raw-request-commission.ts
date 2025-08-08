export interface RawRequestCommission {
  id?: number;
  thema: string;
  contact_email: string;
  contact_phone: string;
  order_description: string;
  status: string;
  priority: string;
  created_at?: string;
  last_changed_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}