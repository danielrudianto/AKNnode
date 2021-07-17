"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
exports.Client = database_1.default.define("client", {
    Id: {
        type: sequelize_1.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    Name: sequelize_1.STRING,
    Address: sequelize_1.STRING,
    City: sequelize_1.STRING,
    Pic: sequelize_1.STRING,
    PhoneNumber: sequelize_1.STRING,
    Email: sequelize_1.STRING,
    TaxIdentificationNumber: sequelize_1.STRING,
    CreatedBy: sequelize_1.INTEGER,
    CreatedDate: {
        type: sequelize_1.DATE,
        allowNull: false
    }
});
