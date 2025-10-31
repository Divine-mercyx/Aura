import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    suiExness: { type: String, required: false},
    amount: { type: Number, required: true },
    token: { type: String, default: "SUI" },
    txHash: { type: String, unique: true, required: false },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
