import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    sender: { type: String, required: false }, // Changed to false
    receiver: { type: String, required: false }, // Changed to false
    suiExness: { type: String, required: false },
    voiceRecording: { type: [String], required: false },
    emoji: { type: String, required: false },
    message: { type: String, required: false },
    amount: { type: Number, required: false }, // Changed to false
    token: { type: String, default: "SUI" },
    txHash: { type: String, unique: true, required: false }, // Changed to false
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);