import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'voting',
})
export class VotingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VotingGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    
    // Send initial connection confirmation
    client.emit('connected', {
      message: 'Connected to Voting System WebSocket',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // Real-time vote updates
  emitVoteUpdate(electionId: string, voteData: any) {
    this.server.emit('vote-updated', {
      electionId,
      voteData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time election status updates
  emitElectionStatusUpdate(electionId: string, status: string, data?: any) {
    this.server.emit('election-status-updated', {
      electionId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time voter registration
  emitVoterRegistered(voterData: any) {
    this.server.emit('voter-registered', {
      voterData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time candidate updates
  emitCandidateUpdated(candidateData: any) {
    this.server.emit('candidate-updated', {
      candidateData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time position updates
  emitPositionUpdated(positionData: any) {
    this.server.emit('position-updated', {
      positionData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time election creation
  emitElectionCreated(electionData: any) {
    this.server.emit('election-created', {
      electionData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time results updates
  emitResultsUpdate(electionId: string, resultsData: any) {
    this.server.emit('results-updated', {
      electionId,
      resultsData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time admin actions
  emitAdminAction(action: string, data: any) {
    this.server.emit('admin-action', {
      action,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time system notifications
  emitNotification(type: string, message: string, data?: any) {
    this.server.emit('notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Join specific election room
  @SubscribeMessage('join-election')
  handleJoinElection(client: Socket, electionId: string) {
    client.join(`election-${electionId}`);
    client.emit('joined-election', {
      electionId,
      message: `Joined election room: ${electionId}`,
    });
  }

  // Leave specific election room
  @SubscribeMessage('leave-election')
  handleLeaveElection(client: Socket, electionId: string) {
    client.leave(`election-${electionId}`);
    client.emit('left-election', {
      electionId,
      message: `Left election room: ${electionId}`,
    });
  }

  // Get connected clients count
  @SubscribeMessage('get-clients-count')
  handleGetClientsCount(client: Socket) {
    client.emit('clients-count', {
      count: this.connectedClients.size,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to specific election room
  emitToElectionRoom(electionId: string, event: string, data: any) {
    this.server.to(`election-${electionId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Get all connected clients
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Broadcast to all clients
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
} 