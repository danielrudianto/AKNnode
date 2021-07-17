import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import projectManagerAuth from '../middleware/project-manager-auth';

const router = Router();
const prisma = new PrismaClient();

router.get("/getById/:id", (req, res, next) => {
    prisma.codeReport.findUnique({
        where:{
            Id: parseInt(req.params.id)
        },
        include:{
            User:{
                select:{
                    FirstName: true,
                    LastName: true,
                    ImageUrl: true
                }
            },
            Worker:{
                select:{
                    Name: true,
                    Quantity: true
                }
            },
            Tool: {
                select: {
                    Name: true,
                    Description: true,
                    Quantity: true
                }
            },
            Material:{
                select: {
                    Name: true,
                    Description: true,
                    Quantity: true,
                    Unit: true
                }
            },
            StatusReport: {
                select: {
                    Status: true,
                    StatusReportImage: true
                }
            },
            Weather:{
                select:{
                    WeatherId: true,
                }
            },
            RequestForInformation: {
                include: {
                    RequestForInformationDocument: true,
                    RequestForInformationAnswer:{
                        where:{
                            IsDelete: false
                        },
                        select:{
                            User:{
                                select: {
                                    FirstName: true,
                                    LastName: true,
                                    Email: true,
                                    ImageUrl: true
                                }
                            },
                            Answer: true,
                            CreatedDate: true,
                        },
                        orderBy:{
                            CreatedDate: 'desc'
                        },
                        take: 2,
                        skip: 0
                    }
                }
            },
            CodeReportApproval:{
                select:{
                    User:{
                        select:{
                            Email: true
                        }
                    },
                    Approval: true,
                    CreatedDate: true,
                    Id: true
                },
                orderBy:{
                    CreatedDate: 'asc'
                },
                where:{
                    NOT:{
                        Approval: 0
                    },
                    IsDelete: false
                }
                
            },
            CodeReportApprovalComment:{
                select:{
                    User:{
                        select:{
                            FirstName: true,
                            LastName: true,
                            Email: true,
                            ImageUrl: true
                        }
                    },
                    Approval: true,
                    CreatedDate: true,
                    Comment: true,
                    Id: true
                },
                orderBy: {
                    CreatedDate:'desc'
                },
                skip: 0,
                take: 2,
                where:{
                    Approval:0,
                    IsDelete: false
                }
            }
        }
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    })
})

router.delete("/:reportId", projectManagerAuth, (req, res, next) => {
    prisma.codeReport.update({
        where:{
            Id: parseInt(req.params.reportId)
        },
        data:{
            IsDelete: true
        }
    }).then(data => {
        res.status(201).json({message: "Report deleted"});
        const io = req.app.get('socketio')
        io.emit('deleteFeed', {
            projectId: data.CodeProjectId,
            reportId: data!.Id
        })
    }).catch(error => {
        throw error;
    })
})

router.get("/getDetailByProjectId/:projectId", (req, res, next) => {
    prisma.codeReport.groupBy({
        by:['Type'],
        where:{
            CodeProjectId: parseInt(req.params.projectId)
        },
        orderBy:{
            Type:'asc'
        },
        _count:true
    }).then(response => {
        let count = 0;
        response.forEach(data => {
            count += data._count;
        })
        res.status(200).json({
            data: response,
            count: count
        })
    }).catch(error => {
        throw error;
    })
})

router.get("/getDetailByProjectIdType", (req, res, next) => {
    const projectId = parseInt(req.query.projectId!.toString());
    const offset = parseInt(req.query.offset!.toString());
    const limit = parseInt(req.query.limit!.toString());
    const type = parseInt(req.query.type!.toString());

    prisma.$transaction([
        prisma.codeReport.findMany({
            where:{
                CodeProjectId: projectId,
                Type: type
            },
            orderBy: {
                CreatedDate:'asc',
            },
            skip: offset,
            take: limit,
            include:{
                User:{
                    select:{
                        FirstName: true,
                        LastName: true
                    }
                }
            }
        }),
        prisma.codeReport.count({
            where:{
                CodeProjectId: projectId,
                Type: type
            }
        })
    ])
    .then(reports => {
        res.status(200).json({
            data: reports[0],
            count: reports[1]
        });
    }, error => {
        throw error;
    })
})

router.get("/:projectId", (req, res, next) => {
    const offset = parseInt(req.query.offset!.toString());
    const limit = parseInt(req.query.limit!.toString());

    prisma.codeReport.findMany({
        where:{
            CodeProjectId: parseInt(req.params.projectId),
            IsDelete: false
        },
        orderBy: {
            CreatedDate:'desc'
        },
        include:{
            User:{
                select:{
                    FirstName: true,
                    LastName: true,
                    ImageUrl: true
                }
            },
            Worker:{
                select:{
                    Name: true,
                    Quantity: true
                }
            },
            Tool: {
                select: {
                    Name: true,
                    Description: true,
                    Quantity: true
                }
            },
            Material:{
                select: {
                    Name: true,
                    Description: true,
                    Quantity: true,
                    Unit: true
                }
            },
            StatusReport: {
                select: {
                    Status: true,
                    StatusReportImage: true
                }
            },
            Weather:{
                select:{
                    WeatherId: true,
                }
            },
            RequestForInformation: {
                include: {
                    RequestForInformationDocument: true,
                    RequestForInformationAnswer:{
                        where:{
                            IsDelete: false
                        },
                        
                        select:{
                            User:{
                                select: {
                                    FirstName: true,
                                    LastName: true,
                                    Email: true,
                                    ImageUrl: true
                                }
                            },
                            Answer: true,
                            CreatedDate: true
                        },
                        orderBy:{
                            CreatedDate: 'desc'
                        },
                        take: 2,
                        skip: 0
                    }
                }
            },
            CodeReportApproval:{
                select:{
                    User:{
                        select:{
                            Email: true
                        }
                    },
                    Approval: true,
                    CreatedDate: true,
                    Id: true
                },
                orderBy:{
                    CreatedDate: 'asc'
                },
                where:{
                    NOT:{
                        Approval: 0
                    },
                    IsDelete: false
                }
                
            },
            CodeReportApprovalComment:{
                select:{
                    User:{
                        select:{
                            FirstName: true,
                            LastName: true,
                            Email: true,
                            ImageUrl: true
                        }
                    },
                    Approval: true,
                    CreatedDate: true,
                    Comment: true,
                    Id: true
                },
                orderBy: {
                    CreatedDate:'desc'
                },
                skip: 0,
                take: 2,
                where:{
                    Approval:0,
                    IsDelete: false
                }
            }
        },
        take: limit,
        skip: offset
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        throw error;
    })
})

export default router;