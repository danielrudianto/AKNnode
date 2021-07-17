import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs';
import * as path from 'path';
import * as formidable from 'formidable';
import * as uuid from 'uuid';

const prisma = new PrismaClient()

const router = Router();

router.post("/", (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    form.parse(req, function(err, fields, files) {
        const fileLength    = parseInt(fields.fileLength.toString());
        const projectId     = parseInt(fields.projectId.toString());
        const createdBy     = fields.createdBy.toString();

        prisma.user.findUnique({
            where:{
                Email: createdBy
            }
        }).then(user => {
            let i = 0;
            while(i < fileLength){
                const file = files["file[" + i + "]"] as formidable.File;
                const oldpath = file.path;
                const fileNameArray = file!.name!.split(".");
                const ext = fileNameArray[fileNameArray.length - 1];
                const uid = uuid.v1();
                const newpath = path.join(__dirname, "../img/project/", (uid + "." + ext));

                fs.rename(oldpath, newpath, error => {
                    if(error == null){
                        prisma.codeProjectDocument.create({
                            data: {
                                CodeProjectId: projectId,
                                Url:"project/" + uid + "." + ext,
                                Name: file.name!,
                                CreatedBy: user!.Id,
                                CreatedDate: new Date()
                            }
                        }).catch(error => {
                            throw error;
                        })
                    }
                });
                
                if(i == (fileLength - 1)){
                    res.status(201).json({message: "Upload successful"});
                }

                i++;
            }
        }).catch(error => {
            throw error;
        })
    });
})

router.delete("/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    prisma.codeProjectDocument.findUnique({
        where:{
            Id: id
        }
    }).then(document => {
        fs.unlink(path.join(__dirname + '/../img/' + document?.Url), error => {
            if(error){
                throw error;
            }

            prisma.codeProjectDocument.delete({
                where:{
                    Id: id
                }
            }).then(() => {
                res.status(201).json({message: "Document deleted"});
            }).catch(error => {
                throw error;
            })
        })
    }).catch(error => {
        throw error;
    })
})

router.get("/:projectId", (req, res, next) => {
    prisma.codeProjectDocument.findMany({
        where:{
            CodeProjectId: parseInt(req.params.projectId)
        },
        orderBy:{
            CreatedDate: 'asc'
        }
    }).then(data => {
        res.status(201).json(data);
    }).catch(error => {
        throw error;
    })
})

router.post("/Rename", (req, res, next) => {
    prisma.codeProjectDocument.findUnique({
        where:{
            Id: parseInt(req.body.Id)
        }
    }).then(document => {
        const name = document?.Name;
        const nameArray = name?.split(".");
        const ext = nameArray![nameArray!.length - 1];

        prisma.codeProjectDocument.update({
            where:{
                Id: parseInt(req.body.Id.toString())
            },
            data:{
                Name: req.body.Name + "." + ext
            }
        }).then(doc => {
            const io = req.app.get('socketio')
            io.emit('updateDocumentName', doc);
        }).catch(error => {
            throw error;
        });
    }).catch(error => {
        throw error;
    })
})

export default router;