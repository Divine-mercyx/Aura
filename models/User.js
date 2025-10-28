import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  handle: { type: String, unique: true, sparse: true },
  image: { type: String },
  trustScore: { type: Number, default: 0 },
  reputationTier: { type: String, default: "Bronze" },
  totalTrades: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
