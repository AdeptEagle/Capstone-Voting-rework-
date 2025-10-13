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
exports.TemplateInitializationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const default_templates_1 = require("../templates/default-templates");
let TemplateInitializationService = class TemplateInitializationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        setTimeout(async () => {
            await this.ensureTemplatesExist();
        }, 2000);
    }
    async ensureTemplatesExist() {
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                console.log(`🔍 Checking for ballot templates... (Attempt ${retryCount + 1}/${maxRetries})`);
                const admin = await this.prisma.admin.findFirst();
                if (!admin) {
                    console.log('⚠️ No admin found, retrying in 2 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    retryCount++;
                    continue;
                }
                console.log(`👤 Using admin: ${admin.Admin_Username}`);
                const existingTemplates = await this.prisma.ballotTemplate.findMany({
                    where: {
                        id: {
                            in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                        }
                    }
                });
                const existingTemplateIds = existingTemplates.map(t => t.id);
                const missingTemplates = default_templates_1.DEFAULT_BALLOT_TEMPLATES.filter(template => !existingTemplateIds.includes(template.id));
                console.log(`📊 Found ${existingTemplates.length} existing templates`);
                console.log(`📊 Missing ${missingTemplates.length} templates`);
                if (missingTemplates.length === 0) {
                    console.log('✅ All ballot templates are already present');
                    return;
                }
                console.log(`📋 Initializing ${missingTemplates.length} missing ballot templates...`);
                const createdTemplates = [];
                for (const template of missingTemplates) {
                    try {
                        console.log(`🔄 Creating template: ${template.name}`);
                        const createdTemplate = await this.prisma.ballotTemplate.create({
                            data: {
                                id: template.id,
                                BallotTemplate_Name: template.name,
                                BallotTemplate_Description: template.description,
                                BallotTemplate_Data: template.data,
                                BallotTemplate_IsPublic: template.isPublic,
                                BallotTemplate_CreatedBy: admin.id,
                            },
                        });
                        createdTemplates.push(createdTemplate);
                        console.log(`✅ Created: ${createdTemplate.BallotTemplate_Name} (${(template.data.positions || []).length} positions)`);
                    }
                    catch (error) {
                        console.error(`❌ Failed to create template ${template.name}:`, error);
                    }
                }
                console.log(`✅ Successfully initialized ${createdTemplates.length} ballot templates:`);
                createdTemplates.forEach(template => {
                    console.log(`   - ${template.BallotTemplate_Name}`);
                });
                const finalCheck = await this.prisma.ballotTemplate.findMany({
                    where: {
                        id: {
                            in: default_templates_1.DEFAULT_BALLOT_TEMPLATES.map(t => t.id)
                        }
                    }
                });
                console.log(`🔍 Final verification: ${finalCheck.length}/${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length} templates present`);
                if (finalCheck.length === default_templates_1.DEFAULT_BALLOT_TEMPLATES.length) {
                    console.log('🎉 All templates are now available!');
                    return;
                }
                else {
                    throw new Error(`Only ${finalCheck.length}/${default_templates_1.DEFAULT_BALLOT_TEMPLATES.length} templates found`);
                }
            }
            catch (error) {
                console.error(`❌ Error initializing ballot templates (Attempt ${retryCount + 1}):`, error);
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`⏳ Retrying in 3 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                else {
                    console.error('💥 Failed to initialize templates after maximum retries');
                }
            }
        }
    }
};
exports.TemplateInitializationService = TemplateInitializationService;
exports.TemplateInitializationService = TemplateInitializationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateInitializationService);
//# sourceMappingURL=template-initialization.service.js.map