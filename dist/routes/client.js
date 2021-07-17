"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
router.get("/", (req, res, next) => {
    res.status(200).json({});
});
router.post("/", (req, res, next) => {
    const body = req.body;
    res.status(200).json({});
});
exports.default = router;
