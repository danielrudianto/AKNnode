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
const express_1 = require("express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mime = __importStar(require("mime-types"));
const client_1 = require("@prisma/client");
const router = express_1.Router();
const prisma = new client_1.PrismaClient();
router.get("/:folder/:fileName", async (req, res, next) => {
    try {
        const mimeType = mime.lookup(req.params.fileName);
        if (fs.existsSync(path.join(__dirname + "/../img/" + req.params.folder + "/" + req.params.fileName)) && mimeType != false) {
            const data = await prisma.codeProjectDocument.findFirst({
                where: {
                    Url: {
                        contains: req.params.fileName
                    }
                }
            });
            if (data != null) {
                const file = fs.createReadStream(path.join(__dirname + "/../img/" + req.params.folder + "/" + req.params.fileName));
                res.setHeader('Content-Type', mimeType);
                res.setHeader('Content-Disposition', 'inline; filename="' + data.Name + "'");
                file.pipe(res);
            }
            else {
                return res.status(404).json({ message: "Database not found" });
            }
        }
        else {
            return res.status(404).json({ message: "Incorrect format" });
        }
    }
    catch (err) {
        return res.status(404).json({ message: "File not found" });
    }
});
exports.default = router;
//# sourceMappingURL=download.js.map