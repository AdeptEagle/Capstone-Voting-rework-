"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePartyListDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_party_list_dto_1 = require("./create-party-list.dto");
class UpdatePartyListDto extends (0, swagger_1.PartialType)(create_party_list_dto_1.CreatePartyListDto) {
}
exports.UpdatePartyListDto = UpdatePartyListDto;
//# sourceMappingURL=update-party-list.dto.js.map