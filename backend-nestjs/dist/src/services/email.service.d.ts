export declare class EmailService {
    private transporter;
    constructor();
    sendPasswordResetEmail(to: string, resetToken: string, userType: 'voter' | 'admin', userName?: string, userId?: string): Promise<void>;
    sendPasswordChangedEmail(to: string, userType: 'voter' | 'admin'): Promise<void>;
    testConnection(): Promise<boolean>;
}
