import { Router } from 'express';
import { PrismaClient, Prisma, CodeReport, Material } from '@prisma/client'
import { MaterialReport, Material as materialInterface } from '../models/codeReport';
import * as formidable from 'formidable';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';

const prisma = new PrismaClient()

const router = Router();

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
                            const newpath = path.join(__dirname, "../img/status/", (uid + "." + ext));
        
                            fs.rename(oldpath, newpath, error => {
                                if(error == null){
                                    prisma.statusReportImage.create({
                                        data:{
                                            StatusReportId: statusReport.Id!,
                                            ImageUrl:"status/" + uid + "." + ext,
                                            Name: file.name!
                                        }
                                    }).catch(error => {
                                        return res.status(500).json({message: error.message})
                                    })
                                }
                            });
                            
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