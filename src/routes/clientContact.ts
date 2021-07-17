import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import { clientContactForm } from '../models/clientContact';

const router = Router();
const prisma = new PrismaClient();

router.post("/", async(req, res, next) => {
    const client = req.body as clientContactForm;
    prisma.clientContact.create({
        data:client
    }).then(result => {
        res.status(201).json({message: 'Client contact created'});
    }).catch(error => {
        throw error;
    })
})

router.put("/", async(req, res, next) => {
    const client = req.body as clientContactForm;
    prisma.clientContact.update({
        where:{
            Id: client.Id
        },
        data:{
            Name: client.Name,
            Position: client.Position,
            Email: client.Email,
            PhoneNumber: client.PhoneNumber
        }
    }).then(() => {
        res.status(201).json({ message: "Client contact updated"});
    }).catch(error => {
        throw error;
    })
})

router.delete("/", async(req, res, next) => {
    const clientId = req.body.Id as number;
    prisma.clientContact.delete({
        where:{
            Id: clientId
        }
    }).then(() => {
        res.status(201).json({message: "Client contact deleted"});
    }).catch(error => {
        throw error;
    })
})