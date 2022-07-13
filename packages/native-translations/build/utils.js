"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateXCodeId = void 0;
const uuid_1 = require("uuid");
const generateXCodeId = () => {
    // https://stackoverflow.com/a/22665502/1673761
    return uuid_1.v4().toUpperCase().split('-').slice(1).join('');
};
exports.generateXCodeId = generateXCodeId;
