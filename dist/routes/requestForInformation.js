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
const project_manager_auth_1 = __importDefault(require("../middleware/project-manager-auth"));
const sharp_1 = __importDefault(require("sharp"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.post("/", (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    form.parse(req, function (err, fields, files) {
        const fileLength = parseInt(fields.Files.toString());
        const Header = fields.Header.toString();
        const AddressedFor = fields.AddressedFor.toString();
        const Description = fields.Description.toString();
        const ProjectId = parseInt(fields.ProjectId.toString());
        const CreatedBy = fields.CreatedBy.toString();
        prisma.user.findUnique({
            where: {
                Email: CreatedBy
            }
        }).then(user => {
            prisma.codeReport.create({
                data: {
                    CodeProjectId: ProjectId,
                    CreatedDate: new Date(),
                    Date: new Date(),
                    CreatedBy: user?.Id,
                    Type: 5,
                    IsDelete: false,
                    Note: ""
                }
            }).then(report => {
                prisma.requestForInformation.create({
                    data: {
                        AddressedFor: AddressedFor,
                        Description: Description,
                        Header: Header,
                        CodeReportId: report.Id
                    }
                }).then(rfi => {
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
                            }).toFile(path.join(__dirname, "../img/rfi/", (uid + "." + ext))).then(() => {
                                fs.rename(oldpath, path.join(__dirname, "../img/rfi/", (uid + "." + ext)), error => {
                                    if (error == null) {
                                        prisma.requestForInformationDocument.create({
                                            data: {
                                                RequestForInformationId: rfi.Id,
                                                ImageUrl: "rfi/" + uid + "." + ext,
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
                        res.status(200).json({ message: "RFI created" });
                        const io = req.app.get('socketio');
                        io.emit('newRFI', {
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
router.post('/answer', (req, res, next) => {
    const reportId = parseInt(req.body.reportId);
    const answer = req.body.answer;
    const createdBy = req.body.createdBy;
    prisma.$transaction([
        prisma.requestForInformation.findFirst({
            where: {
                CodeReportId: reportId
            }
        }),
        prisma.user.findFirst({
            where: {
                Email: createdBy,
                IsActive: true
            }
        })
    ]).then(response => {
        if (response[0] != null && response[1] != null) {
            prisma.requestForInformation.findFirst({
                where: {
                    CodeReportId: reportId
                }
            }).then(rfi => {
                prisma.requestForInformationAnswer.create({
                    data: {
                        RequestForInformationId: rfi.Id,
                        Answer: answer,
                        CreatedBy: response[1].Id,
                        CreatedDate: new Date()
                    },
                    select: {
                        User: {
                            select: {
                                FirstName: true,
                                LastName: true,
                                Email: true,
                                ImageUrl: true
                            }
                        },
                        RequestForInformation: {
                            select: {
                                CodeReportId: true
                            }
                        },
                        Answer: true,
                        CreatedDate: true,
                        Id: true
                    }
                }).then(rfi => {
                    res.status(201).json({ message: "Answer created" });
                    const io = req.app.get('socketio');
                    io.emit('newAnswer', rfi);
                }).catch(error => {
                    throw error;
                });
            }, error => {
                throw error;
            });
        }
        else {
            throw Error("Error fetching reports");
        }
    });
});
router.get("/answer/:rfiId", (req, res, next) => {
    const reportId = parseInt(req.params.rfiId);
    const offset = parseInt(req.query.offset.toString());
    const limit = parseInt(req.query.limit.toString());
    prisma.requestForInformationAnswer.findMany({
        select: {
            CreatedDate: true,
            Id: true,
            User: {
                select: {
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            },
            Answer: true
        },
        where: {
            RequestForInformation: {
                CodeReportId: reportId
            },
            IsDelete: false
        },
        orderBy: {
            CreatedDate: 'asc',
        },
        skip: offset,
        take: limit
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    });
});
router.get("/answerDisplay/:rfiId", (req, res, next) => {
    const reportId = parseInt(req.params.rfiId);
    prisma.requestForInformationAnswer.findMany({
        select: {
            CreatedDate: true,
            Id: true,
            User: {
                select: {
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            },
            Answer: true
        },
        where: {
            RequestForInformation: {
                CodeReportId: reportId
            },
            IsDelete: false
        },
        orderBy: {
            CreatedDate: 'desc',
        },
        skip: 0,
        take: 2
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    });
});
router.delete("/answer/:answerId", project_manager_auth_1.default, (req, res, next) => {
    prisma.requestForInformationAnswer.update({
        where: {
            Id: parseInt(req.params.answerId)
        },
        data: {
            IsDelete: true
        },
        select: {
            CreatedDate: true,
            Id: true,
            User: {
                select: {
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            },
            Answer: true,
            RequestForInformation: {
                select: {
                    CodeReportId: true,
                    Id: true
                }
            }
        }
    }).then(response => {
        res.status(201).json({ message: "Answer deleted" });
        console.log(response);
        const io = req.app.get('socketio');
        io.emit('deleteAnswer', response);
    }).catch(error => {
        throw error;
    });
});
exports.default = router;
//# sourceMappingURL=requestForInformation.js.map