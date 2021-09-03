import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import admin from '../helper/notification.helper';

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

                    prisma.codeProject.findUnique({
                        where:{
                            Id: weatherReport.CodeProjectId
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
                                if(userToken.UserId != User!.Id){
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
                                title: "New weather report",
                                body: `${User?.FirstName} ${User?.LastName} just did a weather report.`,
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