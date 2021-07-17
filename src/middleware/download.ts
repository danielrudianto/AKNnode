import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get("/:folder/:fileName", async(req, res, next) => {
    try {
        const mimeType = mime.lookup(req.params.fileName);
        if (fs.existsSync(path.join(__dirname + "/../img/" + req.params.folder + "/" + req.params.fileName)) && mimeType != false) {
            const data = await prisma.codeProjectDocument.findFirst({
                where:{
                    Url: {
                        contains: req.params.fileName
                    }
                }
            });

            if(data != null){
                const file = fs.createReadStream(path.join(__dirname + "/../img/" + req.params.folder + "/" + req.params.fileName));
                res.setHeader('Content-Type', mimeType);
                res.setHeader(
                    'Content-Disposition',
                    'inline; filename="' + data.Name + "'"
                );
                file.pipe(res);
            } else {
                return res.status(404).json({ message: "Database not found" })
            }
            
        } else {
            return res.status(404).json({ message: "Incorrect format" })
        }
      } catch(err) {
        return res.status(404).json({ message: "File not found" })
      }
})

export default router;
