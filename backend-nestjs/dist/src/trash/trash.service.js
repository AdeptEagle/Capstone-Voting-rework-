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
exports.TrashService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TrashService = class TrashService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrashSummary() {
        const [candidates, positions, departments, courses, voters, ballots] = await Promise.all([
            this.prisma.candidate.count({ where: { isDeleted: true } }),
            this.prisma.position.count({ where: { isDeleted: true } }),
            this.prisma.department.count({ where: { isDeleted: true } }),
            this.prisma.course.count({ where: { isDeleted: true } }),
            this.prisma.voter.count({ where: { isDeleted: true } }),
            this.prisma.ballot.count({ where: { Ballot_IsDeleted: true } })
        ]);
        return {
            candidates,
            positions,
            departments,
            courses,
            voters,
            ballots,
            total: candidates + positions + departments + courses + voters + ballots
        };
    }
    async getDeletedCandidates() {
        return await this.prisma.candidate.findMany({
            where: { isDeleted: true },
            include: {
                position: true,
                department: true,
                course: true
            },
            orderBy: { deletedAt: 'desc' }
        });
    }
    async getDeletedPositions() {
        return await this.prisma.position.findMany({
            where: { isDeleted: true },
            orderBy: { deletedAt: 'desc' }
        });
    }
    async getDeletedDepartments() {
        return await this.prisma.department.findMany({
            where: { isDeleted: true },
            include: {
                admin: true
            },
            orderBy: { deletedAt: 'desc' }
        });
    }
    async getDeletedCourses() {
        return await this.prisma.course.findMany({
            where: { isDeleted: true },
            include: {
                department: true
            },
            orderBy: { deletedAt: 'desc' }
        });
    }
    async getDeletedVoters() {
        return await this.prisma.voter.findMany({
            where: { isDeleted: true },
            include: {
                department: true,
                course: true
            },
            orderBy: { deletedAt: 'desc' }
        });
    }
    async getDeletedBallots() {
        return await this.prisma.ballot.findMany({
            where: { Ballot_IsDeleted: true },
            include: {
                createdByAdmin: true
            },
            orderBy: { Ballot_DeletedAt: 'desc' }
        });
    }
    async getTrashItems() {
        const [candidates, positions, departments, courses, voters, ballots] = await Promise.all([
            this.getDeletedCandidates(),
            this.getDeletedPositions(),
            this.getDeletedDepartments(),
            this.getDeletedCourses(),
            this.getDeletedVoters(),
            this.getDeletedBallots()
        ]);
        return {
            candidates,
            positions,
            departments,
            courses,
            voters,
            ballots
        };
    }
    async getTrashCounts() {
        return await this.getTrashSummary();
    }
    async restoreCandidate(candidateId) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId }
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (!candidate.isDeleted) {
            throw new common_1.ForbiddenException('Candidate is not deleted');
        }
        return await this.prisma.candidate.update({
            where: { id: candidateId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    }
    async restorePosition(positionId) {
        const position = await this.prisma.position.findUnique({
            where: { id: positionId }
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        if (!position.isDeleted) {
            throw new common_1.ForbiddenException('Position is not deleted');
        }
        return await this.prisma.position.update({
            where: { id: positionId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    }
    async restoreDepartment(departmentId) {
        const department = await this.prisma.department.findUnique({
            where: { id: departmentId }
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        if (!department.isDeleted) {
            throw new common_1.ForbiddenException('Department is not deleted');
        }
        return await this.prisma.department.update({
            where: { id: departmentId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    }
    async restoreCourse(courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (!course.isDeleted) {
            throw new common_1.ForbiddenException('Course is not deleted');
        }
        return await this.prisma.course.update({
            where: { id: courseId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    }
    async restoreVoter(voterId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId }
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        if (!voter.isDeleted) {
            throw new common_1.ForbiddenException('Voter is not deleted');
        }
        return await this.prisma.voter.update({
            where: { id: voterId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
    }
    async restoreBallot(ballotId) {
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId }
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        if (!ballot.Ballot_IsDeleted) {
            throw new common_1.ForbiddenException('Ballot is not deleted');
        }
        return await this.prisma.ballot.update({
            where: { id: ballotId },
            data: {
                Ballot_IsDeleted: false,
                Ballot_DeletedAt: null
            }
        });
    }
    async permanentlyDeleteCandidate(candidateId) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                _count: {
                    select: {
                        votes: true,
                        ballotCandidates: true
                    }
                }
            }
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (!candidate.isDeleted) {
            throw new common_1.ForbiddenException('Candidate is not deleted');
        }
        if (candidate._count.votes > 0) {
            throw new Error('Cannot permanently delete candidate with voting history. Votes must be preserved for audit purposes.');
        }
        return await this.prisma.candidate.delete({
            where: { id: candidateId }
        });
    }
    async permanentlyDeletePosition(positionId) {
        const position = await this.prisma.position.findUnique({
            where: { id: positionId },
            include: {
                _count: {
                    select: {
                        votes: true,
                        ballotPositions: true
                    }
                }
            }
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        if (!position.isDeleted) {
            throw new common_1.ForbiddenException('Position is not deleted');
        }
        if (position._count.votes > 0) {
            throw new Error('Cannot permanently delete position with voting history. Votes must be preserved for audit purposes.');
        }
        return await this.prisma.position.delete({
            where: { id: positionId }
        });
    }
    async permanentlyDeleteDepartment(departmentId) {
        const department = await this.prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                _count: {
                    select: {
                        voters: true,
                        candidates: true
                    }
                }
            }
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        if (!department.isDeleted) {
            throw new common_1.ForbiddenException('Department is not deleted');
        }
        if (department._count.voters > 0 || department._count.candidates > 0) {
            throw new Error('Cannot permanently delete department with associated voters or candidates.');
        }
        return await this.prisma.department.delete({
            where: { id: departmentId }
        });
    }
    async permanentlyDeleteCourse(courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                _count: {
                    select: {
                        voters: true,
                        candidates: true
                    }
                }
            }
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (!course.isDeleted) {
            throw new common_1.ForbiddenException('Course is not deleted');
        }
        if (course._count.voters > 0 || course._count.candidates > 0) {
            throw new Error('Cannot permanently delete course with associated voters or candidates.');
        }
        return await this.prisma.course.delete({
            where: { id: courseId }
        });
    }
    async permanentlyDeleteVoter(voterId) {
        const voter = await this.prisma.voter.findUnique({
            where: { id: voterId },
            include: {
                _count: {
                    select: {
                        votes: true
                    }
                }
            }
        });
        if (!voter) {
            throw new common_1.NotFoundException('Voter not found');
        }
        if (!voter.isDeleted) {
            throw new common_1.ForbiddenException('Voter is not deleted');
        }
        if (voter._count.votes > 0) {
            throw new Error('Cannot permanently delete voter with voting history. Votes must be preserved for audit purposes.');
        }
        return await this.prisma.voter.delete({
            where: { id: voterId }
        });
    }
    async permanentlyDeleteBallot(ballotId) {
        const ballot = await this.prisma.ballot.findUnique({
            where: { id: ballotId },
            include: {
                _count: {
                    select: {
                        votes: true,
                        ballotPositions: true,
                        ballotCandidates: true
                    }
                }
            }
        });
        if (!ballot) {
            throw new common_1.NotFoundException('Ballot not found');
        }
        if (!ballot.Ballot_IsDeleted) {
            throw new common_1.ForbiddenException('Ballot is not deleted');
        }
        if (ballot._count.votes > 0) {
            throw new common_1.ConflictException('Cannot permanently delete ballot with voting history. Votes must be preserved for audit purposes.');
        }
        return await this.prisma.ballot.delete({
            where: { id: ballotId }
        });
    }
    async emptyTrash() {
        const results = {
            candidates: 0,
            positions: 0,
            departments: 0,
            courses: 0,
            voters: 0,
            ballots: 0,
            errors: []
        };
        try {
            const [candidates, positions, departments, courses, voters, ballots] = await Promise.all([
                this.prisma.candidate.findMany({ where: { isDeleted: true } }),
                this.prisma.position.findMany({ where: { isDeleted: true } }),
                this.prisma.department.findMany({ where: { isDeleted: true } }),
                this.prisma.course.findMany({ where: { isDeleted: true } }),
                this.prisma.voter.findMany({ where: { isDeleted: true } }),
                this.prisma.ballot.findMany({ where: { Ballot_IsDeleted: true } })
            ]);
            for (const candidate of candidates) {
                try {
                    await this.permanentlyDeleteCandidate(candidate.id);
                    results.candidates++;
                }
                catch (error) {
                    results.errors.push({ type: 'candidate', id: candidate.id, error: error.message });
                }
            }
            for (const position of positions) {
                try {
                    await this.permanentlyDeletePosition(position.id);
                    results.positions++;
                }
                catch (error) {
                    results.errors.push({ type: 'position', id: position.id, error: error.message });
                }
            }
            for (const department of departments) {
                try {
                    await this.permanentlyDeleteDepartment(department.id);
                    results.departments++;
                }
                catch (error) {
                    results.errors.push({ type: 'department', id: department.id, error: error.message });
                }
            }
            for (const course of courses) {
                try {
                    await this.permanentlyDeleteCourse(course.id);
                    results.courses++;
                }
                catch (error) {
                    results.errors.push({ type: 'course', id: course.id, error: error.message });
                }
            }
            for (const voter of voters) {
                try {
                    await this.permanentlyDeleteVoter(voter.id);
                    results.voters++;
                }
                catch (error) {
                    results.errors.push({ type: 'voter', id: voter.id, error: error.message });
                }
            }
            for (const ballot of ballots) {
                try {
                    await this.permanentlyDeleteBallot(ballot.id);
                    results.ballots++;
                }
                catch (error) {
                    results.errors.push({ type: 'ballot', id: ballot.id, error: error.message });
                }
            }
            return {
                message: `Trash emptied successfully! Deleted: ${results.candidates} candidates, ${results.positions} positions, ${results.departments} departments, ${results.courses} courses, ${results.voters} voters, ${results.ballots} ballots`,
                results,
                errors: results.errors.length > 0 ? results.errors : null
            };
        }
        catch (error) {
            throw new Error(`Failed to empty trash: ${error.message}`);
        }
    }
};
exports.TrashService = TrashService;
exports.TrashService = TrashService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrashService);
//# sourceMappingURL=trash.service.js.map