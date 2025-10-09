"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colName = exports.argName = exports.fieldName = void 0;
// https://stackoverflow.com/questions/40710628/how-to-convert-snake-case-to-camelcase
function fieldName(prefix, index, column) {
    let name = `${prefix}_${index}`;
    if (column) {
        name = column.name;
    }
    return name
        .toLowerCase()
        .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace("_", ""));
}
exports.fieldName = fieldName;
function argName(index, column) {
    return fieldName("arg", index, column);
}
exports.argName = argName;
function colName(index, column) {
    return fieldName("col", index, column);
}
exports.colName = colName;
