"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const id_generator_service_1 = require("../utils/id-generator.service");
const file_upload_service_1 = require("../services/file-upload.service");
let CandidateService = class CandidateService {
    constructor(prisma, idGenerator, fileUploadService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.fileUploadService = fileUploadService;
    }
    async getAllCandidates(showAll = false) {
        return this.prisma.candidate.findMany({
            where: showAll ? {} : { isDeleted: false },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                        displayOrder: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
                partyList: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        logo: true,
                    },
                },
                _count: {
                    select: {
                        votes: true,
                        ballotCandidates: true,
                    },
                },
            },
        });
    }
    async createCandidate(createCandidateDto, photo) {
        console.log('createCandidate called with photo:', photo);
        console.log('createCandidateDto:', createCandidateDto);
        const { Candidate_Name, Candidate_Email, Candidate_StudentId, positionId, departmentId, courseId, partyListId, party_list_name, manifesto } = createCandidateDto;
        const position = await this.prisma.position.findUnique({
            where: { id: positionId },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        const department = await this.prisma.department.findUnique({
            where: { id: departmentId },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (partyListId) {
            const partyList = await this.prisma.partyList.findUnique({
                where: { id: partyListId },
            });
            if (!partyList) {
                throw new common_1.NotFoundException('Party list not found');
            }
        }
        const existingCandidate = await this.prisma.candidate.findFirst({
            where: { Candidate_StudentId: Candidate_StudentId },
        });
        if (existingCandidate) {
            throw new common_1.ConflictException('Candidate with this student ID already exists');
        }
        let photoUrl = null;
        if (photo) {
            try {
                if (photo.buffer || photo.originalname) {
                    console.log('📸 Processing image upload for candidate');
                    console.log('📸 Photo details:', {
                        originalname: photo.originalname,
                        mimetype: photo.mimetype,
                        size: photo.size,
                        buffer: photo.buffer ? 'Buffer exists' : 'No buffer'
                    });
                    const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
                    console.log('📸 FileInfo received:', fileInfo);
                    if (fileInfo && fileInfo.url) {
                        photoUrl = fileInfo.url;
                        console.log('📸 Image uploaded successfully:', photoUrl);
                    }
                    else {
                        console.error('📸 Image upload failed - invalid response:', fileInfo);
                        photoUrl = null;
                    }
                }
                else if (typeof photo === 'string') {
                    if (photo.startsWith('https://res.cloudinary.com/') || photo.startsWith('/uploads/')) {
                        photoUrl = photo;
                    }
                    else {
                        photoUrl = null;
                    }
                }
                else {
                    photoUrl = null;
                }
            }
            catch (error) {
                console.error('📸 Image upload error:', error.message);
                console.error('📸 Full error:', error);
                photoUrl = null;
            }
        }
        const customId = await this.idGenerator.generateCandidateId();
        const candidate = await this.prisma.candidate.create({
            data: {
                id: customId,
                Candidate_Name: Candidate_Name,
                Candidate_Email: Candidate_Email,
                Candidate_StudentId: Candidate_StudentId,
                positionId,
                departmentId,
                courseId,
                photo: photoUrl,
                partyListId,
                party_list_name,
                manifesto,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
        return {
            message: 'Candidate created successfully!',
            candidate,
        };
    }
    async getCandidateById(id) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
                _count: {
                    select: {
                        votes: true,
                        ballotCandidates: true,
                    },
                },
            },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (candidate.isDeleted) {
            throw new common_1.NotFoundException('Candidate has been deleted');
        }
        return candidate;
    }
    async updateCandidate(id, updateCandidateDto, photo) {
        const { Candidate_Name, Candidate_Email, Candidate_StudentId, positionId, departmentId, courseId, partyListId, party_list_name, manifesto } = updateCandidateDto;
        const existingCandidate = await this.prisma.candidate.findUnique({
            where: { id },
        });
        if (!existingCandidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (positionId) {
            const position = await this.prisma.position.findUnique({
                where: { id: positionId },
            });
            if (!position) {
                throw new common_1.NotFoundException('Position not found');
            }
        }
        if (departmentId) {
            const department = await this.prisma.department.findUnique({
                where: { id: departmentId },
            });
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
        }
        if (courseId) {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
        }
        if (partyListId) {
            const partyList = await this.prisma.partyList.findUnique({
                where: { id: partyListId },
            });
            if (!partyList) {
                throw new common_1.NotFoundException('Party list not found');
            }
        }
        if (Candidate_StudentId && Candidate_StudentId !== existingCandidate.Candidate_StudentId) {
            const conflictingCandidate = await this.prisma.candidate.findFirst({
                where: {
                    Candidate_StudentId: Candidate_StudentId,
                    NOT: { id },
                },
            });
            if (conflictingCandidate) {
                throw new common_1.ConflictException('Candidate with this student ID already exists');
            }
        }
        let photoUrl = existingCandidate.photo;
        if (photo) {
            console.log('Photo object received:', photo);
            console.log('Photo type:', typeof photo);
            console.log('Photo properties:', Object.keys(photo));
            try {
                if (photo.buffer || photo.originalname) {
                    console.log('Processing as file upload');
                    if (existingCandidate.photo) {
                        try {
                            const oldPhotoInfo = {
                                url: existingCandidate.photo,
                                filename: existingCandidate.photo.split('/').pop() || '',
                                type: 'image'
                            };
                            await this.fileUploadService.deleteFile(oldPhotoInfo);
                        }
                        catch (deleteError) {
                            console.log('Failed to delete old photo:', deleteError.message);
                        }
                    }
                    const fileInfo = await this.fileUploadService.processUploadedFile(photo, 'image');
                    console.log('FileInfo received:', fileInfo);
                    if (fileInfo && fileInfo.url) {
                        photoUrl = fileInfo.url;
                        console.log('Photo URL set to:', photoUrl);
                    }
                    else {
                        console.error('Invalid fileInfo or fileInfo.url:', fileInfo);
                        photoUrl = existingCandidate.photo;
                    }
                }
                else if (typeof photo === 'string') {
                    if (photo.startsWith('https://res.cloudinary.com/') || photo.startsWith('/uploads/')) {
                        console.log('Processing as URL string:', photo);
                        photoUrl = photo;
                    }
                    else {
                        console.log('Invalid URL format, keeping existing photo');
                        photoUrl = existingCandidate.photo;
                    }
                }
                else {
                    console.log('Photo is neither file upload nor valid URL string, keeping existing photo');
                    photoUrl = existingCandidate.photo;
                }
            }
            catch (error) {
                console.error('Photo upload error:', error);
                photoUrl = existingCandidate.photo;
            }
        }
        else {
            console.log('No photo provided, keeping existing photo');
        }
        const candidate = await this.prisma.candidate.update({
            where: { id },
            data: {
                Candidate_Name: Candidate_Name,
                Candidate_Email: Candidate_Email,
                Candidate_StudentId: Candidate_StudentId,
                positionId,
                departmentId,
                courseId,
                photo: photoUrl,
                partyListId,
                party_list_name,
                manifesto,
            },
            include: {
                position: {
                    select: {
                        id: true,
                        Position_Title: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        Department_Name: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        Course_Name: true,
                        Course_Code: true,
                    },
                },
            },
        });
        return {
            message: 'Candidate updated successfully!',
            candidate,
        };
    }
    async deleteCandidate(id) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        votes: true,
                        ballotCandidates: true,
                    },
                },
            },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (candidate.isDeleted) {
            throw new common_1.NotFoundException('Candidate has already been deleted');
        }
        await this.prisma.candidate.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        return {
            message: 'Candidate moved to trash successfully!',
        };
    }
};
exports.CandidateService = CandidateService;
exports.CandidateService = CandidateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        id_generator_service_1.IdGeneratorService,
        file_upload_service_1.FileUploadService])
], CandidateService);
//# sourceMappingURL=candidate.service.js.map