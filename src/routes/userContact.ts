import { Router } from 'express';
import { UserLogin, UserFormModel, UserPresentationModel } from '../models/user';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as fs from "fs";
import * as path from 'path';

const prisma = new PrismaClient()

const router = Router();

router.get("/", (req, res, next) => {
    const email = req.query.email?.toString();
    const offset = parseInt(req.query.offset!.toString());
    const limit = parseInt(req.query.limit!.toString());

    prisma.user.findUnique({
        where:{
            Email: email,
        }
    }).then(user => {
        prisma.$transaction([
            prisma.userContact.count({
                where:{
                    UserId: user!.Id
                }
            }),
            prisma.userContact.findMany({
                where:{
                    UserId: user!.Id
                },
                orderBy: {
                    Id: 'asc'
                },
                skip:offset,
                take: limit
            })
        ]).then(response => {
            res.json({
                count: response[0],
                data: response[1]
            })
        }).catch(error => {
            throw error;
        })
    }).catch(error => {
        throw error;
    })
})

router.post("/", (req, res, next) => {
    const phoneNumber = req.body.PhoneNumber.toString();
    const whatsappAvailable = req.body.WhatsappAvailable;
    const userEmail = req.body.UserEmail;
    prisma.user.findUnique({
        where:{
            Email: userEmail
        }
    }).then(user => {
        prisma.userContact.create({
            data: {
                PhoneNumber: phoneNumber,
                WhatsappAvailable: whatsappAvailable,
                UserId:user!.Id 
            }
        }).then(() => {
            res.json({message: "User contact created"});
        }).catch(error => {
            throw error;
        })
    }).catch(error => {
        throw error;
    })
})

router.delete("/:contactId", (req, res, next) => {
    const contactId = parseInt(req.params.contactId) as number;
    prisma.userContact.delete({
        where:{
            Id: contactId
        }
    }).then(() => {
        res.json({message: "User contact deleted"})
    }).catch(error => {
        throw error;
    })
})

export default router;