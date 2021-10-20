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
    if(req.headers.authorization == null || req.headers.authorization == "" || req.headers.authorization == "Bearer null" || req.headers.authorization == "Bearer " || req.headers.authorization == "Bearer"){
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
    console.log(body);
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
        console.log(user);
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
                res.status(404).json({message: "Incorrect username or password"});
                throw Error("Incorrect username or password");
            }
        })
    }).catch(error => {
        res.status(404).json({message: "User not found"});
        throw Error("User not found");
    })
});

router.delete("/sendCloudToken", (req, res, next) => {
    const token = req.query.token?.toString();
    prisma.userToken.deleteMany({
        where:{
            Token: token
        }
    }).then(() => {
        res.status(201).json({message: "Token deleted"});
    }).catch(error => {
        throw error;
    })
})

router.post("/sendCloudToken", (req, res, next) => {
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.join(__dirname, "../private.key")), 
        { algorithms: ['RS256'] }
    );

    const cloudToken = req.body.token;
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
        prisma.$transaction([
            prisma.userToken.deleteMany({
                where:{
                    Token: cloudToken
                }
            }),
            prisma.userToken.create({
                data:{
                    UserId: user?.Id,
                    Token: cloudToken
                }
            })
        ]).then(() => {
            res.status(200).json({message: "Token created"});
        }).catch(error => {
            throw error;
        })
    }).catch(error => {
        throw error;
    })
})


export default router;