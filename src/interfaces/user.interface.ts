export interface User {
    id?: string;
    email: string;
    first_name: string;
    last_name: string;
    image: string;
    role_id: number;
    phone_number: string;
    password: string;
    otp_code: string;
    otp_expiration: Date;
    is_verified: boolean;
    created_at: string | undefined;
    updated_at: string | undefined;
}
