import express from "express";
import { getAllAssets } from "../routes/walletRoutes.js";

const walletRouter = express.Router()

walletRouter.post("/assets", getAllAssets);

export default walletRouter;