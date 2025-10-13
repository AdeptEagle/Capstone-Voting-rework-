"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallotTemplateModule = void 0;
const common_1 = require("@nestjs/common");
const ballot_template_service_1 = require("./ballot-template.service");
const ballot_template_controller_1 = require("./ballot-template.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const ballot_module_1 = require("../ballot/ballot.module");
let BallotTemplateModule = class BallotTemplateModule {
};
exports.BallotTemplateModule = BallotTemplateModule;
exports.BallotTemplateModule = BallotTemplateModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, ballot_module_1.BallotModule],
        controllers: [ballot_template_controller_1.BallotTemplateController],
        providers: [ballot_template_service_1.BallotTemplateService],
        exports: [ballot_template_service_1.BallotTemplateService],
    })
], BallotTemplateModule);
//# sourceMappingURL=ballot-template.module.js.map