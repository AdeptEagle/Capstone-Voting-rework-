"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVoterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_voter_dto_1 = require("./create-voter.dto");
class UpdateVoterDto extends (0, swagger_1.PartialType)(create_voter_dto_1.CreateVoterDto) {
}
exports.UpdateVoterDto = UpdateVoterDto;
//# sourceMappingURL=update-voter.dto.js.map