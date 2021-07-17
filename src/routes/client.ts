import { Router } from 'express';
import { ClientFormModel } from '../models/client';
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const router = Router();

router.get("/", async(req, res, next) => {
    if(req.query.search != undefined){
        const search = req.query.search.toString();
        prisma.client.findMany({
            where:{
                IsDelete: false,
                OR: [
                    {
                        Name:{
                            contains: search
                        }
                    },
                    {
                        Address:{
                            contains: search
                        }
                    },
                    {
                        City:{
                            contains: search
                        }
                    },
                ]
            },
            skip:0,
            take:15
        }).then(response => {
            res.status(200).json(response)
        }, error => {
            return res.status(500).json({message: error.message});
        })
    } else {
        const offset = parseInt(req.query.offset?.toString()!);
        const limit = parseInt(req.query.limit?.toString()!);
        prisma.$transaction([
            prisma.client.count({
                where:{
                    IsDelete: false
                }
            }),
            prisma.client.findMany({
                orderBy: [
                    {
                        Name: 'asc'
                    }
                ],
                where:{
                    IsDelete: false
                },
                skip: offset,
                take: limit,
                include:{
                    Contact: {
                        orderBy: {
                            Name: 'asc'
                        }
                    }
                }
            })
        ]).then((response) => {
            res.status(200).json({
                count: response[0],
                data: response[1]
            })
        }).catch(error => {
            throw error;
        })
    }
})

router.post("/", async (req, res, next) => {
    prisma.user.findUnique({
        where:{
            Email: req.body.CreatedBy,
        }
    }).then(user => {
        prisma.client.create({
            data: {
                Name: req.body.Name,
                Address: req.body.Address,
                City: req.body.City,
                PhoneNumber: req.body.PhoneNumber,
                TaxIdentificationNumber: req.body.TaxIdentificationNumber,
                CreatedBy: user!.Id,
                CreatedDate: new Date()
            }
        }).then(() => {
            res.status(201).json({ message: 'Client created'});
        }).catch(error => {
            throw error;
        })
    })
})

router.put("/", async (req, res, next) => {
    const client = req.body as ClientFormModel;
    prisma.client.update({
        where:{
            Id: client.Id
        },
        data:{
            Name: client.Name,
            Address: client.Address,
            City: client.City,
            PhoneNumber: client.PhoneNumber,
            TaxIdentificationNumber: client.TaxIdentificationNumber.toString()
        }
    }).then(() => {
        res.status(201).json({message: "Client updated"});
    }).catch(error => {
        throw error;
    })
});

router.delete("/:clientId", async(req, res, next) => {
    const clientId = parseInt(req.params.clientId) as number;
    prisma.client.update({
        where:{
            Id: clientId
        },
        data:{
            IsDelete: true
        }
    }).then(() => {
        res.status(201).json({ message:"Client deleted"})
    }).catch(error => {
        throw error;
    })

    return;
})

export default router;