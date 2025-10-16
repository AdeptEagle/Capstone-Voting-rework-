import { CandidateService } from './candidate.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';
export declare class CandidateController {
    private readonly candidateService;
    constructor(candidateService: CandidateService);
    getAllCandidates(req: any): Promise<({
        position: {
            id: string;
            Position_Title: string;
        };
        _count: {
            votes: number;
            electionCandidates: number;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
        department: {
            id: string;
            Department_Name: string;
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
        positionId: string;
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        party_list_name: string | null;
        courseId: string | null;
        departmentId: string | null;
        partyListId: string | null;
    })[]>;
    createCandidate(createCandidateDto: CreateCandidateDto, photo?: any): Promise<{
        message: string;
        candidate: {
            position: {
                id: string;
                Position_Title: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
            department: {
                id: string;
                Department_Name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            positionId: string;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            party_list_name: string | null;
            courseId: string | null;
            departmentId: string | null;
            partyListId: string | null;
        };
    }>;
    getCandidateById(id: string): Promise<{
        position: {
            id: string;
            Position_Title: string;
        };
        _count: {
            votes: number;
            electionCandidates: number;
        };
        course: {
            id: string;
            Course_Name: string;
            Course_Code: string;
        };
        department: {
            id: string;
            Department_Name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isDeleted: boolean;
        positionId: string;
        Candidate_Name: string;
        Candidate_Email: string;
        Candidate_StudentId: string;
        photo: string | null;
        manifesto: string | null;
        party_list_name: string | null;
        courseId: string | null;
        departmentId: string | null;
        partyListId: string | null;
    }>;
    updateCandidate(id: string, updateCandidateDto: UpdateCandidateDto, photo?: any): Promise<{
        message: string;
        candidate: {
            position: {
                id: string;
                Position_Title: string;
            };
            course: {
                id: string;
                Course_Name: string;
                Course_Code: string;
            };
            department: {
                id: string;
                Department_Name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            positionId: string;
            Candidate_Name: string;
            Candidate_Email: string;
            Candidate_StudentId: string;
            photo: string | null;
            manifesto: string | null;
            party_list_name: string | null;
            courseId: string | null;
            departmentId: string | null;
            partyListId: string | null;
        };
    }>;
    deleteCandidate(id: string): Promise<{
        message: string;
    }>;
}
