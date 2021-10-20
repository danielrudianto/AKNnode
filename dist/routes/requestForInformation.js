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
const notification_helper_1 = __importDefault(require("../helper/notification.helper"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.put("/", (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    form.parse(req, function (err, fields, files) {
        const fileLength = parseInt(fields.Files.toString());
        const deleteFile = fields.Delete.toString();
        const Header = fields.Header.toString();
        const AddressedFor = fields.AddressedFor.toString();
        const Description = fields.Description.toString();
        const Id = parseInt(fields.Id.toString());
        const ProjectId = parseInt(fields.ProjectId.toString());
        prisma.codeReport.update({
            where: {
                Id: Id
            },
            data: {
                RequestForInformation: {
                    update: {
                        Header: Header,
                        AddressedFor: AddressedFor,
                        Description: Description
                    }
                }
            },
            select: {
                RequestForInformation: {
                    select: {
                        Id: true
                    }
                }
            }
        }).then(rfi => {
            const deleteId = [];
            const deleteFileArray = JSON.parse(deleteFile);
            deleteFileArray.forEach((deleteFileItem) => {
                deleteId.push(deleteFileItem);
            });
            if (deleteId.length > 0) {
                prisma.$transaction([
                    prisma.requestForInformationDocument.findMany({
                        where: {
                            Id: {
                                in: deleteId
                            }
                        }
                    }),
                    prisma.requestForInformationDocument.deleteMany({
                        where: {
                            Id: {
                                in: deleteId
                            }
                        }
                    })
                ]).then(response => {
                    response[0].forEach(respond => {
                        fs.unlinkSync(path.join(__dirname, "../img/", respond.ImageUrl));
                    });
                });
            }
            if (fileLength > 0) {
                let i = 0;
                while (i < fileLength) {
                    const file = files["File[" + i + "]"];
                    const oldpath = file.path;
                    const fileNameArray = file.name.split(".");
                    const ext = fileNameArray[fileNameArray.length - 1];
                    const uid = uuid.v1();
                    sharp_1.default(oldpath).resize({
                        fit: sharp_1.default.fit.contain,
                        width: 640
                    }).toFile(path.join(__dirname, "../img/rfi/", (uid + "." + ext))).then(() => {
                        prisma.requestForInformationDocument.create({
                            data: {
                                RequestForInformationId: rfi.RequestForInformation.Id,
                                ImageUrl: "rfi/" + uid + "." + ext,
                                Name: file.name
                            }
                        }).then(() => {
                            console.log("File uploaded");
                        }).catch(error => {
                            console.log(error);
                        });
                    });
                    if (i == (fileLength - 1)) {
                        res.status(200).json({ message: "RFI updated" });
                        const io = req.app.get('socketio');
                        io.emit('editRFI', {
                            projectId: ProjectId,
                            reportId: Id
                        });
                    }
                    i++;
                }
            }
            else {
                res.status(200).json({ message: "RFI updated" });
                const io = req.app.get('socketio');
                io.emit('editRFI', {
                    projectId: ProjectId,
                    reportId: Id
                });
            }
        });
    });
});
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
                            const file = files["File[" + i + "]"];
                            const oldpath = file.path;
                            const fileNameArray = file.name.split(".");
                            const ext = fileNameArray[fileNameArray.length - 1];
                            const uid = uuid.v1();
                            sharp_1.default(oldpath).resize({
                                fit: sharp_1.default.fit.cover,
                                width: 640,
                                height: undefined,
                            })
                                .toFile(path.join(__dirname, "../img/rfi/", (uid + "." + ext)))
                                .then(() => {
                                prisma.requestForInformationDocument.create({
                                    data: {
                                        RequestForInformationId: rfi.Id,
                                        ImageUrl: "rfi/" + uid + "." + ext,
                                        Name: file.name
                                    }
                                }).catch(error => {
                                    return res.status(500).json({ message: error.message });
                                });
                            });
                            if (i == (fileLength - 1)) {
                                res.status(200).json({ message: "RFI created" });
                                const io = req.app.get('socketio');
                                io.emit('newRFI', {
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
                    prisma.codeProject.findUnique({
                        where: {
                            Id: report.CodeProjectId
                        },
                        select: {
                            CodeProjectUser: {
                                select: {
                                    User: {
                                        select: {
                                            Id: true,
                                            Token: true,
                                        }
                                    }
                                }
                            }
                        }
                    }).then(response => {
                        const tokens = [];
                        response?.CodeProjectUser.forEach(x => {
                            x.User.Token.forEach(userToken => {
                                if (userToken.UserId != user.Id) {
                                    tokens.push(userToken.Token);
                                }
                            });
                        });
                        const notification_options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };
                        const message_notification = {
                            notification: {
                                title: `New request for information addressed to ${rfi.AddressedFor}`,
                                body: `${user?.FirstName} ${user?.LastName} just created a request for information about ${rfi.Header}.`,
                                icon: "https://apiz.aknsmartreport.com/img/assets/Kop.jpg",
                            },
                            data: {
                                type: "notification",
                                url: rfi.CodeReportId.toString()
                            }
                        };
                        notification_helper_1.default.messaging().sendToDevice(tokens, message_notification, notification_options).then(response => {
                            console.log(response);
                        }).catch(error => {
                            console.log(error);
                        });
                    });
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
            },
            select: {
                CodeReport: {
                    select: {
                        User: {
                            select: {
                                Id: true
                            }
                        },
                        CodeProjectId: true
                    }
                },
                CodeReportId: true,
                Id: true,
            }
        }),
        prisma.user.findFirst({
            where: {
                Email: createdBy,
                IsActive: true
            },
            select: {
                Token: {
                    select: {
                        Token: true
                    },
                    orderBy: {
                        Id: "asc"
                    },
                    take: 1
                },
                Id: true,
                FirstName: true,
                LastName: true
            }
        })
    ]).then(response => {
        if (response[0] != null && response[1] != null) {
            prisma.requestForInformationAnswer.create({
                data: {
                    RequestForInformationId: response[0].Id,
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
                            ImageUrl: true,
                            Id: true
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
                const notification_options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };
                if (response[1].Id != rfi.User.Id) {
                    const message_notification = {
                        notification: {
                            title: "New answer for your request for information",
                            body: `${response[1]?.FirstName} ${response[1]?.LastName} has approved your report.`,
                            icon: "https://apiz.aknsmartreport.com/img/assets/Kop.jpg"
                        },
                        data: {
                            type: "notification",
                            url: "https://m.aknsmartreport.com/Project/Feed/" + reportId
                        }
                    };
                    notification_helper_1.default.messaging().sendToDevice(response[1].Token[0].Token, message_notification, notification_options).then(response => {
                        console.log(response);
                    }).catch(error => {
                        console.log(error.results);
                    });
                }
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
        const io = req.app.get('socketio');
        io.emit('deleteAnswer', response);
    }).catch(error => {
        throw error;
    });
});
exports.default = router;
//# sourceMappingURL=requestForInformation.js.map