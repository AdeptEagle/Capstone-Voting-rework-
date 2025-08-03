import { PartialType } from '@nestjs/swagger';
import { CreateElectionAssignmentDto } from './create-election-assignment.dto';

export class UpdateElectionAssignmentDto extends PartialType(CreateElectionAssignmentDto) {} 