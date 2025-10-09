"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
// I cant' get this import to work locally. The import in node_modules is
// javy/dist but esbuild requires the import to be javy/fs
//
// @ts-expect-error
const fs_1 = require("javy/fs");
function log(msg) {
    const encoder = new TextEncoder();
    (0, fs_1.writeFileSync)(fs_1.STDIO.Stderr, encoder.encode(msg));
}
exports.log = log;
