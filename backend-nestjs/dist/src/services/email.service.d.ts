export declare class EmailService {
    private transporter;
    private useApiService;
    private apiService;
    private resend;
    constructor();
    private sendEmailViaResend;
    sendPasswordResetEmail(to: string, resetToken: string, userType: 'voter' | 'admin', userName?: string, userId?: string): Promise<void>;
    sendPasswordChangedEmail(to: string, userType: 'voter' | 'admin'): Promise<void>;
    testConnection(): Promise<boolean>;
}
