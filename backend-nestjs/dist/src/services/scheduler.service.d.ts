import { BallotService } from '../ballot/ballot.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogCleanupConfigService } from './log-cleanup-config.service';
export declare class SchedulerService {
    private readonly ballotService;
    private readonly prisma;
    private readonly logCleanupConfig;
    private readonly logger;
    constructor(ballotService: BallotService, prisma: PrismaService, logCleanupConfig: LogCleanupConfigService);
    handleAutoStartBallots(): Promise<void>;
    handleAutoEndBallots(): Promise<void>;
    logBallotStatus(): Promise<void>;
    cleanupInactiveSessions(): Promise<void>;
    cleanupInactiveAdminSessions(): Promise<void>;
    cleanupOldLoginLogs(): Promise<void>;
    cleanupOldAuditLogs(): Promise<void>;
}
