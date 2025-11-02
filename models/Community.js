import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cause: {type: String, required: true},
  funds: {
        fundLimit: { type: String, default: "0" },
        totalRaised: { type: String, default: "0" },
        contributions: [
            {
                from: String,
                amount: String,
                txDigest: String,
                createdAt: { type: Date, default: Date.now }
            }
        ]
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Community", communitySchema);
