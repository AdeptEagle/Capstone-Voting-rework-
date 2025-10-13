export declare class UpdateBallotTemplateDto {
    name?: string;
    description?: string;
    templateData?: {
        title: string;
        description?: string;
        positions?: Array<{
            positionId: string;
            displayOrder?: number;
            isRequired?: boolean;
        }>;
        maxVotesPerUser?: number;
        allowMultipleVotes?: boolean;
        requireAllPositions?: boolean;
        showResults?: boolean;
        showLiveResults?: boolean;
    };
    isPublic?: boolean;
}
