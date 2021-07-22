"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const auth_1 = __importDefault(require("./middleware/auth"));
const client_1 = __importDefault(require("./routes/client"));
const user_1 = __importDefault(require("./routes/user"));
const auth_2 = __importDefault(require("./routes/auth"));
const reportWeather_1 = __importDefault(require("./routes/reportWeather"));
const reportWorker_1 = __importDefault(require("./routes/reportWorker"));
const reportMaterial_1 = __importDefault(require("./routes/reportMaterial"));
const reportTool_1 = __importDefault(require("./routes/reportTool"));
const reportDaily_1 = __importDefault(require("./routes/reportDaily"));
const project_1 = __importDefault(require("./routes/project"));
const reportStatus_1 = __importDefault(require("./routes/reportStatus"));
const userContact_1 = __importDefault(require("./routes/userContact"));
const projectDocument_1 = __importDefault(require("./routes/projectDocument"));
const userPosition_1 = __importDefault(require("./routes/userPosition"));
const reportFeed_1 = __importDefault(require("./routes/reportFeed"));
const requestForInformation_1 = __importDefault(require("./routes/requestForInformation"));
const reportApproval_1 = __importDefault(require("./routes/reportApproval"));
const download_1 = __importDefault(require("./middleware/download"));
const app = express_1.default();
app.set("port", 3000);
app.use(cors_1.default());
// const allowedOrigins = [
//     'http://localhost:4200',
//     'http://app.aknsmartreport.com',
//     'http://www.app.aknsmartreport.com',
// ];
// const options: cors.CorsOptions = {
//     allowedHeaders: [
//       'Origin',
//       'X-Requested-With',
//       'Content-Type',
//       'Accept',
//       'X-Access-Token',
//     ],
//     credentials: false,
//     methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
//     origin: function (origin, callback) {
//         if (allowedOrigins.indexOf(origin!) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     preflightContinue: false,
//   };
// app.use(cors(options));
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});
app.set('socketio', io);
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(express_1.default.static(path.join(__dirname, 'img')));
app.use('/auth', auth_2.default);
app.use('/img/:folder/:file', (req, res, next) => {
    var filePath = path.join(__dirname, 'img', req.params.folder, req.params.file);
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/*',
        'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});
app.use('download/img/:folder/:file', (req, res, next) => {
    var filePath = path.join(__dirname, 'img', req.params.folder, req.params.file);
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/*',
        'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});
app.use('/reportWeather', auth_1.default, reportWeather_1.default);
app.use('/reportMaterial', auth_1.default, reportMaterial_1.default);
app.use('/reportWorker', auth_1.default, reportWorker_1.default);
app.use('/reportTool', auth_1.default, reportTool_1.default);
app.use("/reportDaily", auth_1.default, reportDaily_1.default);
app.use('/reportStatus', auth_1.default, reportStatus_1.default);
app.use('/project', auth_1.default, project_1.default);
app.use('/client', auth_1.default, client_1.default);
app.use('/user', auth_1.default, user_1.default);
app.use('/userContact', auth_1.default, userContact_1.default);
app.use('/projectDocument', auth_1.default, projectDocument_1.default);
app.use('/userPosition', auth_1.default, userPosition_1.default);
app.use('/reportFeed', auth_1.default, reportFeed_1.default);
app.use('/rfi', auth_1.default, requestForInformation_1.default);
app.use('/reportApproval', auth_1.default, reportApproval_1.default);
app.use('/download', auth_1.default, download_1.default);
io.on("connection", function (socket) {
    console.log("a user connected");
});
http.listen(3000, function () {
    console.log("listening on *:3000");
});
//# sourceMappingURL=app.js.map