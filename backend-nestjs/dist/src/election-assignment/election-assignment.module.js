"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionAssignmentModule = void 0;
const common_1 = require("@nestjs/common");
const election_assignment_controller_1 = require("./election-assignment.controller");
const election_assignment_service_1 = require("./election-assignment.service");
const prisma_module_1 = require("../prisma/prisma.module");
const id_generator_service_1 = require("../utils/id-generator.service");
let ElectionAssignmentModule = class ElectionAssignmentModule {
};
exports.ElectionAssignmentModule = ElectionAssignmentModule;
exports.ElectionAssignmentModule = ElectionAssignmentModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [election_assignment_controller_1.ElectionAssignmentController],
        providers: [election_assignment_service_1.ElectionAssignmentService, id_generator_service_1.IdGeneratorService],
        exports: [election_assignment_service_1.ElectionAssignmentService],
    })
], ElectionAssignmentModule);
//# sourceMappingURL=election-assignment.module.js.map