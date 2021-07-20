"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = express_1.Router();
const prisma = new client_1.PrismaClient();
router.post("/", async (req, res, next) => {
    const client = req.body;
    prisma.clientContact.create({
        data: client
    }).then(result => {
        res.status(201).json({ message: 'Client contact created' });
    }).catch(error => {
        throw error;
    });
});
router.put("/", async (req, res, next) => {
    const client = req.body;
    prisma.clientContact.update({
        where: {
            Id: client.Id
        },
        data: {
            Name: client.Name,
            Position: client.Position,
            Email: client.Email,
            PhoneNumber: client.PhoneNumber
        }
    }).then(() => {
        res.status(201).json({ message: "Client contact updated" });
    }).catch(error => {
        throw error;
    });
});
router.delete("/", async (req, res, next) => {
    const clientId = req.body.Id;
    prisma.clientContact.delete({
        where: {
            Id: clientId
        }
    }).then(() => {
        res.status(201).json({ message: "Client contact deleted" });
    }).catch(error => {
        throw error;
    });
});
//# sourceMappingURL=clientContact.js.map