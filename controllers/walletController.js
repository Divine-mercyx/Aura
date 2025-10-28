import express from "express";
import { getAllAssets } from "../routes/walletRoutes.js";

const walletRouter = express.Router()

walletRouter.get("/assets", getAllAssets);

export default walletRouter;