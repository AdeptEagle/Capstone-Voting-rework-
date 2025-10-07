import { PartialType } from '@nestjs/swagger';
import { CreatePartyListDto } from './create-party-list.dto';

export class UpdatePartyListDto extends PartialType(CreatePartyListDto) {}
