import express from "express";
import { checkIfAccountExists, createAccount, getUser } from "../routes/userRoutes.js";

const router = express.Router();

router.post("/check", checkIfAccountExists);
router.post("/create", createAccount);
router.get("/:walletAddress", getUser);

export default router;