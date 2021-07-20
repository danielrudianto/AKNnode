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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.get("/", (req, res, next) => {
    if (req.headers.authorization == null || req.headers.authorization == "") {
        res.sendStatus(401);
    }
    else {
        const token = req.headers.authorization?.toString().split(' ')[1];
        const decoded = jwt.verify(token, fs.readFileSync(path.join(__dirname, "../private.key")), { algorithms: ['RS256'] });
        prisma.user.findFirst({
            where: {
                Email: decoded.Email,
                IsActive: true
            },
            include: {
                UserPosition: {
                    orderBy: {
                        EffectiveDate: 'desc'
                    },
                    where: {
                        User5: {
                            Email: decoded.Email
                        }
                    },
                    select: {
                        Position: true,
                        EffectiveDate: true
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
            res.status(200).json({ token: token });
        }).catch(error => {
            throw error;
        });
    }
});
router.post("/register", async (req, res, next) => {
    const body = req.body;
    prisma.user.update({
        where: {
            Email: body.Email
        },
        data: {
            Password: bcrypt_1.default.hashSync(body.Password, 10)
        },
        include: {
            UserPosition: {
                orderBy: {
                    EffectiveDate: 'desc'
                },
                where: {
                    User5: {
                        Email: body.Email
                    }
                },
                select: {
                    Position: true,
                    EffectiveDate: true
                }
            }
        }
    }).then(user => {
        const userInfo = user;
        bcrypt_1.default.compare(body.Password, userInfo.Password).then(result => {
            if (result) {
                let token = jwt.sign({
                    FirstName: user?.FirstName,
                    LastName: user?.LastName,
                    Email: user?.Email,
                    IsActive: user?.IsActive,
                    ImageUrl: user?.ImageUrl,
                    ThumbnailUrl: user?.ThumbnailUrl,
                    Position: user.UserPosition[0]
                }, fs.readFileSync(path.resolve(__dirname, "../private.key")), {
                    algorithm: 'RS256',
                    expiresIn: "30 days",
                });
                res.status(200).json({
                    token: token,
                    expiration: new Date().setDate(new Date().getDate() + 30)
                });
            }
            else {
                res.sendStatus(401);
            }
        });
    }).catch(error => {
        res.sendStatus(401);
    });
});
router.post("/login", async (req, res, next) => {
    const body = req.body;
    prisma.user.findFirst({
        where: {
            Email: body.Email,
            IsActive: true
        },
        include: {
            UserPosition: {
                orderBy: {
                    EffectiveDate: 'desc'
                },
                where: {
                    User5: {
                        Email: body.Email
                    }
                },
                select: {
                    Position: true,
                    EffectiveDate: true
                }
            }
        }
    }).then(user => {
        const userInfo = user;
        bcrypt_1.default.compare(body.Password, userInfo.Password).then(result => {
            if (result) {
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
                res.status(200).json({
                    token: token,
                    expiration: new Date().setDate(new Date().getDate() + 30)
                });
            }
            else {
                return res.status(401).json({ message: "Incorrect username or password" });
            }
        });
    }).catch(error => {
        throw Error("User not found");
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map