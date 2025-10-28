import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./controllers/userController.js";
import walletRouter from "./controllers/walletController.js";
import projectRouter from "./controllers/projectController.js";
import listRouter from "./controllers/listingController.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/projects", projectRouter)
app.use("/api/assets/list", listRouter)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));