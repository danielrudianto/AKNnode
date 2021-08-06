import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import * as formidable from 'formidable';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
import ProjectManagerAuth from '../middleware/project-manager-auth';
import sharp from 'sharp';

const prisma = new PrismaClient()

const router = Router();

router.post("/", (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });

    form.parse(req, function(err, fields, files) {
        const fileLength    = parseInt(fields.Files.toString());
        const Header        = fields.Header.toString();
        const AddressedFor  = fields.AddressedFor.toString();
        const Description   = fields.Description.toString();
        const ProjectId     = parseInt(fields.ProjectId.toString());
        const CreatedBy     = fields.CreatedBy.toString();

        prisma.user.findUnique({
            where:{
                Email: CreatedBy
            }
        }).then(user => {
            prisma.codeReport.create({
                data: {
                    CodeProjectId: ProjectId,
                    CreatedDate: new Date(),
                    Date: new Date(),
                    CreatedBy: user?.Id!,
                    Type: 5,
                    IsDelete: false,
                    Note:""
                }
            }).then(report => {
                prisma.requestForInformation.create({
                    data: {
                        AddressedFor: AddressedFor,
                        Description: Description,
                        Header: Header,
                        CodeReportId: report!.Id
                    }
                }).then(rfi => {
                    if(fileLength > 0){
                        let i = 0;
                        while(i < fileLength){
                            const file = files["file[" + i + "]"] as formidable.File;
                            const oldpath = file.path;
                            const fileNameArray = file!.name!.split(".");
                            const ext = fileNameArray[fileNameArray.length - 1];
                            const uid = uuid.v1();
                            sharp(oldpath).resize({
                                fit: sharp.fit.contain,
                                width:640
                            }).toFile(path.join(__dirname, "../img/rfi/", (uid + "." + ext))).then(() => {
                                fs.rename(oldpath, path.join(__dirname, "../img/rfi/", (uid + "." + ext)), error => {
                                    if(error == null){
                                        prisma.requestForInformationDocument.create({
                                            data:{
                                                RequestForInformationId: rfi.Id!,
                                                ImageUrl:"rfi/" + uid + "." + ext,
                                                Name: file.name!
                                            }
                                        }).catch(error => {
                                            return res.status(500).json({message: error.message})
                                        })
                                    }
                                });
                            })
                            
                            
                            if(i == (fileLength - 1)){
                                res.status(200).json({message: "Status report created"});
                                const io = req.app.get('socketio')
                                io.emit('newProgressReport', {
                                    projectId: report.CodeProjectId,
                                    reportId: report!.Id
                                })
                            }

                            i++;
                        }
                    } else {
                        res.status(200).json({message: "RFI created"});
                                const io = req.app.get('socketio')
                                io.emit('newRFI', {
                                    projectId: report.CodeProjectId,
                                    reportId: report!.Id
                                })
                    }
                }).catch(error => {
                    throw error;
                })
            }).catch(error => {
                throw error;
            });
        })
    });
})

router.post('/answer', (req, res, next) => {
    const reportId = parseInt(req.body.reportId);
    const answer = req.body.answer;
    const createdBy = req.body.createdBy;

    prisma.$transaction([
        prisma.requestForInformation.findFirst({
            where:{
                CodeReportId: reportId
            }
        }),
        prisma.user.findFirst({
            where:{
                Email: createdBy,
                IsActive: true
            }
        })
    ]).then(response => {
        if(response[0] != null && response[1] != null){
            prisma.requestForInformation.findFirst({
                where:{
                    CodeReportId: reportId
                }
            }).then(rfi => {
                prisma.requestForInformationAnswer.create({
                    data:{
                        RequestForInformationId: rfi!.Id,
                        Answer: answer,
                        CreatedBy: response[1]!.Id,
                        CreatedDate: new Date()
                    },
                    select:{
                        User:{
                            select:{
                                FirstName: true,
                                LastName: true,
                                Email: true,
                                ImageUrl: true
                            }
                        },
                        RequestForInformation:{
                            select:{
                                CodeReportId: true
                            }
                        },
                        Answer: true,
                        CreatedDate: true,
                        Id: true
                    }
                }).then(rfi => {
                    res.status(201).json({message: "Answer created"});
                    const io = req.app.get('socketio')
                    io.emit('newAnswer', rfi);
                }).catch(error => {
                    throw error;
                })
            }, error => {
                throw error;
            })
        } else {
            throw Error("Error fetching reports");
        }
    })
    
    
})

router.get("/answer/:rfiId", (req, res, next) => {
    const reportId = parseInt(req.params.rfiId);
    const offset = parseInt(req.query.offset!.toString());
    const limit = parseInt(req.query.limit!.toString());

    prisma.requestForInformationAnswer.findMany({
        select:{
            CreatedDate: true,
            Id: true,
            User: {
                select:{
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            },
            Answer: true
        },
        where:{
            RequestForInformation:{
                CodeReportId: reportId
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

router.get("/answerDisplay/:rfiId", (req, res, next) => {
    const reportId = parseInt(req.params.rfiId);

    prisma.requestForInformationAnswer.findMany({
        select:{
            CreatedDate: true,
            Id: true,
            User: {
                select:{
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            },
            Answer: true
        },
        where:{
            RequestForInformation:{
                CodeReportId: reportId
            },
            IsDelete: false
        },
        orderBy:{
            CreatedDate: 'desc',
        },
        skip: 0,
        take: 2
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    });
})

router.delete("/answer/:answerId", ProjectManagerAuth, (req, res, next) => {
    prisma.requestForInformationAnswer.update({
        where:{
            Id: parseInt(req.params.answerId)
        },
        data:{
            IsDelete: true
        },
        select:{
            CreatedDate: true,
            Id: true,
            User: {
                select:{
                    FirstName: true,
                    LastName: true,
                    Email: true,
                    ImageUrl: true
                }
            },
            Answer: true,
            RequestForInformation:{
                select:{
                    CodeReportId: true,
                    Id: true
                }
            }
        }
    }).then(response => {
        res.status(201).json({message: "Answer deleted"});
        console.log(response);
        const io = req.app.get('socketio')
        io.emit('deleteAnswer', response);
    }).catch(error => {
        throw error;
    })
});

export default router;