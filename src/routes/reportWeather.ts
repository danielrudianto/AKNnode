import { Router } from 'express';
import { PrismaClient, Prisma, CodeReport, Weather } from '@prisma/client'

const prisma = new PrismaClient()

const router = Router();

router.post("/", async(req, res, next) => {
    const WeatherId = parseInt(req.body.WeatherId);
    const CodeProjectId = req.body.CodeProjectId as number;
    const CreatedBy = req.body.CreatedBy.toString();

    prisma.user.findUnique({
        where:{
            Email: CreatedBy
        }
    }).then(User => {
        prisma.codeReport.create({
            data: {
                CreatedBy: User!.Id!,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: CodeProjectId,
                Note: "",
                Type: 4
            }
        }).then(weatherReport => {
            prisma.codeReport.findFirst({
                where:{
                    CreatedBy: User!.Id,
                    Type: 4
                },
                orderBy:{
                    Id:'desc'
                }
            }).then(codeReport => {
                prisma.weather.create({
                    data:{
                        WeatherId: WeatherId,
                        CodeReportId: codeReport!.Id!
                    }
                }).then(() => {
                    res.json({ message: "Weather report created" })
                    const io = req.app.get('socketio')
                    io.emit('newWeatherReport', {
                        projectId: weatherReport.CodeProjectId,
                        reportId: codeReport!.Id
                    })
                }).catch(error => {
                    throw error;
                })
            }).catch(error => {
                throw error;
            })
        }).catch((error) => {
            throw error;
        });
    })
})

export default router;