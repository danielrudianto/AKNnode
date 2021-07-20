"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.post("/", async (req, res, next) => {
    const toolReport = req.body;
    prisma.user.findUnique({
        where: {
            Email: toolReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: toolReport.CodeProjectId,
                Note: "",
                Type: 2
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where: {
                    CreatedBy: user.Id,
                    Type: 2
                },
                orderBy: {
                    Id: 'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id;
                const tools = toolReport.Tools;
                const toolData = [];
                tools.forEach(tool => {
                    toolData.push({
                        Name: tool.Name,
                        Description: tool.Description,
                        Quantity: tool.Quantity,
                        CodeReportId: codeReportId
                    });
                });
                prisma.tool.createMany({
                    data: toolData
                }).then(() => {
                    res.json({ message: "Tool report created" });
                    const io = req.app.get('socketio');
                    io.emit('newToolReport', {
                        projectId: toolReport.CodeProjectId,
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
exports.default = router;
//# sourceMappingURL=reportTool.js.map