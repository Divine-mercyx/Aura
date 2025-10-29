import express from "express";
import Message from "../models/Message.js";

const messageRouter = express.Router();

messageRouter.get("/:communityId/messages", async (req, res) => {
  try {
    const messages = await Message.find({ community: req.params.communityId })
      .populate("sender", "username wallet") 
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

export default messageRouter;
