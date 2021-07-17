import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

const auth = (req: any, res: any, next: any) => {
    if(req.headers.authorization == null || req.headers.authorization == ""){
        res.sendStatus(401);
    } else {
        const token: string = req.headers.authorization?.toString().split(' ')[1]!;
        const decoded: any = jwt.verify(
            token, 
            fs.readFileSync(path.join(__dirname, "../private.key")), 
            { algorithms: ['RS256'] }
        );
        prisma.user.findUnique({
            where:{
                Email: decoded.Email
            },
            include:{
                UserPosition:{
                    select:{
                        Position:true,
                        EffectiveDate: true
                    },
                    orderBy:{
                        EffectiveDate: 'desc'
                    },
                    take:1,
                    skip:0
                }
            }
        }).then(user => {
            if(user?.IsActive && user.UserPosition[0].Position == 4){
                next();
            } else {
                res.sendStatus(401); 
            }
        }).catch(() => {
            res.sendStatus(401);
        })
    }
    
};

export default auth;
