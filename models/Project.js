import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  name: { type: String, required: true },
  logo: { type: String, default: "" },
  description: { type: String, default: "" },
  github: { type: String, default: "" },
  liveSite: { type: String, default: "" },
  social: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: [CommentSchema], default: []},
  funds: {                                        
    totalRaised: { type: String, default: "0" },
    contributions: [{
      from: String, amount: String, txDigest: String, createdAt: { type: Date, default: Date.now }
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", ProjectSchema);
