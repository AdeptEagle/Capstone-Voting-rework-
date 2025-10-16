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
exports.CreateCandidateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCandidateDto {
}
exports.CreateCandidateDto = CreateCandidateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Candidate name', example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "Candidate_Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Candidate email', example: 'john.doe@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "Candidate_Email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID', example: 'STU123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "Candidate_StudentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position ID', example: 'clx1234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "positionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Department ID (required)', example: 'clx1234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Course ID (required)', example: 'clx1234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Party list name', example: 'Progressive Party', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "party_list_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Party list ID', example: 'clx1234567890', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "partyListId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Candidate manifesto', example: 'I will work for better education...', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "manifesto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Candidate photo URL', example: '/uploads/images/candidate-photo.jpg', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCandidateDto.prototype, "photo", void 0);
//# sourceMappingURL=create-candidate.dto.js.map