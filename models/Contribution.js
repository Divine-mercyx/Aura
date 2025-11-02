import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    },
    contributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        required: true,
    },
    txDigest: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Contribution", contributionSchema);
