import { BallotService } from '../ballot/ballot.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulerService {
    private readonly ballotService;
    private readonly prisma;
    private readonly logger;
    constructor(ballotService: BallotService, prisma: PrismaService);
    handleAutoStartBallots(): Promise<void>;
    handleAutoEndBallots(): Promise<void>;
    logBallotStatus(): Promise<void>;
    cleanupInactiveSessions(): Promise<void>;
}
