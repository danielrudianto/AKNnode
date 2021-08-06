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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const formidable = __importStar(require("formidable"));
const fs = __importStar(require("fs"));
const uuid = __importStar(require("uuid"));
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.post("/", async (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    form.parse(req, function (err, fields, files) {
        const fileLength = parseInt(fields.Files.toString());
        const progress = fields.Progress;
        const projectId = parseInt(fields.ProjectId.toString());
        const createdBy = fields.CreatedBy.toString();
        prisma.user.findUnique({
            where: {
                Email: createdBy
            }
        }).then(user => {
            prisma.codeReport.create({
                data: {
                    CodeProjectId: projectId,
                    CreatedDate: new Date(),
                    Date: new Date(),
                    CreatedBy: user?.Id,
                    Type: 7,
                    IsDelete: false,
                    Note: ""
                }
            }).then(report => {
                prisma.statusReport.create({
                    data: {
                        Status: progress.toString(),
                        CodeReportId: report.Id
                    }
                }).then(statusReport => {
                    if (fileLength > 0) {
                        let i = 0;
                        while (i < fileLength) {
                            const file = files["file[" + i + "]"];
                            const oldpath = file.path;
                            const fileNameArray = file.name.split(".");
                            const ext = fileNameArray[fileNameArray.length - 1];
                            const uid = uuid.v1();
                            sharp_1.default(oldpath).resize({
                                fit: sharp_1.default.fit.contain,
                                width: 640
                            }).toFile(path.join(__dirname, "../img/status/", (uid + "." + ext))).then(() => {
                                fs.rename(oldpath, path.join(__dirname, "../img/status/", (uid + "." + ext)), error => {
                                    if (error == null) {
                                        prisma.statusReportImage.create({
                                            data: {
                                                StatusReportId: statusReport.Id,
                                                ImageUrl: "status/" + uid + "." + ext,
                                                Name: file.name
                                            }
                                        }).catch(error => {
                                            return res.status(500).json({ message: error.message });
                                        });
                                    }
                                });
                            });
                            if (i == (fileLength - 1)) {
                                res.status(200).json({ message: "Status report created" });
                                const io = req.app.get('socketio');
                                io.emit('newProgressReport', {
                                    projectId: report.CodeProjectId,
                                    reportId: report.Id
                                });
                            }
                            i++;
                        }
                    }
                    else {
                        res.status(200).json({ message: "Status report created" });
                        const io = req.app.get('socketio');
                        io.emit('newProgressReport', {
                            projectId: report.CodeProjectId,
                            reportId: report.Id
                        });
                    }
                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        });
    });
});
exports.default = router;
//# sourceMappingURL=reportStatus.js.map