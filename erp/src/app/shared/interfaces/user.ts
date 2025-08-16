// src/app/shared/interfaces/user.ts

export interface Role {
    role_id: number;
    role_name: string;
    description: string | null;
    pivot: {
        user_login_id: number;
        role_id: number;
    };
}

export interface User {
    user_login_id?: number;
    user_email: string;
    user_password_hash?: string; // Volitelné, pravděpodobně nebudete zobrazovat
    user_password_salt?: string; // Volitelné
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_deleted?: boolean;
    roles?: Role[];
}