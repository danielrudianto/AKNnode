import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

const auth = (req: any, res: any, next: any) => {
    if(req.headers.authorization == null || req.headers.authorization == "" || req.headers.authorization == "Bearer null" || req.headers.authorization == "Bearer " || req.headers.authorization == "Bearer"){
        res.sendStatus(401);
    } else {
        const token: string = req.headers.authorization?.toString().split(' ')[1]!;
        jwt.verify(
            token, 
            fs.readFileSync(path.join(__dirname, "../private.key")), 
            { algorithms: ['RS256'] },
            (err, decoded) => {
                if(err){
                    return res.status(401).json({message: "Invalid token"})
                } else {
                    prisma.user.findUnique({
                        where:{
                            Email: decoded!.Email
                        }
                    }).then(user => {
                        if(user?.IsActive){
                            next();
                        } else {
                            return res.status(401).json({message: "Inactive user"})
                        }
                    }).catch((error) => {
                        return res.status(401).json({message: error.message})
                    })
                }
            }
        );
        
    }
    
};

export default auth;
