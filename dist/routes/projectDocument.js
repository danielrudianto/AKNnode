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
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const formidable = __importStar(require("formidable"));
const uuid = __importStar(require("uuid"));
const prisma = new client_1.PrismaClient();
const router = express_1.Router();
router.post("/", (req, res, next) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });
    form.parse(req, function (err, fields, files) {
        const fileLength = parseInt(fields.fileLength.toString());
        const projectId = parseInt(fields.projectId.toString());
        const createdBy = fields.createdBy.toString();
        prisma.user.findUnique({
            where: {
                Email: createdBy
            }
        }).then(user => {
            let i = 0;
            while (i < fileLength) {
                const file = files["file[" + i + "]"];
                const oldpath = file.path;
                const fileNameArray = file.name.split(".");
                const ext = fileNameArray[fileNameArray.length - 1];
                const uid = uuid.v1();
                const newpath = path.join(__dirname, "../img/project/", (uid + "." + ext));
                fs.rename(oldpath, newpath, error => {
                    if (error == null) {
                        prisma.codeProjectDocument.create({
                            data: {
                                CodeProjectId: projectId,
                                Url: "project/" + uid + "." + ext,
                                Name: file.name,
                                CreatedBy: user.Id,
                                CreatedDate: new Date()
                            }
                        }).catch(error => {
                            throw error;
                        });
                    }
                });
                if (i == (fileLength - 1)) {
                    res.status(201).json({ message: "Upload successful" });
                }
                i++;
            }
        }).catch(error => {
            throw error;
        });
    });
});
router.delete("/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    prisma.codeProjectDocument.findUnique({
        where: {
            Id: id
        }
    }).then(document => {
        fs.unlink(path.join(__dirname + '/../img/' + document?.Url), error => {
            if (error) {
                throw error;
            }
            prisma.codeProjectDocument.delete({
                where: {
                    Id: id
                }
            }).then(() => {
                res.status(201).json({ message: "Document deleted" });
            }).catch(error => {
                throw error;
            });
        });
    }).catch(error => {
        throw error;
    });
});
router.get("/:projectId", (req, res, next) => {
    prisma.codeProjectDocument.findMany({
        where: {
            CodeProjectId: parseInt(req.params.projectId)
        },
        orderBy: {
            CreatedDate: 'asc'
        }
    }).then(data => {
        res.status(201).json(data);
    }).catch(error => {
        throw error;
    });
});
router.post("/Rename", (req, res, next) => {
    prisma.codeProjectDocument.findUnique({
        where: {
            Id: parseInt(req.body.Id)
        }
    }).then(document => {
        const name = document?.Name;
        const nameArray = name?.split(".");
        const ext = nameArray[nameArray.length - 1];
        prisma.codeProjectDocument.update({
            where: {
                Id: parseInt(req.body.Id.toString())
            },
            data: {
                Name: req.body.Name + "." + ext
            }
        }).then(doc => {
            const io = req.app.get('socketio');
            io.emit('updateDocumentName', doc);
        }).catch(error => {
            throw error;
        });
    }).catch(error => {
        throw error;
    });
});
exports.default = router;
//# sourceMappingURL=projectDocument.js.map