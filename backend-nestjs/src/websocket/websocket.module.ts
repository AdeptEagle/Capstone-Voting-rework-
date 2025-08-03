import { Module } from '@nestjs/common';
import { VotingGateway } from './voting.gateway';

@Module({
  providers: [VotingGateway],
  exports: [VotingGateway],
})
export class WebsocketModule {} 