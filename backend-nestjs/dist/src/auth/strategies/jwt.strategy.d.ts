import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        id: any;
        userId: any;
        studentId: any;
        username: any;
        role: any;
        type: any;
    }>;
}
export {};
