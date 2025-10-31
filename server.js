import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./controllers/userController.js";
import walletRouter from "./controllers/walletController.js";
import projectRouter from "./controllers/projectController.js";
import listRouter from "./controllers/listingController.js";
import communityRouter from "./controllers/communityController.js";
import Message from "./models/Message.js";
import messageRouter from "./controllers/messageController.js";
import transactionRouter from "./controllers/transactionController.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinCommunity", (communityId) => {
    socket.join(communityId);
    console.log(`User joined community ${communityId}`);
  });

  socket.on("leaveCommunity", (communityId) => {
    socket.leave(communityId);
    console.log(`User left community ${communityId}`);
  });

  socket.on("sendMessage", async ({ communityId, senderId, content }) => {
    const message = await Message.create({ community: communityId, sender: senderId, content });
    io.to(communityId).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


app.use("/api/auth", userRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/projects", projectRouter)
app.use("/api/assets/list", listRouter)
app.use("/api/community", communityRouter);
app.use("/api/messages", messageRouter)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));