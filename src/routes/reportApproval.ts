import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import admin from '../helper/notification.helper';

const router = Router();
const prisma = new PrismaClient();

router.post('/', (req, res, next) => {
    const reportId = parseInt(req.body.reportId);
    const approval = parseInt(req.body.approval);
    const comment = req.body.comment;

    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.join(__dirname, "../private.key")), 
        { algorithms: ['RS256'] }
    );

    prisma.user.findUnique({
        where:{
            Email: decoded.Email
        }
    }).then(async(user) => {
        const count = await prisma.codeReportApproval.count({
            where:{
                NOT:{
                    Approval: 0
                },
                IsDelete: false,
                CodeReportId: reportId,
                CreatedBy: user!.Id
            }
        });

        if(count > 0 && approval != 0){
            throw Error("User has approved / disapproved this report.");
        } else {
            prisma.codeReportApproval.create({
                data:{
                    CodeReportId: reportId,
                    CreatedBy: user!.Id,
                    CreatedDate: new Date(),
                    Comment: comment,
                    Approval: approval,
                    IsDelete: false
                },
                include:{
                    User:{
                        select:{
                            FirstName: true,
                            LastName: true,
                            Email: true,
                            ImageUrl: true
                        }
                    }
                }
            }).then(async(approval) => {
                res.status(201).json(approval);
                const io = req.app.get('socketio')
                io.emit('newApproval', approval);

                const createdBy = await prisma.codeReport.findUnique({
                    where:{
                        Id: reportId
                    },
                    select:{
                        User:{
                            select:{
                                Id: true
                            }
                        }
                    }
                })

                if(approval.CreatedBy != createdBy!.User.Id){
                    prisma.userToken.findMany({
                        where:{
                            UserId: createdBy?.User.Id
                        }
                    }).then(users => {
                        const tokens: string[] = [];
                        users.forEach(x => {
                            tokens.push(x.Token);
                        })
    
                        const notification_options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };
    
                        const message_notification = {
                            notification: {
                                title: "New approval for your report",
                                body: `${user?.FirstName} ${user?.LastName} has approved your report.`,
                                icon: "https://apiz.aknsmartreport.com/img/assets/Kop.jpg"
                            },
                            data:{
                                type:"notification",
                                url:"https://app.aknsmartreport.com/Project/Feed/" + reportId
                            }
                        };
    
                        if(tokens.length > 0){
                            admin.messaging().sendToDevice(tokens, message_notification, notification_options).then(response => {
                                console.log(response);
                            }).catch(error => {
                                console.log(error.results);
                            })
                        }      
                    })
                }
            }).catch(error => {
                throw error;
            });
        }
    })
});

router.get('/:reportId', (req, res, next) => {
    const reportId = parseInt(req.params.reportId);
    const offset = parseInt(req.query.offset!.toString());
    const limit = parseInt(req.query.limit!.toString());

    prisma.codeReportApproval.findMany({
        select:{
            Approval: true,
            CreatedDate: true,
            Id: true,
            User: {
                select:{
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            }
        },
        where:{
            CodeReportId: reportId,
            Approval:{
                not:0
            },
            IsDelete: false
        },
        orderBy:{
            CreatedDate: 'asc',
        },
        skip: offset,
        take: limit
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    });
})

router.get('/commentsDisplay/:reportId', (req, res, next) => {
    const reportId = parseInt(req.params.reportId);

    prisma.codeReportApproval.findMany({
        select:{
            Comment: true,
            CreatedDate: true,
            Id: true,
            User: {
                select:{
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            }
        },
        where:{
            CodeReportId: reportId,
            Approval:0,
            IsDelete: false
        },
        orderBy:{
            CreatedDate: 'desc',
        },
        take: 2
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    })
})

router.get('/comments/:reportId', (req, res, next) => {
    const reportId = parseInt(req.params.reportId);
    const offset = parseInt(req.query.offset!.toString());
    const limit = parseInt(req.query.limit!.toString());

    prisma.codeReportApproval.findMany({
        select:{
            Comment: true,
            CreatedDate: true,
            Id: true,
            User: {
                select:{
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            }
        },
        where:{
            CodeReportId: reportId,
            Approval:0,
            IsDelete: false
        },
        orderBy:{
            CreatedDate: 'asc',
        },
        skip: offset,
        take: limit
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    })
})

router.delete("/:approvalId", (req, res, next) => {
    const approvalId = parseInt(req.params.approvalId); 
    prisma.codeReportApproval.update({
        where:{
            Id: approvalId
        },
        data:{
            IsDelete: true
        }
    }).then(approval => {
        res.status(201).json({message: "Approval deleted"});
        const io = req.app.get('socketio')
        io.emit('deleteApproval', approval);
    }).catch(error => {
        throw error;
    })
})

export default router;