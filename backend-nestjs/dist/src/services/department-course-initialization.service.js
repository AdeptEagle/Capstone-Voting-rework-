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
exports.DepartmentCourseInitializationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DepartmentCourseInitializationService = class DepartmentCourseInitializationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        setTimeout(async () => {
            await this.ensureDepartmentsAndCoursesExist();
        }, 2500);
    }
    getCatalog() {
        return [
            {
                id: 'CBM',
                name: 'College of Business and Management',
                description: 'Business and Management programs',
                courses: [
                    { id: 'BSHM', name: 'BS in Hospitality Management', code: 'BSHM' },
                    { id: 'BSA', name: 'BS in Accountancy', code: 'BSA' },
                    { id: 'BSBA-MM', name: 'BS in Business Administration Major in Marketing Management', code: 'BSBA-MM' },
                    { id: 'BSBA-HRDM', name: 'BS in Business Administration Major in Human Resource Development Management', code: 'BSBA-HRDM' },
                ],
            },
            {
                id: 'CCS',
                name: 'College of Computer Studies',
                description: 'Computing and Information Technology programs',
                courses: [
                    { id: 'BSIT', name: 'BS in Information Technology', code: 'BSIT' },
                ],
            },
            {
                id: 'CEA',
                name: 'College of Education and Arts',
                description: 'Education and Arts programs',
                courses: [
                    { id: 'BEEd-GE', name: 'Bachelor in Elementary Education - General Education', code: 'BEED-GE' },
                    { id: 'BSEd-English', name: 'Bachelor in Secondary Education Major in English', code: 'BSED-ENGLISH' },
                    { id: 'BMC', name: 'Bachelor in Mass Communications', code: 'BMC' },
                ],
            },
            {
                id: 'CoE',
                name: 'College of Engineering',
                description: 'Engineering programs',
                courses: [
                    { id: 'BSEE', name: 'BS in Electrical Engineering', code: 'BSEE' },
                    { id: 'BSCE', name: 'BS in Civil Engineering', code: 'BSCE' },
                    { id: 'BSME', name: 'BS in Mechanical Engineering', code: 'BSME' },
                    { id: 'BSIE', name: 'BS in Industrial Engineering', code: 'BSIE' },
                ],
            },
        ];
    }
    async ensureDepartmentsAndCoursesExist() {
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                console.log(`🔍 Checking departments and courses... (Attempt ${retryCount + 1}/${maxRetries})`);
                const admin = await this.prisma.admin.findFirst();
                if (!admin) {
                    console.log('⚠️ No admin found yet; retrying in 2 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    retryCount++;
                    continue;
                }
                const catalog = this.getCatalog();
                for (const dep of catalog) {
                    const existingDepartment = await this.prisma.department.findUnique({ where: { id: dep.id } });
                    if (!existingDepartment) {
                        try {
                            console.log(`🏢 Creating department: ${dep.name} (${dep.id})`);
                            await this.prisma.department.create({
                                data: {
                                    id: dep.id,
                                    Department_Name: dep.name,
                                    Department_Description: dep.description,
                                    createdBy: admin.id,
                                },
                            });
                        }
                        catch (err) {
                            console.error(`❌ Failed creating department ${dep.id}:`, err);
                        }
                    }
                }
                for (const dep of catalog) {
                    for (const course of dep.courses) {
                        const existingCourse = await this.prisma.course.findFirst({
                            where: {
                                OR: [
                                    { id: course.id },
                                    { Course_Code: course.code }
                                ]
                            }
                        });
                        if (!existingCourse) {
                            try {
                                console.log(`📚 Creating course: ${course.name} (${course.id}) under ${dep.id}`);
                                await this.prisma.course.create({
                                    data: {
                                        id: course.id,
                                        Course_Name: course.name,
                                        Course_Code: course.code,
                                        Course_Description: course.description,
                                        departmentId: dep.id,
                                        createdBy: admin.id,
                                    },
                                });
                            }
                            catch (err) {
                                if (err.code === 'P2002') {
                                    console.log(`⚠️ Course ${course.name} already exists, skipping...`);
                                }
                                else {
                                    console.error(`❌ Failed creating course ${course.id}:`, err);
                                }
                            }
                        }
                    }
                }
                console.log('✅ Departments and courses are ensured.');
                return;
            }
            catch (error) {
                console.error(`❌ Error ensuring departments/courses (Attempt ${retryCount + 1}):`, error);
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log('⏳ Retrying in 3 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                else {
                    console.error('💥 Failed to ensure departments and courses after maximum retries');
                }
            }
        }
    }
};
exports.DepartmentCourseInitializationService = DepartmentCourseInitializationService;
exports.DepartmentCourseInitializationService = DepartmentCourseInitializationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentCourseInitializationService);
//# sourceMappingURL=department-course-initialization.service.js.map