"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.get("/", async (req, res, next) => {
    const date = new Date(req.body.date);
    date.setHours(0, 0, 0);
    const dateplus = new Date(req.body.date);
    dateplus.setDate(dateplus.getDate());
    dateplus.setHours(0, 0, 0);
    prisma.codeReport.findMany({
        where: {
            Id: parseInt(req.body.Id),
            CreatedDate: {
                gte: new Date(date),
                lt: new Date(dateplus)
            }
        },
        include: {
            Material: true,
            Tool: true,
            Worker: true,
            Weather: true,
            StatusReport: {
                include: {
                    StatusReportImage: true
                }
            }
        }
    }).then(result => {
        res.send(200).json(result);
    }).catch(error => {
        throw error;
    });
});
//# sourceMappingURL=reportDaily.js.map