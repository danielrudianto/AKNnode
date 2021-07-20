import { Router } from 'express';
import { PrismaClient, Prisma, CodeReport, Weather, CodeProject, Project } from '@prisma/client'
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import { CodeProjectForm } from '../models/codeProject';

const prisma = new PrismaClient()

const router = Router();

router.get("/", async(req, res, next) => {
    const email = req.query.email;
    prisma.codeProject.findMany({
        include:{
            Client:{
                select:{
                    Name: true,
                    Id: true,
                    Address: true,
                    City: true,
                    TaxIdentificationNumber: true
                }
            }
        },
        where:{
            CodeProjectUser:{
                some:{
                    User:{
                        Email: email?.toString()
                    }
                }
            },
            IsDelete: false,
            IsCompleted: false,
            ConfirmedBy:{
                not:null
            }
        }
    }).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        throw error;
    })
});

router.get("/active", (req, res, next) => {
    const limit = parseInt(req.query.limit!.toString()) as number;
    const offset = parseInt(req.query.offset!.toString()) as number;

    prisma.$transaction([
        prisma.codeProject.count({
            where:{
                IsDelete: false
            }
        }),
        prisma.codeProject.findMany({
            where:{
                IsDelete: false,
                IsCompleted: false,
            },
            orderBy: {
                Name: 'asc'
            },
            include:{
                Client: {
                    select:{
                        Name: true
                    }
                },
                CodeProjectDocument: true,
                CodeProjectUser:true
            },
            skip:offset,
            take: limit
        })
    ]).then((response: any[]) => {
        res.status(200).json({
            data: response[1],
            count: response[0]
        })
    }).catch(error => {
        throw error;
    })
})

router.get("/:projectId", (req, res, next) => {
    prisma.codeProject.findUnique({
        where:{
            Id: parseInt(req.params.projectId)
        },
        include:{
            CodeProjectUser: {
                include:{
                    User: {
                        include:{
                            UserPosition:{
                                select:{
                                    Position: true,
                                    EffectiveDate: true
                                },
                                orderBy: {
                                    EffectiveDate: 'desc'
                                },
                                take:1
                            }
                        }
                    }
                }
            },
            Client: true,
            CodeProjectDocument: true,
            Project: true
        }
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    })
})

router.post("/", (req,res, next) => {
    const body: CodeProjectForm = req.body as CodeProjectForm;
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.join(__dirname, "../private.key")), 
        { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where:{
            Email: decoded.Email
        }
    }).then(user => {
        prisma.codeProject.create({
            data:{
                ClientId: body.ClientId,
                CreatedBy: user!.Id,
                CreatedDate: new Date(),
                Name: body.Name,
                Address: body.Address,
                DocumentName: body.DocumentName,
                CodeProjectUser:{
                    create:body.Users
                }
            }
        }).then(project => {
            const tasks = body.Tasks;
            tasks.forEach(task => {
                prisma.project.create({
                    data:{
                        Name: task.Name,
                        Description: task.Description,
                        BudgetPrice: 0,
                        Quantity: 0,
                        Done: 0,
                        IsDelete: false,
                        CodeProjectId: project.Id,
                        ParentId: 0,
                        EstimatedDuration: 0,
                        Timeline: 0,
                        Price: 0,
                        Unit: ""
                    }
                }).then(x => {
                    const childTasks: any[] = [];
                    task.Tasks!.forEach(y => {
                        childTasks.push({
                            Name: y.Name,
                            Description: y.Description,
                            Quantity: y.Quantity,
                            Unit: y.Unit,
                            Done: 0,
                            BudgetPrice: y.BudgetPrice,
                            Price: y.Price,
                            ParentId: x.Id!,
                            EstimatedDuration: y.EstimatedDuration,
                            Timeline: y.Timeline,
                            IsDelete: false,
                            CodeProjectId: project.Id
                        })
                    })

                    prisma.project.createMany({
                        data: childTasks
                    })
                })
            })

            res.status(201).json({message: "Project created", Id: project.Id});
            const io = req.app.get('socketio')
            io.emit('newProject', {
                projectId: project!.Id,
            })
        }).catch(error => {
            throw error;
        })
    })
})

router.post('/confirm', (req, res, next) => {
    const id = parseInt(req.body.id);
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.join(__dirname, "../private.key")), 
        { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where:{
            Email: decoded.Email
        }
    }).then(user => {
        prisma.codeProject.findFirst({
            where: {
                AND:{
                    Id: id,
                    ConfirmedBy: null,
                    IsDelete: false,
                    IsCompleted: false
                }
            }
        }).then(project => {
            if(project != null){
                prisma.codeProject.update({
                    where:{
                        Id: project.Id
                    },
                    data:{
                        ConfirmedBy: user!.Id,
                        ConfirmedDate: new Date()
                    }
                }).then(() => {
                    res.status(201).json({message: "Project confirmed"});
                    const io = req.app.get('socketio')
                    io.emit('newProject', {
                        projectId: project!.Id,
                    })
                }).catch(error => {
                    throw error;
                })
            } else {
                throw Error("Project not found");
            }
        }).catch(error => {
            throw error;
        })
    });
})

router.delete('/:projectId', (req, res, next) => {
    const projectId = parseInt(req.params.projectId);
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.join(__dirname, "../private.key")), 
        { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where:{
            Email: decoded.Email
        }
    }).then(user => {
        prisma.codeProject.findUnique({
            where:{
                Id: projectId
            }
        }).then(project => {
            if(project!.IsDelete == false && project!.IsCompleted == false){
                prisma.codeProject.update({
                    where: {
                        Id: parseInt(projectId.toString())
                    },
                    data:{
                        IsDelete: true,
                        ConfirmedBy: user!.Id
                    }
                }).then(() => {
                    res.status(201).json({message: "Project deleted"});
                    const io = req.app.get('socketio')
                    io.emit('deleteProject', {
                        projectId: projectId
                    })
                }).catch(error => {
                    throw error;
                })
            } else {
                throw Error("Failed to delete project");
            }
        })
    });
    
})

router.put('/edit/general', (req, res, next) => {
    const ProjectId = parseInt(req.body.ProjectId);
    const Client = parseInt(req.body.Client);
    const Document = req.body.Document;
    const Name = req.body.Name;
    const Address = req.body.Address;

    prisma.codeProject.update({
        where: {
            Id: ProjectId
        },
        data:{
            ClientId: Client,
            DocumentName: Document,
            Name: Name,
            Address: Address
        }
    }).then(() => {
        res.status(201).json({message: "Project updated"})
    }, error => {
        throw error;
    })
})

router.put('/edit/user', (req, res, next) => {
    const users = req.body.users;
    const projectId = req.body.projectId
    if(users.length > 0){
        prisma.codeProjectUser.deleteMany({
            where: {
                CodeProjectId: projectId
            }
        }).then(() => {
            const projectUser: any = [];
            users.forEach((user: any) => {
                projectUser.push({
                    CodeProjectId: projectId,
                    UserId: user.Id
                })
            })
            prisma.codeProjectUser.createMany({
                data: projectUser
            }).then(() => {
                prisma.codeProjectUser.findMany({
                    where:{
                        CodeProjectId: projectId
                    },
                    include:{
                        User:{
                            include:{
                                UserPosition:{
                                    select:{
                                        Position: true,
                                        EffectiveDate: true
                                    }
                                }
                            }
                        }
                    }
                }).then(projectUsers => {
                    res.status(201).json(projectUsers);
                })
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    } else {
        throw Error("Minimum user is one");
    }
})

export default router;