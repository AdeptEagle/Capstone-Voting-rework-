import { CandidateService } from './candidate.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';
export declare class CandidateController {
    private readonly candidateService;
    constructor(candidateService: CandidateService);
    getAllCandidates(req: any): Promise<({
        department: {
            id: string;
            Department_Name: string;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
        position: {
            id: string;
            Position_Title: string;
            displayOrder: number;
        };
        _count: {
            votes: number;
            ballotCandidates: number;
        };
        partyList: {
            id: string;
            name: string;
            color: string;
            logo: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string | null;
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        party_list_name: string | null;
        courseId: string | null;
        positionId: string;
        partyListId: string | null;
    })[]>;
    createCandidate(createCandidateDto: CreateCandidateDto, photo?: any): Promise<{
        message: string;
        candidate: {
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string | null;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            party_list_name: string | null;
            courseId: string | null;
            positionId: string;
            partyListId: string | null;
        };
    }>;
    getCandidateById(id: string): Promise<{
        department: {
            id: string;
            Department_Name: string;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
        position: {
            id: string;
            Position_Title: string;
        };
        _count: {
            votes: number;
            ballotCandidates: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        departmentId: string | null;
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        party_list_name: string | null;
        courseId: string | null;
        positionId: string;
        partyListId: string | null;
    }>;
    updateCandidate(id: string, updateCandidateDto: UpdateCandidateDto, photo?: any): Promise<{
        message: string;
        candidate: {
            department: {
                id: string;
                Department_Name: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
            position: {
                id: string;
                Position_Title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            departmentId: string | null;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            party_list_name: string | null;
            courseId: string | null;
            positionId: string;
            partyListId: string | null;
        };
    }>;
    deleteCandidate(id: string): Promise<{
        message: string;
    }>;
}
