import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import { ToolReport, Tool } from '../models/codeReport';
const prisma = new PrismaClient();
import admin from '../helper/notification.helper';

const router = Router();

router.put("/", async(req, res, next) => {
    const toolReport: ToolReport = req.body as ToolReport;
    prisma.tool.deleteMany({
        where:{
            CodeReportId: toolReport.Id
        }
    }).then(() => {
        const tools = toolReport.Tools;
        const toolData: Tool[] = [];
        
        tools.forEach(tool => {
            toolData.push({
                Name: tool.Name,
                Description: tool.Description,
                Quantity: tool.Quantity,
                CodeReportId: toolReport.Id!
            })
        })

        prisma.tool.createMany({
            data:toolData
        }).then(() => {
            res.json({ message: "Tool report created" })
            const io = req.app.get('socketio')
            io.emit('editToolReport', {
                projectId: toolReport.CodeProjectId,
                reportId: toolReport!.Id
            })
        }).catch(error => {
            throw error;
        })
    })
});

router.post("/", async(req, res, next) => {
    const toolReport: ToolReport = req.body as ToolReport;
    prisma.user.findUnique({
        where:{
            Email: toolReport.CreatedBy.toString()
        }
    }).then(user => {
        prisma.codeReport.create({
            data: {
                CreatedBy: user!.Id,
                IsDelete: false,
                CreatedDate: new Date(),
                Date: new Date(),
                CodeProjectId: toolReport.CodeProjectId,
                Note: "",
                Type: 2
            }
        }).then(() => {
            prisma.codeReport.findFirst({
                where:{
                    CreatedBy: user!.Id,
                    Type: 2
                },
                orderBy:{
                    Id:'desc'
                }
            }).then(codeReport => {
                const codeReportId = codeReport?.Id as number;
                const tools = toolReport.Tools;
                const toolData: Tool[] = [];
                
                tools.forEach(tool => {
                    toolData.push({
                        Name: tool.Name,
                        Description: tool.Description,
                        Quantity: tool.Quantity,
                        CodeReportId: codeReportId
                    })
                })

                prisma.tool.createMany({
                    data:toolData
                }).then(() => {
                    res.json({ message: "Tool report created" })
                    const io = req.app.get('socketio')
                    io.emit('newToolReport', {
                        projectId: toolReport.CodeProjectId,
                        reportId: codeReport!.Id
                    })

                    prisma.codeProject.findUnique({
                        where:{
                            Id: toolReport.CodeProjectId
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
                                title: "New tool report",
                                body: `${user?.FirstName} ${user?.LastName} just created a tool report.`,
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