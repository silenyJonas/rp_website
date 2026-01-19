// Rozhraní pro data role z API
export interface UserRole {
  role_id: number;
  role_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Rozhraní pro data administrátora z API
export interface UserLogin {
  user_login_id: number;
  user_email: string;
  contact_email?: string | null;       
  full_name?: string | null;          
  birth_date?: string | null;         
  personal_id_num?: string | null;    // NOVÉ
  address?: string | null;            // NOVÉ
  bank_account?: string | null;       // NOVÉ
  health_insurance?: string | null;   // NOVÉ
  commission_rate?: number;           // NOVÉ
  dpp_hours_spent?: number;           // NOVÉ
  has_tax_declaration?: boolean;      // NOVÉ
  phone_number?: string | null;       // NOVÉ
  internal_note?: string | null;      // NOVÉ (Zde byla ta chyba)
  
  last_login_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  roles: UserRole[]; 
}