import Transaction from "../models/Transaction.js";

// Create a new transaction
export const createTransactionController = async (req, res) => {
    try {
        const data = req.body;

        if (!data.txHash || !data.walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Transaction hash and wallet address are required",
            });
        }

        const transaction = new Transaction(data);
        await transaction.save();

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Create transaction error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all transactions
export const getAllTransactionsController = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions,
        });
    } catch (error) {
        console.error("Fetch all transactions error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get a single transaction by hash
export const getTransactionByHashController = async (req, res) => {
    try {
        const { txHash } = req.params;

        if (!txHash) {
            return res.status(400).json({
                success: false,
                message: "Transaction hash is required",
            });
        }

        const transaction = await Transaction.findOne({ txHash });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        console.error("Fetch transaction by hash error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all transactions related to a wallet
export const getTransactionsByWalletController = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Wallet address is required",
            });
        }

        const transactions = await Transaction.find({
            $or: [{ from: walletAddress }, { to: walletAddress }],
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions,
        });
    } catch (error) {
        console.error("Fetch wallet transactions error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update transaction status
export const updateTransactionStatusController = async (req, res) => {
    try {
        const { txHash } = req.params;
        const { status } = req.body;

        if (!txHash || !status) {
            return res.status(400).json({
                success: false,
                message: "Transaction hash and status are required",
            });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { txHash },
            { status },
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction status updated successfully",
            data: updatedTransaction,
        });
    } catch (error) {
        console.error("Update transaction status error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
