"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallotModule = void 0;
const common_1 = require("@nestjs/common");
const ballot_service_1 = require("./ballot.service");
const ballot_controller_1 = require("./ballot.controller");
const ballot_results_service_1 = require("./ballot-results.service");
const ballot_results_controller_1 = require("./ballot-results.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const id_generator_service_1 = require("../utils/id-generator.service");
const timezone_service_1 = require("../services/timezone.service");
const audit_service_1 = require("../services/audit.service");
let BallotModule = class BallotModule {
};
exports.BallotModule = BallotModule;
exports.BallotModule = BallotModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [ballot_controller_1.BallotController, ballot_results_controller_1.BallotResultsController],
        providers: [
            ballot_service_1.BallotService,
            ballot_results_service_1.BallotResultsService,
            id_generator_service_1.IdGeneratorService,
            timezone_service_1.TimezoneService,
            audit_service_1.AuditService
        ],
        exports: [ballot_service_1.BallotService, ballot_results_service_1.BallotResultsService],
    })
], BallotModule);
//# sourceMappingURL=ballot.module.js.map