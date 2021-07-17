"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
router.get("/", (req, res, next) => {
});
router.get("/login", (req, res, next) => {
    const body = req.body;
    res.status(200).send({
        id: 1,
        name: "Daniel"
    });
});
exports.default = router;
