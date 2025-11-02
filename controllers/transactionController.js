import express from "express";
import {
    createTransaction,
    getAllTransactions,
    getTransactionByHash,
    getTransactionsByWallet,
    updateTransactionStatus
} from "../routes/transactionRoute.js";

const router = express.Router();

router.post("/create", createTransaction);
router.get("/all", getAllTransactions);
router.get("/hash/:txHash", getTransactionByHash);
router.get("/wallet/:walletAddress", getTransactionsByWallet);
router.patch("/:txHash/status", updateTransactionStatus);

export default router;