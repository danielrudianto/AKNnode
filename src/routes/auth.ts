import { Router } from 'express';
import { UserLogin, UserFormModel, UserPresentationModel, UserLoginPresentationModel } from '../models/user';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as fs from "fs";
import * as path from 'path';

const prisma = new PrismaClient()

const router = Router();

router.get("/", (req, res, next) => {
    if(req.headers.authorization == null || req.headers.authorization == ""){
        res.sendStatus(401);
    } else {
        const token: string = req.headers.authorization?.toString().split(' ')[1]!;
        const decoded: any = jwt.verify(
            token, 
            fs.readFileSync(path.join(__dirname, "../private.key")), 
            { algorithms: ['RS256'] }
        );
        prisma.user.findFirst({
            where:{
                Email: decoded.Email,
                IsActive: true
            },
            include:{
                UserPosition:{
                    orderBy:{
                        EffectiveDate: 'desc'
                    },
                    where:{
                        User5:{
                            Email: decoded.Email
                        } 
                    },
                    select:{
                        Position: true,
                        EffectiveDate: true
                    }
                }
            }
        }).then(user => {
            let token = jwt.sign(
                {
                    FirstName: user?.FirstName,
                    LastName: user?.LastName,
                    Email: user?.Email,
                    IsActive: user?.IsActive,
                    ImageUrl: user?.ImageUrl,
                    ThumbnailUrl: user?.ThumbnailUrl,
                    Position: user?.UserPosition[0]
                }, fs.readFileSync(path.resolve(__dirname, "../private.key")),
                { 
                    algorithm: 'RS256',
                    expiresIn: "30 days",
                }
            )

            res.status(200).json({token: token});
        }).catch(error => {
            throw error;
        })
    }
})

router.post("/register", async(req, res, next) => {
    const body = req.body as UserLogin;
    prisma.user.update({
        where: {
            Email: body.Email
        },
        data:{
            Password: bcrypt.hashSync(body.Password, 10)
        },
        include:{
            UserPosition:{
                orderBy:{
                    EffectiveDate: 'desc'
                },
                where:{
                    User5:{
                        Email: body.Email
                    } 
                },
                select:{
                    Position: true,
                    EffectiveDate: true
                }
            }
        }
    }).then(user => {
        const userInfo = user as UserLoginPresentationModel;
        bcrypt.compare(body.Password, userInfo.Password).then(result => {
            if(result){
                let token = jwt.sign(
                    {
                        FirstName: user?.FirstName,
                        LastName: user?.LastName,
                        Email: user?.Email,
                        IsActive: user?.IsActive,
                        ImageUrl: user?.ImageUrl,
                        ThumbnailUrl: user?.ThumbnailUrl,
                        Position: user.UserPosition[0]
                    }, fs.readFileSync(path.resolve(__dirname, "../private.key")),
                    { 
                        algorithm: 'RS256',
                        expiresIn: "30 days",
                    }
                )

                res.status(200).json({
                    token: token,
                    expiration: new Date().setDate(new Date().getDate() + 30)
                });
            } else {
                res.sendStatus(401);
            }
        })
    }).catch(error => {
        res.sendStatus(401);
    })
});

router.post("/login", async(req, res, next) => {
    const body = req.body as UserLogin;
    prisma.user.findFirst({
        where: {
            Email: body.Email,
            IsActive: true
        },
        include:{
            UserPosition:{
                orderBy:{
                    EffectiveDate: 'desc'
                },
                where:{
                    User5:{
                        Email: body.Email
                    } 
                },
                select:{
                    Position: true,
                    EffectiveDate: true
                }
            }
        }
    }).then(user => {
        const userInfo = user as UserLoginPresentationModel;
        bcrypt.compare(body.Password, userInfo.Password).then(result => {
            if(result){
                let token = jwt.sign(
                    {
                        FirstName: user?.FirstName,
                        LastName: user?.LastName,
                        Email: user?.Email,
                        IsActive: user?.IsActive,
                        ImageUrl: user?.ImageUrl,
                        ThumbnailUrl: user?.ThumbnailUrl,
                        Position: user?.UserPosition[0]
                    }, fs.readFileSync(path.resolve(__dirname, "../private.key")),
                    { 
                        algorithm: 'RS256',
                        expiresIn: "30 days",
                    }
                )

                res.status(200).json({
                    token: token,
                    expiration: new Date().setDate(new Date().getDate() + 30)
                });
            } else {
                return res.status(401).json({message: "Incorrect username or password"});
            }
        })
    }).catch(error => {
        res.sendStatus(401).json({message: "User not found"});
    })
});


export default router;