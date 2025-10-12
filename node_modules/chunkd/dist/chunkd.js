"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function chunkd(array, index, total) {
    let length = array.length;
    let size = Math.floor(length / total);
    let remainder = length % total;
    let offset = Math.min(index, remainder) + index * size;
    let chunk = size + (index < remainder ? 1 : 0);
    return array.slice(offset, offset + chunk);
}
exports.default = chunkd;
module.exports = chunkd;
//# sourceMappingURL=chunkd.js.map