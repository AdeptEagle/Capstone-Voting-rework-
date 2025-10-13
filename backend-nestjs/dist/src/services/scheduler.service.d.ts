import { ElectionService } from '../election/election.service';
import { BallotService } from '../ballot/ballot.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulerService {
    private readonly electionService;
    private readonly ballotService;
    private readonly prisma;
    private readonly logger;
    constructor(electionService: ElectionService, ballotService: BallotService, prisma: PrismaService);
    handleAutoEndElections(): Promise<void>;
    handleAutoStartBallots(): Promise<void>;
    handleAutoEndBallots(): Promise<void>;
    logElectionStatus(): Promise<void>;
    cleanupInactiveSessions(): Promise<void>;
}
