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
exports.CastVoteDto = exports.VoteSelectionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class VoteSelectionDto {
}
exports.VoteSelectionDto = VoteSelectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position ID', example: 'POS-123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VoteSelectionDto.prototype, "positionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Candidate ID', example: 'CAND-123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VoteSelectionDto.prototype, "candidateId", void 0);
class CastVoteDto {
}
exports.CastVoteDto = CastVoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ballot ID', example: 'BALLOT-123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CastVoteDto.prototype, "ballotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of vote selections',
        type: [VoteSelectionDto],
        example: [
            { positionId: 'POS-123456', candidateId: 'CAND-123456' },
            { positionId: 'POS-789012', candidateId: 'CAND-789012' }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VoteSelectionDto),
    __metadata("design:type", Array)
], CastVoteDto.prototype, "votes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verification code (optional)', example: 'ABC123', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CastVoteDto.prototype, "verificationCode", void 0);
//# sourceMappingURL=cast-vote.dto.js.map