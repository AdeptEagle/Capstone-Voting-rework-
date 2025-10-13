"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyListModule = void 0;
const common_1 = require("@nestjs/common");
const party_list_service_1 = require("./party-list.service");
const party_list_controller_1 = require("./party-list.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const id_generator_service_1 = require("../utils/id-generator.service");
const file_upload_module_1 = require("../modules/file-upload.module");
let PartyListModule = class PartyListModule {
};
exports.PartyListModule = PartyListModule;
exports.PartyListModule = PartyListModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, file_upload_module_1.FileUploadModule],
        controllers: [party_list_controller_1.PartyListController],
        providers: [party_list_service_1.PartyListService, id_generator_service_1.IdGeneratorService],
        exports: [party_list_service_1.PartyListService],
    })
], PartyListModule);
//# sourceMappingURL=party-list.module.js.map