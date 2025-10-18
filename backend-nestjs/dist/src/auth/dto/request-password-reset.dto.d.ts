export declare class RequestPasswordResetDto {
    ResetToken_Email: string;
    userType: 'voter' | 'admin';
    verificationField: string;
}
