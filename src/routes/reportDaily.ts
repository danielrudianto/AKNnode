import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit';
const prisma = new PrismaClient();
const router = Router();

router.get("/", async(req, res, next) => {
    const date = new Date(req.body.date);
    date.setHours(0, 0, 0);

    const dateplus = new Date(req.body.date);
    dateplus.setDate(dateplus.getDate());
    dateplus.setHours(0, 0, 0);

    prisma.codeReport.findMany({
        where:{
            Id: parseInt(req.body.Id),
            CreatedDate: {
                gte: new Date(date),
                lt: new Date(dateplus)
            }
        },
        include:{
            Material: true,
            Tool: true,
            Worker: true,
            Weather: true,
            StatusReport: {
                include:{
                    StatusReportImage: true
                }
            }
        }
    }).then(result => {
        const doc = new PDFDocument;
        doc.addPage()
        res.send(200).json(result)
    }).catch(error => {
        throw error;
    })
})