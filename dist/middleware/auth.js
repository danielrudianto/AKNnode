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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const auth = (req, res, next) => {
    if (req.headers.authorization == null || req.headers.authorization == "" || req.headers.authorization == "Bearer null" || req.headers.authorization == "Bearer " || req.headers.authorization == "Bearer") {
        res.sendStatus(401);
    }
    else {
        const token = req.headers.authorization?.toString().split(' ')[1];
        const decoded = jwt.verify(token, fs.readFileSync(path.join(__dirname, "../private.key")), { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid token" });
            }
            else {
                prisma.user.findUnique({
                    where: {
                        Email: decoded.Email
                    }
                }).then(user => {
                    if (user?.IsActive) {
                        next();
                    }
                    else {
                        return res.status(401).json({ message: "Inactive user" });
                    }
                }).catch((error) => {
                    return res.status(401).json({ message: error.message });
                });
            }
        });
    }
};
exports.default = auth;
//# sourceMappingURL=auth.js.map