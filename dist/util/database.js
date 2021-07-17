"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const db = 'alpha';
const username = 'root';
const password = 'jamuju18';
exports.sequelize = new sequelize_1.Sequelize(db, username, password, {
    dialect: "mysql",
    port: 3306,
});
exports.default = exports.sequelize;
