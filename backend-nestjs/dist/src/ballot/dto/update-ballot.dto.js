"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBallotDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_ballot_dto_1 = require("./create-ballot.dto");
class UpdateBallotDto extends (0, mapped_types_1.PartialType)(create_ballot_dto_1.CreateBallotDto) {
}
exports.UpdateBallotDto = UpdateBallotDto;
//# sourceMappingURL=update-ballot.dto.js.map