// src/app/pages/administrators/administrators.interface.ts

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
  last_login_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  roles: UserRole[]; // Pole vnořených rolí
}
