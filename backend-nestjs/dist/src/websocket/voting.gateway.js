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
var VotingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let VotingGateway = VotingGateway_1 = class VotingGateway {
    constructor() {
        this.logger = new common_1.Logger(VotingGateway_1.name);
        this.connectedClients = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.connectedClients.set(client.id, client);
        client.emit('connected', {
            message: 'Connected to Voting System WebSocket',
            clientId: client.id,
            timestamp: new Date().toISOString(),
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    emitVoteUpdate(electionId, voteData) {
        this.server.emit('vote-updated', {
            electionId,
            voteData,
            timestamp: new Date().toISOString(),
        });
    }
    emitElectionStatusUpdate(electionId, status, data) {
        this.server.emit('election-status-updated', {
            electionId,
            status,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitVoterRegistered(voterData) {
        console.log('🔌 [WebSocket] Emitting voter-registered event to all clients');
        console.log('📊 Connected clients count:', this.connectedClients.size);
        this.server.emit('voter-registered', {
            voterData,
            timestamp: new Date().toISOString(),
        });
        console.log('✅ [WebSocket] voter-registered event emitted successfully');
    }
    emitVoterUpdated(voterData) {
        this.server.emit('voter-updated', {
            voterData,
            timestamp: new Date().toISOString(),
        });
    }
    emitVoterDeleted(voterId) {
        this.server.emit('voter-deleted', {
            voterId,
            timestamp: new Date().toISOString(),
        });
    }
    emitCandidateUpdated(candidateData) {
        this.server.emit('candidate-updated', {
            candidateData,
            timestamp: new Date().toISOString(),
        });
    }
    emitPositionUpdated(positionData) {
        this.server.emit('position-updated', {
            positionData,
            timestamp: new Date().toISOString(),
        });
    }
    emitElectionCreated(electionData) {
        this.server.emit('election-created', {
            electionData,
            timestamp: new Date().toISOString(),
        });
    }
    emitElectionUpdated(electionData) {
        this.server.emit('election-updated', {
            electionData,
            timestamp: new Date().toISOString(),
        });
    }
    emitResultsUpdate(electionId, resultsData) {
        this.server.emit('results-updated', {
            electionId,
            resultsData,
            timestamp: new Date().toISOString(),
        });
    }
    emitAdminAction(action, data) {
        console.log('🔌 [WebSocket] Emitting admin-action event to all clients');
        console.log('📊 Connected clients count:', this.connectedClients.size);
        this.server.emit('admin-action', {
            action,
            data,
            timestamp: new Date().toISOString(),
        });
        console.log('✅ [WebSocket] admin-action event emitted successfully');
    }
    emitNotification(type, message, data) {
        this.server.emit('notification', {
            type,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }
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
    handleJoinElection(client, electionId) {
        client.join(`election-${electionId}`);
        client.emit('joined-election', {
            electionId,
            message: `Joined election room: ${electionId}`,
        });
    }
    handleLeaveElection(client, electionId) {
        client.leave(`election-${electionId}`);
        client.emit('left-election', {
            electionId,
            message: `Left election room: ${electionId}`,
        });
    }
    handleGetClientsCount(client) {
        client.emit('clients-count', {
            count: this.connectedClients.size,
            timestamp: new Date().toISOString(),
        });
    }
    handleTestWebSocket(client) {
        console.log('🧪 Test WebSocket request received from client:', client.id);
        this.emitTestEvent();
        client.emit('test-response', {
            message: 'Test response sent directly to client',
            clientId: client.id,
            timestamp: new Date().toISOString(),
        });
    }
    emitToElectionRoom(electionId, event, data) {
        this.server.to(`election-${electionId}`).emit(event, {
            ...data,
            timestamp: new Date().toISOString(),
        });
    }
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
    broadcastToAll(event, data) {
        this.server.emit(event, {
            ...data,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.VotingGateway = VotingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], VotingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-election'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], VotingGateway.prototype, "handleJoinElection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-election'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], VotingGateway.prototype, "handleLeaveElection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-clients-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], VotingGateway.prototype, "handleGetClientsCount", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('test-websocket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], VotingGateway.prototype, "handleTestWebSocket", null);
exports.VotingGateway = VotingGateway = VotingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    })
], VotingGateway);
//# sourceMappingURL=voting.gateway.js.map