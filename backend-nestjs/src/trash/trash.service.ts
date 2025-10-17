import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  // Get summary of all deleted items
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

  // Get deleted candidates
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

  // Get deleted positions
  async getDeletedPositions() {
    return await this.prisma.position.findMany({
      where: { isDeleted: true },
      orderBy: { deletedAt: 'desc' }
    });
  }

  // Get deleted departments
  async getDeletedDepartments() {
    return await this.prisma.department.findMany({
      where: { isDeleted: true },
      include: {
        admin: true
      },
      orderBy: { deletedAt: 'desc' }
    });
  }

  // Get deleted courses
  async getDeletedCourses() {
    return await this.prisma.course.findMany({
      where: { isDeleted: true },
      include: {
        department: true
      },
      orderBy: { deletedAt: 'desc' }
    });
  }

  // Get deleted voters
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

  // Get deleted ballots
  async getDeletedBallots() {
    return await this.prisma.ballot.findMany({
      where: { Ballot_IsDeleted: true },
      include: {
        createdByAdmin: true
      },
      orderBy: { Ballot_DeletedAt: 'desc' }
    });
  }

  // Get all trash items
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

  // Get trash counts
  async getTrashCounts() {
    return await this.getTrashSummary();
  }

  // Restore candidate
  async restoreCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (!candidate.isDeleted) {
      throw new ForbiddenException('Candidate is not deleted');
    }

    return await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });
  }

  // Restore position
  async restorePosition(positionId: string) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId }
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    if (!position.isDeleted) {
      throw new ForbiddenException('Position is not deleted');
    }

    return await this.prisma.position.update({
      where: { id: positionId },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });
  }

  // Restore department
  async restoreDepartment(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.isDeleted) {
      throw new ForbiddenException('Department is not deleted');
    }

    return await this.prisma.department.update({
      where: { id: departmentId },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });
  }

  // Restore course
  async restoreCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isDeleted) {
      throw new ForbiddenException('Course is not deleted');
    }

    return await this.prisma.course.update({
      where: { id: courseId },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });
  }

  // Restore voter
  async restoreVoter(voterId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId }
    });

    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    if (!voter.isDeleted) {
      throw new ForbiddenException('Voter is not deleted');
    }

    return await this.prisma.voter.update({
      where: { id: voterId },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });
  }

  // Restore ballot
  async restoreBallot(ballotId: string) {
    const ballot = await this.prisma.ballot.findUnique({
      where: { id: ballotId }
    });

    if (!ballot) {
      throw new NotFoundException('Ballot not found');
    }

    if (!ballot.Ballot_IsDeleted) {
      throw new ForbiddenException('Ballot is not deleted');
    }

    return await this.prisma.ballot.update({
      where: { id: ballotId },
      data: {
        Ballot_IsDeleted: false,
        Ballot_DeletedAt: null
      }
    });
  }

  // Permanently delete candidate
  async permanentlyDeleteCandidate(candidateId: string) {
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
      throw new NotFoundException('Candidate not found');
    }

    if (!candidate.isDeleted) {
      throw new ForbiddenException('Candidate is not deleted');
    }

    // Check if candidate has votes (prevent deletion if votes exist)
    if (candidate._count.votes > 0) {
      throw new Error('Cannot permanently delete candidate with voting history. Votes must be preserved for audit purposes.');
    }

    return await this.prisma.candidate.delete({
      where: { id: candidateId }
    });
  }

  // Permanently delete position
  async permanentlyDeletePosition(positionId: string) {
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
      throw new NotFoundException('Position not found');
    }

    if (!position.isDeleted) {
      throw new ForbiddenException('Position is not deleted');
    }

    // Check if position has votes (prevent deletion if votes exist)
    if (position._count.votes > 0) {
      throw new Error('Cannot permanently delete position with voting history. Votes must be preserved for audit purposes.');
    }

    return await this.prisma.position.delete({
      where: { id: positionId }
    });
  }

  // Permanently delete department
  async permanentlyDeleteDepartment(departmentId: string) {
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
      throw new NotFoundException('Department not found');
    }

    if (!department.isDeleted) {
      throw new ForbiddenException('Department is not deleted');
    }

    // Check if department has associated data
    if (department._count.voters > 0 || department._count.candidates > 0) {
      throw new Error('Cannot permanently delete department with associated voters or candidates.');
    }

    return await this.prisma.department.delete({
      where: { id: departmentId }
    });
  }

  // Permanently delete course
  async permanentlyDeleteCourse(courseId: string) {
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
      throw new NotFoundException('Course not found');
    }

    if (!course.isDeleted) {
      throw new ForbiddenException('Course is not deleted');
    }

    // Check if course has associated data
    if (course._count.voters > 0 || course._count.candidates > 0) {
      throw new Error('Cannot permanently delete course with associated voters or candidates.');
    }

    return await this.prisma.course.delete({
      where: { id: courseId }
    });
  }

  // Permanently delete voter
  async permanentlyDeleteVoter(voterId: string) {
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
      throw new NotFoundException('Voter not found');
    }

    if (!voter.isDeleted) {
      throw new ForbiddenException('Voter is not deleted');
    }

    // Check if voter has votes (prevent deletion if votes exist)
    if (voter._count.votes > 0) {
      throw new Error('Cannot permanently delete voter with voting history. Votes must be preserved for audit purposes.');
    }

    return await this.prisma.voter.delete({
      where: { id: voterId }
    });
  }

  // Permanently delete ballot
  async permanentlyDeleteBallot(ballotId: string) {
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
      throw new NotFoundException('Ballot not found');
    }

    if (!ballot.Ballot_IsDeleted) {
      throw new ForbiddenException('Ballot is not deleted');
    }

    // Check if ballot has votes (prevent deletion if votes exist)
    if (ballot._count.votes > 0) {
      throw new Error('Cannot permanently delete ballot with voting history. Votes must be preserved for audit purposes.');
    }

    return await this.prisma.ballot.delete({
      where: { id: ballotId }
    });
  }

  // Empty all trash
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
      // Get all soft-deleted items
      const [candidates, positions, departments, courses, voters, ballots] = await Promise.all([
        this.prisma.candidate.findMany({ where: { isDeleted: true } }),
        this.prisma.position.findMany({ where: { isDeleted: true } }),
        this.prisma.department.findMany({ where: { isDeleted: true } }),
        this.prisma.course.findMany({ where: { isDeleted: true } }),
        this.prisma.voter.findMany({ where: { isDeleted: true } }),
        this.prisma.ballot.findMany({ where: { Ballot_IsDeleted: true } })
      ]);

      // Permanently delete candidates
      for (const candidate of candidates) {
        try {
          await this.permanentlyDeleteCandidate(candidate.id);
          results.candidates++;
        } catch (error) {
          results.errors.push({ type: 'candidate', id: candidate.id, error: error.message });
        }
      }

      // Permanently delete positions
      for (const position of positions) {
        try {
          await this.permanentlyDeletePosition(position.id);
          results.positions++;
        } catch (error) {
          results.errors.push({ type: 'position', id: position.id, error: error.message });
        }
      }

      // Permanently delete departments
      for (const department of departments) {
        try {
          await this.permanentlyDeleteDepartment(department.id);
          results.departments++;
        } catch (error) {
          results.errors.push({ type: 'department', id: department.id, error: error.message });
        }
      }

      // Permanently delete courses
      for (const course of courses) {
        try {
          await this.permanentlyDeleteCourse(course.id);
          results.courses++;
        } catch (error) {
          results.errors.push({ type: 'course', id: course.id, error: error.message });
        }
      }

      // Permanently delete voters
      for (const voter of voters) {
        try {
          await this.permanentlyDeleteVoter(voter.id);
          results.voters++;
        } catch (error) {
          results.errors.push({ type: 'voter', id: voter.id, error: error.message });
        }
      }

      // Permanently delete ballots
      for (const ballot of ballots) {
        try {
          await this.permanentlyDeleteBallot(ballot.id);
          results.ballots++;
        } catch (error) {
          results.errors.push({ type: 'ballot', id: ballot.id, error: error.message });
        }
      }

      return {
        message: `Trash emptied successfully! Deleted: ${results.candidates} candidates, ${results.positions} positions, ${results.departments} departments, ${results.courses} courses, ${results.voters} voters, ${results.ballots} ballots`,
        results,
        errors: results.errors.length > 0 ? results.errors : null
      };
    } catch (error) {
      throw new Error(`Failed to empty trash: ${error.message}`);
    }
  }
}