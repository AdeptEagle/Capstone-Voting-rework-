export declare class CreateBallotDto {
    Ballot_Title: string;
    Ballot_Description?: string;
    Ballot_StartDate: string;
    Ballot_EndDate: string;
    Ballot_RequireAllPositions?: boolean;
    Ballot_ShowResults?: boolean;
    Ballot_ShowResultsAfter?: string;
    Ballot_ShowLiveResults?: boolean;
    Ballot_AllowAbstain?: boolean;
    positionIds: string[];
    candidateIds: string[];
}
