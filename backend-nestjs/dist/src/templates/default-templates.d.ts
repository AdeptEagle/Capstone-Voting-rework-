export declare const DEFAULT_BALLOT_TEMPLATES: {
    id: string;
    name: string;
    description: string;
    data: {
        title: string;
        description: string;
        positions: {
            positionTitle: string;
            displayOrder: number;
            isRequired: boolean;
            voteLimit: number;
        }[];
        requireAllPositions: boolean;
        showResults: boolean;
        showLiveResults: boolean;
        maxVotesPerUser: number;
        allowMultipleVotes: boolean;
    };
    isPublic: boolean;
}[];
