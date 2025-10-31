import express from "express";
import {
    createTransactionController,
    getAllTransactionsController,
    getTransactionByHashController,
    getTransactionsByWalletController,
    updateTransactionStatusController
} from "../routes/transactionRoute.js";

const router = express.Router();

router.post("/create", createTransactionController);
router.get("/all", getAllTransactionsController);
router.get("/hash/:txHash", getTransactionByHashController);
router.get("/wallet/:walletAddress", getTransactionsByWalletController);
router.patch("/:txHash/status", updateTransactionStatusController);

export default router;