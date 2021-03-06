import { Router } from 'express';
import { UserFormModel } from '../models/user';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as fs from "fs";
import * as path from 'path';
import * as formidable from 'formidable';
import * as uuid from 'uuid';
import bcrypt from 'bcrypt';
import sharp from 'sharp';

const prisma = new PrismaClient()

const router = Router();

router.get("/profile", (req, res, next) => {
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.resolve(__dirname, "../private.key")), 
        { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where:{
            Email: decoded.Email
        },
        select:{
            FirstName: true,
            LastName: true,
            Email: true,
            IsActive: true,
            UserPosition: {
                orderBy: {
                    EffectiveDate: 'desc'
                }
            },
            Id: true,
            ImageUrl: true,
            ThumbnailUrl: true
        },
    }).then(user => {
        return res.status(200).json(user);
    }).catch(error => {
        throw error;
    })
})

router.post("/", (req, res, next) => {
    const user = req.body as UserFormModel;
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.resolve(__dirname, "../private.key")), 
        { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where:{
            Email: decoded.Email
        },
    }).then(x => {
        prisma.user.create({
            data: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                IsActive: true,
                Email: user.Email
            }
        }).then(response => {
            prisma.userPosition.create({
                data:{
                    Position: user.Position!,
                    UserId: response.Id!,
                    EffectiveDate: new Date(),
                    CreatedBy: x!.Id,
                    CreatedDate: new Date()
                }
            }).then(() => {
                res.status(201).json({ message: "User created"});
            }).catch(error => {
                throw error;
            })
        }).catch(error => {
            throw error;
        })
    })
});

router.get("/", (req, res, next) => {
    if(req.query.search != undefined){
        const search = req.query.search as string;
        const excluded: number[] = JSON.parse(req.query.excludedUser as string) as number[];
        prisma.user.findMany({
            where:{
                IsActive: true,
                NOT:{
                    Id: {
                        in: excluded
                    }
                },
                OR:[
                    {
                        FirstName:{
                            contains: search
                        }
                    },
                    {
                        LastName:{
                            contains: search
                        }
                    }
                ]
            },
            orderBy:{
                FirstName: 'asc'
            },
            include:{
                UserPosition:{
                    orderBy:{
                        EffectiveDate: 'desc'
                    },
                    select:{
                        Position: true,
                        EffectiveDate: true
                    }
                }
            }
        }).then((response: any[]) => {
            response.forEach(x => {
                delete x.Password;
            })
            
            res.status(200).json(response)
        }).catch(error => {
            return res.status(500).json({message: error.message});
        })
    } else {
        const limit = req.body.limit as number;
        const offset = req.body.offset as number;

        prisma.$transaction([
            prisma.user.count({
                where:{
                    IsActive: true
                }
            }),
            prisma.user.findMany({
                where:{
                    IsActive: true
                },
                include:{
                    UserContact:{
                        select:{
                            PhoneNumber: true,
                            WhatsappAvailable: true
                        }
                    },
                    UserPosition: {
                        select:{
                            Position: true,
                        },
                        orderBy:{
                            EffectiveDate: 'desc'
                        }
                    }
                },
                skip:offset,
                take: limit
            })
        ]).then(response => {
            res.status(200).json({
                count: response[0],
                data: response[1]
            })
        }).catch(error => {
            return res.status(500).json({message: error.message});
        });
    }
})

router.post("/profilePicture", (req, res, next) => {
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
            const form = new formidable.IncomingForm({
                uploadDir: path.join(__dirname, "../tmp")
            });
            form.parse(req, function (err, fields, files: any) {
                const oldpath = files.image.path;
                const fileNameArray = files.image.name.split(".");
                const ext = fileNameArray[fileNameArray.length - 1];
                const id = uuid.v1();

                sharp(oldpath).resize({
                    fit: sharp.fit.contain,
                    width:200
                }).toFile(path.join(__dirname, "../img/profile/", (id + "." + ext))).then(() => {
                    prisma.user.update({
                        where:{
                            Id: user!.Id
                        },
                        data:{
                            ImageUrl:'profile/' + (id + "." + ext)
                        },
                        include:{
                            UserPosition: true
                        }
                    }).then(user => {
                        res.status(201).json({message: "Profile picture updated"});
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
                        const io = req.app.get('socketio');
                        io.emit('updateToken', {
                            Email: user?.Email,
                            Token: token
                        })
                    }).catch(error => {
                        throw error;
                    })
                })
            });
        })
})

router.put("/", (req, res, next) => {
    const user = req.body as UserFormModel;
    prisma.user.findUnique({
        where:{
            Id: user.Id
        }
    }).then(existingUser => {
        prisma.user.update({
            where:{
                Id: user.Id
            },
            data: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                IsActive: true,
                Email: user.Email
            },
            include:{
                UserPosition: true
            }
        }).then(response => {
            res.status(201).json({ message: "User updated"});
            let token = jwt.sign(
                {
                    FirstName: response?.FirstName,
                    LastName: response?.LastName,
                    Email: response?.Email,
                    IsActive: response?.IsActive,
                    ImageUrl: response?.ImageUrl,
                    ThumbnailUrl: response?.ThumbnailUrl,
                    Position: response?.UserPosition[0]
                }, fs.readFileSync(path.resolve(__dirname, "../private.key")),
                { 
                    algorithm: 'RS256',
                    expiresIn: "30 days",
                }
            )
    
            const io = req.app.get('socketio');
            io.emit('updateToken', {
                Email: existingUser!.Email,
                Token: token
            })

            io.emit('userEdit', {
                Id: existingUser!.Id
            })
        }).catch(error => {
            throw error;
        })
    }).catch(() => {
        throw Error("User not found");
    })
    
})

router.delete("/:userId", (req, res, next) => {
    const id = parseInt(req.params.userId.toString());
    prisma.user.update({
        where:{
            Id: id
        },
        data:{
            IsActive: false
        },
        select: {
            Email: true
        }
    }).then(user => {
        const io = req.app.get('socketio');
        io.emit('userDelete', {
            Email: user!.Email
        })

        io.emit('deleteToken', {
            Email: user!.Email
        })

        res.status(201).json({ message: "User deleted"});
    }).catch(error => {
        throw error;
    })
})

router.put("/resetPassword", (req, res, next) => {
    const token: string = req.headers.authorization?.toString().split(' ')[1]!;
    const decoded: any = jwt.verify(
        token, 
        fs.readFileSync(path.resolve(__dirname, "../private.key")), 
        { algorithms: ['RS256'] });
    prisma.user.update({
        where:{
            Email: decoded.Email
        },
        data:{
            Password:bcrypt.hashSync(req.body.Password, 10)
        }
    }).then(() => {
        res.status(201).json({message: "User password updated"})
    }).catch(error => {
        res.status(500).json({message: error.message});
        throw error;
    })
})

export default router;