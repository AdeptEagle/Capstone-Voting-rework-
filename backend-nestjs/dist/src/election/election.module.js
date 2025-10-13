"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionModule = void 0;
const common_1 = require("@nestjs/common");
const election_service_1 = require("./election.service");
const election_controller_1 = require("./election.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const id_generator_service_1 = require("../utils/id-generator.service");
const timezone_service_1 = require("../services/timezone.service");
const voting_gateway_1 = require("../websocket/voting.gateway");
let ElectionModule = class ElectionModule {
};
exports.ElectionModule = ElectionModule;
exports.ElectionModule = ElectionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [election_controller_1.ElectionController],
        providers: [election_service_1.ElectionService, id_generator_service_1.IdGeneratorService, timezone_service_1.TimezoneService, voting_gateway_1.VotingGateway],
        exports: [election_service_1.ElectionService],
    })
], ElectionModule);
//# sourceMappingURL=election.module.js.map