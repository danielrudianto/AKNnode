import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import { MaterialReport, Material } from '../models/codeReport';
import admin from '../helper/notification.helper';
const prisma = new PrismaClient();

const router = Router();

router.put("/", async(req, res, next) => {
    const materialReport: MaterialReport = req.body as MaterialReport;
    const materials = materialReport.Materials;
        const materialData: Material[] = [];
        
        materials.forEach(material => {
            materialData.push({
                Name: material.Name,
                Quantity: material.Quantity,
                Description: material.Description,
                Unit: material.Unit,
                Status: material.Status,
                CodeReportId: materialReport.Id!,
            })
        })

    prisma.$transaction([
        prisma.material.deleteMany({
            where:{
                CodeReportId: materialReport.Id
            }
        }),
        prisma.material.createMany({
            data:materialData
        }),
        prisma.codeReport.update({
            data:{
                Note: materialReport.Note
            },
            where:{
                Id: materialReport.Id
            }
        })
    ])
    .then(() => {
        res.json({ message: "Material report edited" })
        const io = req.app.get('socketio')
        io.emit('editMaterialReport', {
            projectId: materialReport.CodeProjectId,
            reportId: materialReport!.Id
        })
    }).catch(error => {
        throw error;
    })
});

router.post("/", async(req, res, next) => {
    const materialReport: MaterialReport = req.body as MaterialReport;
    prisma.user.findUnique({
        where:{
            Email: materialReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user!.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: materialReport.CodeProjectId,
                Note: materialReport.Note,
                Type: 3
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where:{
                    CreatedBy: user!.Id,
                    Type: 3
                },
                orderBy:{
                    Id:'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id as number;
                const materials = materialReport.Materials;
                const materialData: Material[] = [];
                
                materials.forEach(material => {
                    materialData.push({
                        Name: material.Name,
                        Description: material.Description,
                        Quantity: material.Quantity,
                        CodeReportId: codeReportId,
                        Status: material.Status,
                        Unit: material.Unit,
                    })
                })

                prisma.material.createMany({
                    data:materialData
                }).then(() => {
                    res.json({ message: "Successfully inserting material report" })
                    const io = req.app.get('socketio')
                    io.emit('newMaterialReport', {
                        projectId: materialReport.CodeProjectId,
                        reportId: codeReport!.Id
                    })

                    prisma.codeProject.findUnique({
                        where:{
                            Id: materialReport.CodeProjectId
                        },
                        select:{
                            CodeProjectUser:{
                                select:{
                                    User:{
                                        select:{
                                            Id: true,
                                            Token: true,
                                        }
                                    }
                                }
                            }
                        }
                    }).then(response => {
                        const tokens:any[] = [];
                        response?.CodeProjectUser.forEach(x => {
                            x.User.Token.forEach(userToken => {
                                if(userToken.UserId != user!.Id){
                                    tokens.push(userToken.Token);
                                }
                            })
                        })

                        const notification_options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };

                        const message_notification = {
                            notification: {
                                title: "New material report",
                                body: `${user?.FirstName} ${user?.LastName} just created a material report.`,
                                icon: "https://apiz.aknsmartreport.com/img/assets/Kop.jpg",
                            },
                            data:{
                                type:"notification",
                                url:codeReport!.Id.toString()
                            }
                        };

                        admin.messaging().sendToDevice(tokens, message_notification, notification_options).then(response => {
                            console.log(response);
                        }).catch(error => {
                            console.log(error);
                        })
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