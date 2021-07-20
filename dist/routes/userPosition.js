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
const project_manager_auth_1 = __importDefault(require("../middleware/project-manager-auth"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.post("/", (req, res, next) => {
    const body = req.body;
    const token = req.headers.authorization?.toString().split(' ')[1];
    const decoded = jwt.verify(token, fs.readFileSync(path.join(__dirname, "../private.key")), { algorithms: ['RS256'] });
    prisma.$transaction([
        prisma.user.findUnique({
            where: {
                Email: decoded.Email
            },
            include: {
                UserPosition: {
                    orderBy: {
                        EffectiveDate: 'desc'
                    }
                }
            }
        }),
        prisma.user.findUnique({
            where: {
                Email: body.UserEmail
            }
        })
    ]).then(response => {
        if (response.length == 2) {
            prisma.userPosition.create({
                data: {
                    Position: body.Position,
                    CreatedBy: response[0].Id,
                    UserId: response[1].Id,
                    EffectiveDate: new Date(),
                    CreatedDate: new Date()
                }
            }).then(() => {
                res.status(201).json({ message: "User position created" });
                let token = jwt.sign({
                    FirstName: response[0]?.FirstName,
                    LastName: response[0]?.LastName,
                    Email: response[0]?.Email,
                    IsActive: response[0]?.IsActive,
                    ImageUrl: response[0]?.ImageUrl,
                    ThumbnailUrl: response[0]?.ThumbnailUrl,
                    Position: response[0]?.UserPosition[0]
                }, fs.readFileSync(path.resolve(__dirname, "../private.key")), {
                    algorithm: 'RS256',
                    expiresIn: "30 days",
                });
                const io = req.app.get('socketio');
                io.emit('updateToken', {
                    Email: response[0]?.Email,
                    Token: token
                });
            }).catch(error => {
                throw error;
            });
        }
    }).catch(error => {
        throw error;
    });
});
router.get("/:email", (req, res, next) => {
    const email = req.params.email;
    const limit = parseInt(req.query.limit.toString());
    const offset = parseInt(req.query.offset.toString());
    prisma.$transaction([
        prisma.userPosition.count({
            where: {
                User5: {
                    Email: email
                }
            }
        }),
        prisma.userPosition.findMany({
            where: {
                User5: {
                    Email: email
                }
            },
            include: {
                User4: {
                    select: {
                        FirstName: true,
                        LastName: true
                    }
                }
            },
            skip: offset,
            take: limit,
            orderBy: {
                EffectiveDate: 'desc'
            }
        })
    ])
        .then(response => {
        res.status(200).json({
            count: response[0],
            data: response[1]
        });
    }, error => {
        throw error;
    });
});
router.delete("/:id", project_manager_auth_1.default, (req, res, next) => {
    const id = parseInt(req.params.id);
    prisma.userPosition.findUnique({
        where: {
            Id: id
        }
    }).then(async (position) => {
        const count = await prisma.userPosition.count({
            where: {
                UserId: position.UserId
            }
        });
        if (count > 1) {
            prisma.userPosition.delete({
                where: {
                    Id: id
                }
            }).then(() => {
                res.status(201).json({
                    message: "User position deleted"
                });
                prisma.user.findUnique({
                    where: {
                        Id: position.UserId
                    },
                    include: {
                        UserPosition: {
                            orderBy: {
                                EffectiveDate: 'desc'
                            }
                        }
                    }
                }).then(user => {
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
                });
            });
        }
        else {
            return res.status(500).json({
                message: "Cannot delete the only one"
            });
        }
    }).catch(error => {
        throw error;
    });
});
exports.default = router;
//# sourceMappingURL=userPosition.js.map