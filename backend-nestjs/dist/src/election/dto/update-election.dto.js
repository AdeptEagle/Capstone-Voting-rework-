"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateElectionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_election_dto_1 = require("./create-election.dto");
class UpdateElectionDto extends (0, swagger_1.PartialType)(create_election_dto_1.CreateElectionDto) {
}
exports.UpdateElectionDto = UpdateElectionDto;
//# sourceMappingURL=update-election.dto.js.map