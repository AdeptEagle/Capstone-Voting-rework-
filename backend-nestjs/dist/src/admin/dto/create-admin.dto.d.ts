import { Role } from '@prisma/client';
export declare class CreateAdminDto {
    Admin_Username: string;
    Admin_Email: string;
    password: string;
    role?: Role;
}
