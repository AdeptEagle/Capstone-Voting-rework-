"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const voter_module_1 = require("./voter/voter.module");
const candidate_module_1 = require("./candidate/candidate.module");
const position_module_1 = require("./position/position.module");
const vote_module_1 = require("./vote/vote.module");
const department_module_1 = require("./department/department.module");
const course_module_1 = require("./course/course.module");
const file_upload_module_1 = require("./modules/file-upload.module");
const audit_module_1 = require("./audit/audit.module");
const trash_module_1 = require("./trash/trash.module");
const ballot_module_1 = require("./ballot/ballot.module");
const ballot_template_module_1 = require("./ballot-template/ballot-template.module");
const party_list_module_1 = require("./party-list/party-list.module");
const analytics_module_1 = require("./analytics/analytics.module");
const scheduler_service_1 = require("./services/scheduler.service");
const timezone_service_1 = require("./services/timezone.service");
const template_initialization_service_1 = require("./services/template-initialization.service");
const position_initialization_service_1 = require("./services/position-initialization.service");
const department_course_initialization_service_1 = require("./services/department-course-initialization.service");
const log_cleanup_config_service_1 = require("./services/log-cleanup-config.service");
const nuclear_reset_service_1 = require("./services/nuclear-reset.service");
const timezone_controller_1 = require("./controllers/timezone.controller");
const maintenance_controller_1 = require("./controllers/maintenance.controller");
const nuclear_reset_controller_1 = require("./controllers/nuclear-reset.controller");
const websocket_module_1 = require("./websocket/websocket.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            voter_module_1.VoterModule,
            candidate_module_1.CandidateModule,
            position_module_1.PositionModule,
            vote_module_1.VoteModule,
            department_module_1.DepartmentModule,
            course_module_1.CourseModule,
            file_upload_module_1.FileUploadModule,
            audit_module_1.AuditModule,
            trash_module_1.TrashModule,
            ballot_module_1.BallotModule,
            ballot_template_module_1.BallotTemplateModule,
            party_list_module_1.PartyListModule,
            analytics_module_1.AnalyticsModule,
            websocket_module_1.WebsocketModule,
            health_module_1.HealthModule,
        ],
        controllers: [timezone_controller_1.TimezoneController, maintenance_controller_1.MaintenanceController, nuclear_reset_controller_1.NuclearResetController],
        providers: [scheduler_service_1.SchedulerService, timezone_service_1.TimezoneService, template_initialization_service_1.TemplateInitializationService, position_initialization_service_1.PositionInitializationService, department_course_initialization_service_1.DepartmentCourseInitializationService, log_cleanup_config_service_1.LogCleanupConfigService, nuclear_reset_service_1.NuclearResetService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map