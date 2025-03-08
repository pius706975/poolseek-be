export interface RefreshToken {
    id?: string;
    user_id: string;
    refresh_token: string;
    device_id: string;
    device_name: string;
    device_model: string;
    refresh_token_expiration: Date;
    created_at: string | undefined;
    updated_at: string | undefined;
}
