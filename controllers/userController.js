import express from "express";
import {  createAccount, getUser } from "../routes/userRoutes.js";

const router = express.Router();

router.post("/create", createAccount);
router.get("/:walletAddress", getUser);

export default router;