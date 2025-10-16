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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthController = class HealthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        const startTime = Date.now();
        let databaseStatus = 'disconnected';
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            databaseStatus = 'connected';
            console.log(`[${new Date().toISOString()}] 🏥 Health check - Database connected`);
        }
        catch (error) {
            databaseStatus = 'error';
            console.error(`[${new Date().toISOString()}] 🏥 Health check - Database error:`, error.message);
        }
        const responseTime = Date.now() - startTime;
        const healthData = {
            status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 8080,
            database: databaseStatus,
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
        };
        console.log(`[${new Date().toISOString()}] 🏥 Health check response:`, {
            status: healthData.status,
            database: healthData.database,
            responseTime: healthData.responseTime
        });
        return healthData;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Application health status',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                environment: { type: 'string', example: 'development' },
                port: { type: 'number', example: 8080 },
                database: { type: 'string', example: 'connected' },
                uptime: { type: 'number', example: 123.45 },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map