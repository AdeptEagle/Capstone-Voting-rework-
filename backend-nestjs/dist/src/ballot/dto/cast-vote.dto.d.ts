export declare class VoteSelectionDto {
    positionId: string;
    candidateId?: string | null;
    isAbstention?: boolean;
}
export declare class CastVoteDto {
    ballotId: string;
    votes: VoteSelectionDto[];
    verificationCode?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}
