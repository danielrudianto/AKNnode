"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = __importDefault(require("./routes/client"));
const user_1 = __importDefault(require("./routes/user"));
const database_1 = __importDefault(require("./util/database"));
const app = express_1.default();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use('/user', user_1.default);
app.use('/client', client_1.default);
database_1.default.sync().then(result => {
    console.log(result);
    app.listen(3000);
}).catch(error => {
    console.log(error);
});
