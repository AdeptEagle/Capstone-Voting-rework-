export declare class VoteSelectionDto {
    positionId: string;
    candidateId: string;
}
export declare class CastVoteDto {
    ballotId: string;
    votes: VoteSelectionDto[];
    verificationCode?: string;
}
