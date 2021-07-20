"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.post("/", async (req, res, next) => {
    const materialReport = req.body;
    prisma.user.findUnique({
        where: {
            Email: materialReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: materialReport.CodeProjectId,
                Note: "",
                Type: 3
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where: {
                    CreatedBy: user.Id,
                    Type: 3
                },
                orderBy: {
                    Id: 'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id;
                const materials = materialReport.Materials;
                const materialData = [];
                materials.forEach(material => {
                    materialData.push({
                        Name: material.Name,
                        Description: material.Description,
                        Quantity: material.Quantity,
                        CodeReportId: codeReportId,
                        Status: material.Status,
                        Unit: material.Unit,
                    });
                });
                prisma.material.createMany({
                    data: materialData
                }).then(() => {
                    res.json({ message: "Successfully inserting material report" });
                    const io = req.app.get('socketio');
                    io.emit('newMaterialReport', {
                        projectId: materialReport.CodeProjectId,
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
//# sourceMappingURL=reportMaterial.js.map