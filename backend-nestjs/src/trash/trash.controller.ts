import { Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Trash Management')
@Controller('trash')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary of all deleted items' })
  @ApiResponse({ status: 200, description: 'Trash summary retrieved successfully' })
  async getTrashSummary() {
    return await this.trashService.getTrashSummary();
  }

  @Get('candidates')
  @ApiOperation({ summary: 'Get all deleted candidates' })
  @ApiResponse({ status: 200, description: 'Deleted candidates retrieved successfully' })
  async getDeletedCandidates() {
    return await this.trashService.getDeletedCandidates();
  }

  @Get('positions')
  @ApiOperation({ summary: 'Get all deleted positions' })
  @ApiResponse({ status: 200, description: 'Deleted positions retrieved successfully' })
  async getDeletedPositions() {
    return await this.trashService.getDeletedPositions();
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all deleted departments' })
  @ApiResponse({ status: 200, description: 'Deleted departments retrieved successfully' })
  async getDeletedDepartments() {
    return await this.trashService.getDeletedDepartments();
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all deleted courses' })
  @ApiResponse({ status: 200, description: 'Deleted courses retrieved successfully' })
  async getDeletedCourses() {
    return await this.trashService.getDeletedCourses();
  }

  @Get('voters')
  @ApiOperation({ summary: 'Get all deleted voters' })
  @ApiResponse({ status: 200, description: 'Deleted voters retrieved successfully' })
  async getDeletedVoters() {
    return await this.trashService.getDeletedVoters();
  }

  @Get('elections')
  @ApiOperation({ summary: 'Get all deleted elections' })
  @ApiResponse({ status: 200, description: 'List of deleted elections' })
  async getDeletedElections() {
    return await this.trashService.getDeletedElections();
  }

  @Post('restore/candidate/:id')
  @ApiOperation({ summary: 'Restore a deleted candidate' })
  @ApiResponse({ status: 200, description: 'Candidate restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted candidate not found' })
  async restoreCandidate(@Param('id') id: string) {
    return await this.trashService.restoreCandidate(id);
  }

  @Post('restore/position/:id')
  @ApiOperation({ summary: 'Restore a deleted position' })
  @ApiResponse({ status: 200, description: 'Position restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted position not found' })
  async restorePosition(@Param('id') id: string) {
    return await this.trashService.restorePosition(id);
  }

  @Post('restore/department/:id')
  @ApiOperation({ summary: 'Restore a deleted department' })
  @ApiResponse({ status: 200, description: 'Department restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted department not found' })
  async restoreDepartment(@Param('id') id: string) {
    return await this.trashService.restoreDepartment(id);
  }

  @Post('restore/course/:id')
  @ApiOperation({ summary: 'Restore a deleted course' })
  @ApiResponse({ status: 200, description: 'Course restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted course not found' })
  async restoreCourse(@Param('id') id: string) {
    return await this.trashService.restoreCourse(id);
  }

  @Post('restore/voter/:id')
  @ApiOperation({ summary: 'Restore a deleted voter' })
  @ApiResponse({ status: 200, description: 'Voter restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted voter not found' })
  async restoreVoter(@Param('id') id: string) {
    return await this.trashService.restoreVoter(id);
  }

  @Post('restore/election/:id')
  @ApiOperation({ summary: 'Restore deleted election' })
  @ApiResponse({ status: 200, description: 'Election restored successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async restoreElection(@Param('id') id: string) {
    return await this.trashService.restoreElection(id);
  }

  @Post('restore/bulk')
  @ApiOperation({ summary: 'Bulk restore deleted items' })
  @ApiResponse({ status: 200, description: 'Items restored successfully' })
  async bulkRestore(@Body() body: { itemIds: string[], itemType: 'candidate' | 'position' | 'department' | 'course' | 'voter' }) {
    return await this.trashService.bulkRestore(body.itemIds, body.itemType);
  }

  @Delete('permanent/candidate/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete a candidate (Admin only)' })
  @ApiResponse({ status: 200, description: 'Candidate permanently deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete candidate with dependencies' })
  @ApiResponse({ status: 404, description: 'Deleted candidate not found' })
  @HttpCode(HttpStatus.OK)
  async permanentlyDeleteCandidate(@Param('id') id: string) {
    return await this.trashService.permanentlyDeleteCandidate(id);
  }

  @Delete('permanent/position/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete a position (Admin only)' })
  @ApiResponse({ status: 200, description: 'Position permanently deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete position with dependencies' })
  @ApiResponse({ status: 404, description: 'Deleted position not found' })
  @HttpCode(HttpStatus.OK)
  async permanentlyDeletePosition(@Param('id') id: string) {
    return await this.trashService.permanentlyDeletePosition(id);
  }

  @Delete('permanent/department/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete a department (Admin only)' })
  @ApiResponse({ status: 200, description: 'Department permanently deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete department with dependencies' })
  @ApiResponse({ status: 404, description: 'Deleted department not found' })
  @HttpCode(HttpStatus.OK)
  async permanentlyDeleteDepartment(@Param('id') id: string) {
    return await this.trashService.permanentlyDeleteDepartment(id);
  }

  @Delete('permanent/course/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete a course (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course permanently deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete course with dependencies' })
  @ApiResponse({ status: 404, description: 'Deleted course not found' })
  @HttpCode(HttpStatus.OK)
  async permanentlyDeleteCourse(@Param('id') id: string) {
    return await this.trashService.permanentlyDeleteCourse(id);
  }

  @Delete('permanent/voter/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete a voter (Admin only)' })
  @ApiResponse({ status: 200, description: 'Voter permanently deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete voter with dependencies' })
  @ApiResponse({ status: 404, description: 'Deleted voter not found' })
  @HttpCode(HttpStatus.OK)
  async permanentlyDeleteVoter(@Param('id') id: string) {
    return await this.trashService.permanentlyDeleteVoter(id);
  }

  @Delete('permanent/election/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete election (cannot be undone)' })
  @ApiResponse({ status: 200, description: 'Election permanently deleted' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete election with voting history' })
  async permanentlyDeleteElection(@Param('id') id: string) {
    return await this.trashService.permanentlyDeleteElection(id);
  }

  @Delete('empty')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Empty trash - permanently delete all soft-deleted items (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Trash emptied successfully' })
  @HttpCode(HttpStatus.OK)
  async emptyTrash() {
    return await this.trashService.emptyTrash();
  }
}
