import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  // Get summary of all deleted items
  async getTrashSummary() {
    const [candidates, positions, departments, courses, voters, elections] = await Promise.all([
      this.prisma.candidate.count({ where: { isDeleted: true } }),
      this.prisma.position.count({ where: { isDeleted: true } }),
      this.prisma.department.count({ where: { isDeleted: true } }),
      this.prisma.course.count({ where: { isDeleted: true } }),
      this.prisma.voter.count({ where: { isDeleted: true } }),
      this.prisma.election.count({ where: { isDeleted: true } })
    ]);

    return {
      candidates,
      positions,
      departments,
      courses,
      voters,
      elections,
      total: candidates + positions + departments + courses + voters + elections
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
        admin: {
          select: { username: true }
        }
      },
      orderBy: { deletedAt: 'desc' }
    });
  }

  // Get deleted courses
  async getDeletedCourses() {
    return await this.prisma.course.findMany({
      where: { isDeleted: true },
      include: {
        department: true,
        admin: {
          select: { username: true }
        }
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

  // Restore candidate
  async restoreCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId, isDeleted: true }
    });

    if (!candidate) {
      throw new NotFoundException('Deleted candidate not found');
    }

    return await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        isDeleted: false,
        deletedAt: null
      },
      include: {
        position: true,
        department: true,
        course: true
      }
    });
  }

  // Restore position
  async restorePosition(positionId: string) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId, isDeleted: true }
    });

    if (!position) {
      throw new NotFoundException('Deleted position not found');
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
      where: { id: departmentId, isDeleted: true }
    });

    if (!department) {
      throw new NotFoundException('Deleted department not found');
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
      where: { id: courseId, isDeleted: true }
    });

    if (!course) {
      throw new NotFoundException('Deleted course not found');
    }

    return await this.prisma.course.update({
      where: { id: courseId },
      data: {
        isDeleted: false,
        deletedAt: null
      },
      include: {
        department: true
      }
    });
  }

  // Restore voter
  async restoreVoter(voterId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId, isDeleted: true }
    });

    if (!voter) {
      throw new NotFoundException('Deleted voter not found');
    }

    return await this.prisma.voter.update({
      where: { id: voterId },
      data: {
        isDeleted: false,
        deletedAt: null
      },
      include: {
        department: true,
        course: true
      }
    });
  }

  // Bulk restore items
  async bulkRestore(itemIds: string[], itemType: 'candidate' | 'position' | 'department' | 'course' | 'voter') {
    const restoreFunctions = {
      candidate: this.restoreCandidate.bind(this),
      position: this.restorePosition.bind(this),
      department: this.restoreDepartment.bind(this),
      course: this.restoreCourse.bind(this),
      voter: this.restoreVoter.bind(this)
    };

    const results = [];
    const errors = [];

    for (const id of itemIds) {
      try {
        const result = await restoreFunctions[itemType](id);
        results.push(result);
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    return {
      restored: results,
      errors,
      successCount: results.length,
      errorCount: errors.length
    };
  }

  // Permanently delete candidate (admin only)
  async permanentlyDeleteCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId, isDeleted: true }
    });

    if (!candidate) {
      throw new NotFoundException('Deleted candidate not found');
    }

    // For now, we'll allow permanent deletion of candidates
    // In the future, we can add more sophisticated checks
    return await this.prisma.candidate.delete({
      where: { id: candidateId }
    });
  }

  // Permanently delete position (admin only)
  async permanentlyDeletePosition(positionId: string) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId, isDeleted: true }
    });

    if (!position) {
      throw new NotFoundException('Deleted position not found');
    }

    // For now, we'll allow permanent deletion of positions
    // In the future, we can add more sophisticated checks
    return await this.prisma.position.delete({
      where: { id: positionId }
    });
  }

  // Permanently delete department (admin only)
  async permanentlyDeleteDepartment(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId, isDeleted: true }
    });

    if (!department) {
      throw new NotFoundException('Deleted department not found');
    }

    // For now, we'll allow permanent deletion of departments
    // In the future, we can add more sophisticated checks
    return await this.prisma.department.delete({
      where: { id: departmentId }
    });
  }

  // Permanently delete course (admin only)
  async permanentlyDeleteCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, isDeleted: true }
    });

    if (!course) {
      throw new NotFoundException('Deleted course not found');
    }

    // For now, we'll allow permanent deletion of courses
    // In the future, we can add more sophisticated checks
    return await this.prisma.course.delete({
      where: { id: courseId }
    });
  }

  // Permanently delete voter (admin only)
  async permanentlyDeleteVoter(voterId: string) {
    const voter = await this.prisma.voter.findUnique({
      where: { id: voterId, isDeleted: true }
    });

    if (!voter) {
      throw new NotFoundException('Deleted voter not found');
    }

    // For now, we'll allow permanent deletion of voters
    // In the future, we can add more sophisticated checks
    return await this.prisma.voter.delete({
      where: { id: voterId }
    });
  }

  // Empty trash (permanently delete all soft-deleted items)
  async emptyTrash() {
    const results = {
      candidates: 0,
      positions: 0,
      departments: 0,
      courses: 0,
      voters: 0,
      elections: 0,
      errors: []
    };

    try {
      // Get all soft-deleted items
      const [candidates, positions, departments, courses, voters, elections] = await Promise.all([
        this.prisma.candidate.findMany({ where: { isDeleted: true } }),
        this.prisma.position.findMany({ where: { isDeleted: true } }),
        this.prisma.department.findMany({ where: { isDeleted: true } }),
        this.prisma.course.findMany({ where: { isDeleted: true } }),
        this.prisma.voter.findMany({ where: { isDeleted: true } }),
        this.prisma.election.findMany({ where: { isDeleted: true } })
      ]);

      // Attempt to permanently delete each item
      for (const candidate of candidates) {
        try {
          await this.permanentlyDeleteCandidate(candidate.id);
          results.candidates++;
        } catch (error) {
          results.errors.push({ type: 'candidate', id: candidate.id, error: error.message });
        }
      }

      for (const position of positions) {
        try {
          await this.permanentlyDeletePosition(position.id);
          results.positions++;
        } catch (error) {
          results.errors.push({ type: 'position', id: position.id, error: error.message });
        }
      }

      for (const department of departments) {
        try {
          await this.permanentlyDeleteDepartment(department.id);
          results.departments++;
        } catch (error) {
          results.errors.push({ type: 'department', id: department.id, error: error.message });
        }
      }

      for (const course of courses) {
        try {
          await this.permanentlyDeleteCourse(course.id);
          results.courses++;
        } catch (error) {
          results.errors.push({ type: 'course', id: course.id, error: error.message });
        }
      }

      for (const voter of voters) {
        try {
          await this.permanentlyDeleteVoter(voter.id);
          results.voters++;
        } catch (error) {
          results.errors.push({ type: 'voter', id: voter.id, error: error.message });
        }
      }

      for (const election of elections) {
        try {
          await this.permanentlyDeleteElection(election.id);
          results.elections++;
        } catch (error) {
          results.errors.push({ type: 'election', id: election.id, error: error.message });
        }
      }

      return {
        message: `Trash emptied successfully! Deleted: ${results.candidates} candidates, ${results.positions} positions, ${results.departments} departments, ${results.courses} courses, ${results.voters} voters, ${results.elections} elections`,
        results,
        errors: results.errors.length > 0 ? results.errors : null
      };
    } catch (error) {
      throw new Error(`Failed to empty trash: ${error.message}`);
    }
  }

  // ===== ELECTION TRASH MANAGEMENT =====

  async getDeletedElections() {
    return await this.prisma.election.findMany({
      where: { isDeleted: true },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        electionPositions: {
          include: {
            position: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        electionCandidates: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                studentId: true,
              },
            },
          },
        },
        votes: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async restoreElection(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    if (!election.isDeleted) {
      throw new Error('Election is not deleted');
    }

    return await this.prisma.election.update({
      where: { id: electionId },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });
  }

  async permanentlyDeleteElection(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      include: {
        _count: {
          select: {
            votes: true,
            electionPositions: true,
            electionCandidates: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    if (!election.isDeleted) {
      throw new Error('Election must be soft-deleted before permanent deletion');
    }

    // Check if election has votes (prevent deletion if votes exist)
    if (election._count.votes > 0) {
      throw new Error('Cannot permanently delete election with voting history. Votes must be preserved for audit purposes.');
    }

    // Use a transaction to ensure all related data is deleted properly
    return await this.prisma.$transaction(async (tx) => {
      // First delete audit logs
      if (election._count.auditLogs > 0) {
        await tx.auditLog.deleteMany({
          where: { electionId }
        });
      }

      // Then delete election candidates
      if (election._count.electionCandidates > 0) {
        await tx.electionCandidate.deleteMany({
          where: { electionId }
        });
      }

      // Then delete election positions
      if (election._count.electionPositions > 0) {
        await tx.electionPosition.deleteMany({
          where: { electionId }
        });
      }

      // Finally delete the election
      return await tx.election.delete({
        where: { id: electionId }
      });
    });
  }
}
