"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFuturePhilippineTime = exports.getFuturePhilippineTime = exports.toPhilippineTime = exports.getPhilippineTime = void 0;
const getPhilippineTime = () => {
    const now = new Date();
    const philippineOffset = 8 * 60;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (philippineOffset * 60000));
};
exports.getPhilippineTime = getPhilippineTime;
const toPhilippineTime = (date) => {
    const philippineOffset = 8 * 60;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (philippineOffset * 60000));
};
exports.toPhilippineTime = toPhilippineTime;
const getFuturePhilippineTime = (minutesFromNow = 1) => {
    const philippineTime = (0, exports.getPhilippineTime)();
    return new Date(philippineTime.getTime() + minutesFromNow * 60000);
};
exports.getFuturePhilippineTime = getFuturePhilippineTime;
const isFuturePhilippineTime = (date, bufferMinutes = 1) => {
    const philippineTime = (0, exports.getPhilippineTime)();
    const bufferTime = new Date(philippineTime.getTime() + bufferMinutes * 60000);
    return date >= bufferTime;
};
exports.isFuturePhilippineTime = isFuturePhilippineTime;
//# sourceMappingURL=timezone.util.js.map