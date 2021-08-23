import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import * as moment from 'moment';
import { WorkerReport, Worker } from '../models/codeReport';

const prisma = new PrismaClient()

const router = Router();

router.put("/", async(req, res, next) => {
    const workerReport: WorkerReport = req.body as WorkerReport;
    prisma.worker.deleteMany({
        where:{
            CodeReportId: workerReport.Id
        }
    }).then(() => {
        const workers = workerReport.Workers;
        const workerData: Worker[] = [];
        
        workers.forEach(worker => {
            workerData.push({
                Name: worker.Name,
                Quantity: parseInt(worker.Quantity.toString()),
                CodeReportId: workerReport.Id!
            })
        })

        prisma.worker.createMany({
            data:workerData
        }).then(() => {
            res.json({ message: "Worker report created" })
            const io = req.app.get('socketio')
            io.emit('editAttendanceReport', {
                projectId: workerReport.CodeProjectId,
                reportId: workerReport!.Id
            })
        }).catch(error => {
            throw error;
        })
    })
});

router.post("/", async(req, res, next) => {
    const workerReport: WorkerReport = req.body as WorkerReport;
    prisma.user.findUnique({
        where:{
            Email: workerReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user!.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: workerReport.CodeProjectId,
                Note: "",
                Type: 1
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where:{
                    CreatedBy: user!.Id,
                    Type: 1
                },
                orderBy:{
                    Id:'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id as number;
                const workers = workerReport.Workers;
                const workerData: Worker[] = [];
                
                workers.forEach(worker => {
                    workerData.push({
                        Name: worker.Name,
                        Quantity: worker.Quantity,
                        CodeReportId: codeReportId
                    })
                })

                prisma.worker.createMany({
                    data:workerData
                }).then(() => {
                    res.json({ message: "Successfully inserting worker report" })
                    const io = req.app.get('socketio')
                    io.emit('newAttendanceReport', {
                        projectId: workerReport.CodeProjectId,
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

router.post("/", async(req, res, next) => {
    const workerReport: WorkerReport = req.body as WorkerReport;
    prisma.user.findUnique({
        where:{
            Email: workerReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user!.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: workerReport.CodeProjectId,
                Note: "",
                Type: 1
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where:{
                    CreatedBy: user!.Id,
                    Type: 1
                },
                orderBy:{
                    Id:'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id as number;
                const workers = workerReport.Workers;
                const workerData: Worker[] = [];
                
                workers.forEach(worker => {
                    workerData.push({
                        Name: worker.Name,
                        Quantity: worker.Quantity,
                        CodeReportId: codeReportId
                    })
                })

                prisma.worker.createMany({
                    data:workerData
                }).then(() => {
                    res.json({ message: "Successfully inserting worker report" })
                    const io = req.app.get('socketio')
                    io.emit('newAttendanceReport', {
                        projectId: workerReport.CodeProjectId,
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

router.get("/getToday/:projectId", async(req, res, next) => {
    const todayDate = new Date();

    todayDate.setHours(0, 0, 0);
    prisma.codeReport.findMany({
        where:{
            Date: {
                gte: moment.utc(todayDate).toISOString(),
                lt: moment.utc(todayDate).add(1,'day').toISOString()
            },
            CodeProjectId: parseInt(req.params.projectId),
            Worker:{
                some: {}
            },
            IsDelete: false
        },
        select:{
            Date: true,
            Worker: {
                select: {
                    Name: true,
                    Quantity: true
                }
            }
        }
    }).then(response => {
        res.status(200).json(response)
    }).catch(error => {
        throw error;
    })
})

export default router;