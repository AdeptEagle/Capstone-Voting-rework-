import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import { FileUploadService } from '../services/file-upload.service';
export declare class CandidateService {
    private prisma;
    private idGenerator;
    private fileUploadService;
    constructor(prisma: PrismaService, idGenerator: IdGeneratorService, fileUploadService: FileUploadService);
    getAllCandidates(showAll?: boolean): Promise<({
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
        positionId: string;
        courseId: string | null;
        partyListId: string | null;
        party_list_name: string | null;
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
            positionId: string;
            courseId: string | null;
            partyListId: string | null;
            party_list_name: string | null;
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
        positionId: string;
        courseId: string | null;
        partyListId: string | null;
        party_list_name: string | null;
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
            positionId: string;
            courseId: string | null;
            partyListId: string | null;
            party_list_name: string | null;
        };
    }>;
    deleteCandidate(id: string): Promise<{
        message: string;
    }>;
}
