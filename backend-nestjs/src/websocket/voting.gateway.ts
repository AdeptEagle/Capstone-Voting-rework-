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
  emitVoteUpdate(ballotId: string, voteData: any) {
    this.server.emit('vote-updated', {
      ballotId,
      voteData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time ballot status updates
  emitBallotStatusUpdate(ballotId: string, status: string, data?: any) {
    this.server.emit('ballot-status-updated', {
      ballotId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time voter registration
  emitVoterRegistered(voterData: any) {
    console.log('🔌 [WebSocket] Emitting voter-registered event to all clients');
    console.log('📊 Connected clients count:', this.connectedClients.size);
    this.server.emit('voter-registered', {
      voterData,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ [WebSocket] voter-registered event emitted successfully');
  }

  // Real-time voter updates
  emitVoterUpdated(voterData: any) {
    this.server.emit('voter-updated', {
      voterData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time voter deletions
  emitVoterDeleted(voterId: string) {
    this.server.emit('voter-deleted', {
      voterId,
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

  // Real-time ballot creation
  emitBallotCreated(ballotData: any) {
    this.server.emit('ballot-created', {
      ballotData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time ballot updates
  emitBallotUpdated(ballotData: any) {
    this.server.emit('ballot-updated', {
      ballotData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time results updates
  emitResultsUpdate(ballotId: string, resultsData: any) {
    this.server.emit('results-updated', {
      ballotId,
      resultsData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time admin actions
  emitAdminAction(action: string, data: any) {
    console.log('🔌 [WebSocket] Emitting admin-action event to all clients');
    console.log('📊 Connected clients count:', this.connectedClients.size);
    this.server.emit('admin-action', {
      action,
      data,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ [WebSocket] admin-action event emitted successfully');
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

  // Test event to verify WebSocket functionality
  emitTestEvent() {
    console.log('🧪 [WebSocket] Emitting test event to all clients');
    console.log('📊 Connected clients count:', this.connectedClients.size);
    console.log('🔌 Client IDs:', Array.from(this.connectedClients.keys()));
    
    this.server.emit('test-event', {
      message: 'This is a test event from the server',
      timestamp: new Date().toISOString(),
      clientCount: this.connectedClients.size,
    });
    
    console.log('✅ [WebSocket] Test event emitted successfully');
  }

  // Join specific ballot room
  @SubscribeMessage('join-ballot')
  handleJoinBallot(client: Socket, ballotId: string) {
    client.join(`ballot-${ballotId}`);
    client.emit('joined-ballot', {
      ballotId,
      message: `Joined ballot room: ${ballotId}`,
    });
  }

  // Leave specific ballot room
  @SubscribeMessage('leave-ballot')
  handleLeaveBallot(client: Socket, ballotId: string) {
    client.leave(`ballot-${ballotId}`);
    client.emit('left-ballot', {
      ballotId,
      message: `Left ballot room: ${ballotId}`,
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

  // Test WebSocket functionality
  @SubscribeMessage('test-websocket')
  handleTestWebSocket(client: Socket) {
    console.log('🧪 Test WebSocket request received from client:', client.id);
    this.emitTestEvent();
    
    // Also send a direct response to the requesting client
    client.emit('test-response', {
      message: 'Test response sent directly to client',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to specific ballot room
  emitToBallotRoom(ballotId: string, event: string, data: any) {
    this.server.to(`ballot-${ballotId}`).emit(event, {
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