"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const formidable = __importStar(require("formidable"));
const uuid = __importStar(require("uuid"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sharp_1 = __importDefault(require("sharp"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.get("/profile", (req, res, next) => {
    const token = req.headers.authorization?.toString().split(' ')[1];
    const decoded = jwt.verify(token, fs.readFileSync(path.resolve(__dirname, "../private.key")), { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where: {
            Email: decoded.Email
        },
        select: {
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
    });
});
router.post("/", (req, res, next) => {
    const user = req.body;
    const token = req.headers.authorization?.toString().split(' ')[1];
    const decoded = jwt.verify(token, fs.readFileSync(path.resolve(__dirname, "../private.key")), { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where: {
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
                data: {
                    Position: user.Position,
                    UserId: response.Id,
                    EffectiveDate: new Date(),
                    CreatedBy: x.Id,
                    CreatedDate: new Date()
                }
            }).then(() => {
                res.status(201).json({ message: "User created" });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    });
});
router.get("/", (req, res, next) => {
    if (req.query.search != undefined) {
        const search = req.query.search;
        const excluded = JSON.parse(req.query.excludedUser);
        prisma.user.findMany({
            where: {
                IsActive: true,
                NOT: {
                    Id: {
                        in: excluded
                    }
                },
                OR: [
                    {
                        FirstName: {
                            contains: search
                        }
                    },
                    {
                        LastName: {
                            contains: search
                        }
                    }
                ]
            },
            orderBy: {
                FirstName: 'asc'
            },
            include: {
                UserPosition: {
                    orderBy: {
                        EffectiveDate: 'desc'
                    },
                    select: {
                        Position: true,
                        EffectiveDate: true
                    }
                }
            }
        }).then((response) => {
            response.forEach(x => {
                delete x.Password;
            });
            res.status(200).json(response);
        }).catch(error => {
            return res.status(500).json({ message: error.message });
        });
    }
    else {
        const limit = req.body.limit;
        const offset = req.body.offset;
        prisma.$transaction([
            prisma.user.count({
                where: {
                    IsActive: true
                }
            }),
            prisma.user.findMany({
                where: {
                    IsActive: true
                },
                include: {
                    UserContact: {
                        select: {
                            PhoneNumber: true,
                            WhatsappAvailable: true
                        }
                    },
                    UserPosition: {
                        select: {
                            Position: true,
                        },
                        orderBy: {
                            EffectiveDate: 'desc'
                        }
                    }
                },
                skip: offset,
                take: limit
            })
        ]).then(response => {
            res.status(200).json({
                count: response[0],
                data: response[1]
            });
        }).catch(error => {
            return res.status(500).json({ message: error.message });
        });
    }
});
router.post("/profilePicture", (req, res, next) => {
    const token = req.headers.authorization?.toString().split(' ')[1];
    const decoded = jwt.verify(token, fs.readFileSync(path.join(__dirname, "../private.key")), { algorithms: ['RS256'] });
    prisma.user.findUnique({
        where: {
            Email: decoded.Email
        }
    }).then(user => {
        const form = new formidable.IncomingForm({
            uploadDir: path.join(__dirname, "../tmp")
        });
        form.parse(req, function (err, fields, files) {
            const oldpath = files.image.path;
            const fileNameArray = files.image.name.split(".");
            const ext = fileNameArray[fileNameArray.length - 1];
            const id = uuid.v1();
            sharp_1.default(oldpath).resize({
                fit: sharp_1.default.fit.contain,
                width: 200
            }).toFile(path.join(__dirname, "../img/profile/", (id + "." + ext))).then(() => {
                prisma.user.update({
                    where: {
                        Id: user.Id
                    },
                    data: {
                        ImageUrl: 'profile/' + (id + "." + ext)
                    },
                    include: {
                        UserPosition: true
                    }
                }).then(user => {
                    res.status(201).json({ message: "Profile picture updated" });
                    let token = jwt.sign({
                        FirstName: user?.FirstName,
                        LastName: user?.LastName,
                        Email: user?.Email,
                        IsActive: user?.IsActive,
                        ImageUrl: user?.ImageUrl,
                        ThumbnailUrl: user?.ThumbnailUrl,
                        Position: user?.UserPosition[0]
                    }, fs.readFileSync(path.resolve(__dirname, "../private.key")), {
                        algorithm: 'RS256',
                        expiresIn: "30 days",
                    });
                    const io = req.app.get('socketio');
                    io.emit('updateToken', {
                        Email: user?.Email,
                        Token: token
                    });
                }).catch(error => {
                    throw error;
                });
            });
        });
    });
});
router.put("/", (req, res, next) => {
    const user = req.body;
    prisma.user.findUnique({
        where: {
            Id: user.Id
        }
    }).then(existingUser => {
        prisma.user.update({
            where: {
                Id: user.Id
            },
            data: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                IsActive: true,
                Email: user.Email
            },
            include: {
                UserPosition: true
            }
        }).then(response => {
            res.status(201).json({ message: "User updated" });
            let token = jwt.sign({
                FirstName: response?.FirstName,
                LastName: response?.LastName,
                Email: response?.Email,
                IsActive: response?.IsActive,
                ImageUrl: response?.ImageUrl,
                ThumbnailUrl: response?.ThumbnailUrl,
                Position: response?.UserPosition[0]
            }, fs.readFileSync(path.resolve(__dirname, "../private.key")), {
                algorithm: 'RS256',
                expiresIn: "30 days",
            });
            const io = req.app.get('socketio');
            io.emit('updateToken', {
                Email: existingUser.Email,
                Token: token
            });
            io.emit('userEdit', {
                Id: existingUser.Id
            });
        }).catch(error => {
            throw error;
        });
    }).catch(() => {
        throw Error("User not found");
    });
});
router.delete("/:userId", (req, res, next) => {
    const id = parseInt(req.params.userId.toString());
    prisma.user.update({
        where: {
            Id: id
        },
        data: {
            IsActive: false
        },
        select: {
            Email: true
        }
    }).then(user => {
        const io = req.app.get('socketio');
        io.emit('userDelete', {
            Email: user.Email
        });
        io.emit('deleteToken', {
            Email: user.Email
        });
        res.status(201).json({ message: "User deleted" });
    }).catch(error => {
        throw error;
    });
});
router.put("/resetPassword", (req, res, next) => {
    const token = req.headers.authorization?.toString().split(' ')[1];
    const decoded = jwt.verify(token, fs.readFileSync(path.resolve(__dirname, "../private.key")), { algorithms: ['RS256'] });
    prisma.user.update({
        where: {
            Email: decoded.Email
        },
        data: {
            Password: bcrypt_1.default.hashSync(req.body.Password, 10)
        }
    }).then(() => {
        res.status(201).json({ message: "User password updated" });
    }).catch(error => {
        res.status(500).json({ message: error.message });
        throw error;
    });
});
exports.default = router;
//# sourceMappingURL=user.js.map