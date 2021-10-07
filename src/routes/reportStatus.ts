import { Router } from 'express';
import { PrismaClient, Prisma} from '@prisma/client'
import { MaterialReport, Material as materialInterface } from '../models/codeReport';
import * as formidable from 'formidable';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient()

const router = Router();

router.put("/", (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    
    form.parse(req, function(err, fields, files) {
        const fileLength            = parseInt(fields.Files.toString());
        const deleteFile            = fields.Delete.toString();
        const Id                    = parseInt(fields.Id.toString());
        const progress              = fields.Progress.toString();
        const ProjectId             = parseInt(fields.ProjectId.toString());

        prisma.codeReport.update({
            where:{
                Id: Id
            },
            data:{
                StatusReport:{
                    update:{
                        Status: progress
                    }
                }
            },
            select:{
                StatusReport:{
                    select:{
                        Id: true
                    }
                }
            }
        }).then(statusReport => {
            const deleteId: any[] = [];
            const deleteFileArray = JSON.parse(deleteFile);
            deleteFileArray.forEach((deleteFileItem: number) => {
                deleteId.push(deleteFileItem);
            })

            if(deleteId.length > 0){
                prisma.$transaction([
                    prisma.statusReportImage.findMany({
                        where:{
                            Id:{
                                in:deleteId
                            }
                        }
                    }),
                    prisma.statusReportImage.deleteMany({
                        where:{
                            Id:{
                                in:deleteId
                            }
                        }
                    })
                ]).then(response=> {
                    (response[0] as any[]).forEach(respond => {
                        fs.unlinkSync(path.join(__dirname, "../img/", respond.ImageUrl));
                    })
                })
                
            }

            if(fileLength > 0){
                let i = 0;
                while(i < fileLength){
                    const file = files["File[" + i + "]"] as formidable.File;
                    console.log(file);
                    const oldpath = file.path;
                    const fileNameArray = file!.name!.split(".");
                    const ext = fileNameArray[fileNameArray.length - 1];
                    const uid = uuid.v1();

                    sharp(oldpath).resize({
                        fit: sharp.fit.contain,
                        width:640
                    }).toFile(path.join(__dirname, "../img/status/", (uid + "." + ext))).then(() => {
                        fs.rename(oldpath, path.join(__dirname, "../img/status/", (uid + "." + ext)), error => {
                            if(error == null){
                                prisma.statusReportImage.create({
                                    data:{
                                        StatusReportId: statusReport.StatusReport!.Id,
                                        ImageUrl:"status/" + uid + "." + ext,
                                        Name: file.name!
                                    }
                                }).then(() => {
                                    console.log("File uploaded");
                                }).catch(error => {
                                    console.log(error);
                                })
                            }
                        });
                    })
                    
                    if(i == (fileLength - 1)){
                        res.status(200).json({message: "Progress report updated"});
                        const io = req.app.get('socketio')
                        io.emit('editProgressReport', {
                            projectId: ProjectId,
                            reportId: Id
                        })
                    }

                    i++;
                }
            } else {
                res.status(200).json({message: "Progress report updated"});
                const io = req.app.get('socketio')
                io.emit('editProgressReport', {
                    projectId: ProjectId,
                    reportId: Id
                })
            }
        });
    });
})

router.post("/", async(req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    form.parse(req, function(err, fields, files) {
        const fileLength    = parseInt(fields.Files.toString());
        const progress      = fields.Progress;
        const projectId     = parseInt(fields.ProjectId.toString());
        const createdBy     = fields.CreatedBy.toString();

        prisma.user.findUnique({
            where:{
                Email: createdBy
            }
        }).then(user => {
            prisma.codeReport.create({
                data: {
                    CodeProjectId: projectId,
                    CreatedDate: new Date(),
                    Date: new Date(),
                    CreatedBy: user?.Id!,
                    Type: 7,
                    IsDelete: false,
                    Note:""
                }
            }).then(report => {
                prisma.statusReport.create({
                    data: {
                        Status: progress.toString(),
                        CodeReportId: report.Id
                    }
                }).then(statusReport => {
                    if(fileLength > 0){
                        let i = 0;
                        while(i < fileLength){
                            const file = files["file[" + i + "]"] as formidable.File;
                            const oldpath = file.path;
                            const fileNameArray = file!.name!.split(".");
                            const ext = fileNameArray[fileNameArray.length - 1];
                            const uid = uuid.v1();
                            sharp(oldpath).resize({
                                fit: sharp.fit.cover,
                                width:640,
                                height:undefined,
                            })
                            .toFile(path.join(__dirname, "../img/status/", (uid + "." + ext)))
                            .then(() => {
                                prisma.statusReportImage.create({
                                    data:{
                                        StatusReportId: statusReport.Id!,
                                        ImageUrl:"status/" + uid + "." + ext,
                                        Name: file.name!
                                    }
                                }).catch(error => {
                                    return res.status(500).json({message: error.message})
                                })
                            })
                            
                            
                            if(i == (fileLength - 1)){
                                res.status(200).json({message: "Status report created"});
                                const io = req.app.get('socketio');
                                setTimeout(function(){
                                    io.emit('newProgressReport', {
                                        projectId: report.CodeProjectId,
                                        reportId: report!.Id
                                    })
                                }, 500)
                                
                            }

                            i++;
                        }
                    } else {
                        res.status(200).json({message: "Status report created"});
                        const io = req.app.get('socketio')
                        io.emit('newProgressReport', {
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
});

export default router;