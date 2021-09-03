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
const moment = __importStar(require("moment"));
const notification_helper_1 = __importDefault(require("../helper/notification.helper"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.put("/", async (req, res, next) => {
    const workerReport = req.body;
    prisma.worker.deleteMany({
        where: {
            CodeReportId: workerReport.Id
        }
    }).then(() => {
        const workers = workerReport.Workers;
        const workerData = [];
        workers.forEach(worker => {
            workerData.push({
                Name: worker.Name,
                Quantity: parseInt(worker.Quantity.toString()),
                CodeReportId: workerReport.Id
            });
        });
        prisma.worker.createMany({
            data: workerData
        }).then(() => {
            res.json({ message: "Worker report created" });
            const io = req.app.get('socketio');
            io.emit('editAttendanceReport', {
                projectId: workerReport.CodeProjectId,
                reportId: workerReport.Id
            });
        }).catch(error => {
            throw error;
        });
    });
});
router.post("/", async (req, res, next) => {
    const workerReport = req.body;
    prisma.user.findUnique({
        where: {
            Email: workerReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: workerReport.CodeProjectId,
                Note: "",
                Type: 1
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where: {
                    CreatedBy: user.Id,
                    Type: 1
                },
                orderBy: {
                    Id: 'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id;
                const workers = workerReport.Workers;
                const workerData = [];
                workers.forEach(worker => {
                    workerData.push({
                        Name: worker.Name,
                        Quantity: worker.Quantity,
                        CodeReportId: codeReportId
                    });
                });
                prisma.worker.createMany({
                    data: workerData
                }).then(() => {
                    res.json({ message: "Successfully inserting worker report" });
                    const io = req.app.get('socketio');
                    io.emit('newAttendanceReport', {
                        projectId: workerReport.CodeProjectId,
                        reportId: codeReport.Id
                    });
                    prisma.codeProject.findUnique({
                        where: {
                            Id: workerReport.CodeProjectId
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
                                title: "New worker report",
                                body: `${user?.FirstName} ${user?.LastName} just created a worker report.`,
                                icon: "https://apiz.aknsmartreport.com/img/assets/Kop.jpg",
                            },
                            data: {
                                type: "notification",
                                url: codeReport.Id.toString()
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
        }).catch((error) => {
            throw error;
        });
    });
});
router.post("/", async (req, res, next) => {
    const workerReport = req.body;
    prisma.user.findUnique({
        where: {
            Email: workerReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: workerReport.CodeProjectId,
                Note: "",
                Type: 1
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where: {
                    CreatedBy: user.Id,
                    Type: 1
                },
                orderBy: {
                    Id: 'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id;
                const workers = workerReport.Workers;
                const workerData = [];
                workers.forEach(worker => {
                    workerData.push({
                        Name: worker.Name,
                        Quantity: worker.Quantity,
                        CodeReportId: codeReportId
                    });
                });
                prisma.worker.createMany({
                    data: workerData
                }).then(() => {
                    res.json({ message: "Successfully inserting worker report" });
                    const io = req.app.get('socketio');
                    io.emit('newAttendanceReport', {
                        projectId: workerReport.CodeProjectId,
                        reportId: codeReport.Id
                    });
                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch((error) => {
            throw error;
        });
    });
});
router.get("/getToday/:projectId", async (req, res, next) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0);
    prisma.codeReport.findMany({
        where: {
            Date: {
                gte: moment.utc(todayDate).toISOString(),
                lt: moment.utc(todayDate).add(1, 'day').toISOString()
            },
            CodeProjectId: parseInt(req.params.projectId),
            Worker: {
                some: {}
            },
            IsDelete: false
        },
        select: {
            Date: true,
            Worker: {
                select: {
                    Name: true,
                    Quantity: true
                }
            }
        }
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    });
});
exports.default = router;
//# sourceMappingURL=reportWorker.js.map